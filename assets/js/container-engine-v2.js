/* ============================================================
   hscodetoolbox — 装柜计算核心引擎 v2 (demo)
   ---- 相对 v1 的核心变化 ----
   1. 混合落位：多货品在同一柜内交错排布(corner-point 贪心+空间切割)，而非 v1 的"每货单品类独立铺排"
   2. 逐件 x/y/z + 朝向：每件货物都有明确的柜内坐标(单位 mm)与 6 朝向之一
   3. stackable / stackLayers 真正生效：不可叠件上方不再放置；可叠件垛高受 stackLayers 限制
   4. 底部支撑隐含：新件底面必须贴合柜底或已放件顶面(空间法天然保证)
   5. 保留：体积+重量双约束、自动选柜、分柜装、性能哨兵(free-space 数量/件数上限)
   6. 输出逐件坐标数据(placed)，供三视图(俯视/侧视/等距SVG)共用同一份坐标，禁两套
   ---- 说明 ----
   仅估算参考，启发式非最优解。纯静态、无依赖，浏览器与 Node 均可加载。
   ============================================================ */
window.ContainerEngineV2 = (function(){
  'use strict';

  // 标准柜内尺寸(mm) 与 最大载重(kg)
  var CONTAINERS = {
    "20'":   { innerL:5898, innerW:2352, innerH:2393, maxWt:21770, cbm:33.2 },
    "40'":   { innerL:12032,innerW:2352, innerH:2393, maxWt:26780, cbm:67.7 },
    "40'HC": { innerL:12032,innerW:2352, innerH:2698, maxWt:26580, cbm:76.4 }
  };

  // 6 种朝向
  function rotate(l,w,h){
    return [[l,w,h],[l,h,w],[w,l,h],[w,h,l],[h,l,w],[h,w,l]];
  }

  // ---- 单件能否放进空闲空间(考虑朝向) ----
  // free:{x,y,z,l,w,h} 空间原点与尺寸(原点即放置角, 底面贴合)
  // free.depth 为垛层数; maxLayers 为货品可叠层数, 不传则不限制
  function tryFit(free, dl, dw, dh, maxLayers){
    var cand=[];
    rotate(dl,dw,dh).forEach(function(o){
      if(o[0]<=free.l && o[1]<=free.w && o[2]<=free.h){
        if(maxLayers!=null && (free.depth||0)>=maxLayers) return; // 已达该垛可叠层数上限
        cand.push({l:o[0],w:o[1],h:o[2],x:free.x,y:free.y,z:free.z});
      }
    });
    return cand;
  }

  // ---- guillotine 切割：放件后把 free 剩余切为互不重叠的 3 块 ----
  // 返回剩余空间数组；stackable=false 时移除顶部块(上方不再放件)
  // free.depth = 该空间底面所在垛已叠层数(仅顶部块递增, 侧块归0)
  function guillotine(free, box, allowTop){
    var out=[];
    var rightL=free.l-box.l, rightW=free.w-box.w, topH=free.h-box.h;
    if(rightL>1){ out.push({x:free.x+box.l,y:free.y,z:free.z,l:rightL,w:free.w,h:free.h,depth:0}); }
    if(rightW>1){ out.push({x:free.x,y:free.y+box.w,z:free.z,l:box.l,w:rightW,h:free.h,depth:0}); }
    if(topH>1 && allowTop){ out.push({x:free.x,y:free.y,z:free.z+box.h,l:box.l,w:box.w,h:topH,depth:(free.depth||0)+1}); }
    return out;
  }

  // ---- 检测两 box 是否重叠 ----
  function overlap(b1,b2){
    return b1.x < b2.x+b2.l && b1.x+b1.l > b2.x &&
           b1.y < b2.y+b2.w && b1.y+b1.w > b2.y &&
           b1.z < b2.z+b2.h && b1.z+b2.h > b2.z &&
           b1.z+b1.h > b2.z;
  }
  // 一个候选 box 是否与已放件列表冲突
  function conflicts(box, placed){
    for(var i=0;i<placed.length;i++){
      var p=placed[i];
      if(box.x < p.x+p.l && box.x+box.l > p.x &&
         box.y < p.y+p.w && box.y+box.w > p.y &&
         box.z < p.z+p.h && box.z+box.h > p.z) return true;
    }
    return false;
  }

  // ---- 单柜装箱：corner-point 贪心(按件逐个放置) ----
  function fillContainer(c, items){
    var L=c.innerL,W=c.innerW,H=c.innerH;
    var frees=[{x:0,y:0,z:0,l:L,w:W,h:H,depth:0}];
    var placed=[];
    var count=0,cbm=0,wt=0;
    var FREE_LIMIT=3000, ITEM_LIMIT=1500;
    // 展开逐件 + 体积降序
    var queue=[];
    items.forEach(function(it){
      var n=Math.max(0,Math.floor(+it.quantity)||0);
      for(var i=0;i<n;i++) queue.push({uid:it.uid,name:it.name,l:it.l,w:it.w,h:it.h,wt:it.wt,stackable:!!it.stackable,stackLayers:(it.stackLayers==null?null:Math.max(1,+it.stackLayers||1))});
    });
    queue.sort(function(a,b){ if(!!a.stackable!==!!b.stackable) return a.stackable?1:-1; return (b.l*b.w*b.h)-(a.l*a.w*a.h); });

    for(var qi=0; qi<queue.length && placed.length<ITEM_LIMIT; qi++){
      var q=queue[qi];
      if(wt+q.wt > c.maxWt+0.001) continue;
      var vol=q.l*q.w*q.h/1e9;
      if(cbm+vol > c.cbm+0.001) continue;

      // 收集所有可行候选(空间×朝向)，选 z 最低、再小空间优先
      var best=null;
      for(var fi=0; fi<frees.length; fi++){
        var f=frees[fi];
        var fits=tryFit(f,q.l,q.w,q.h, q.stackable?(q.stackLayers==null?null:q.stackLayers):1);
        for(var k=0;k<fits.length;k++){
          var bt=fits[k];
          var cand={x:bt.x,y:bt.y,z:bt.z,l:bt.l,w:bt.w,h:bt.h};
          if(conflicts(cand,placed)) continue;
          var score=bt.z*1e6 + (f.l*f.w*f.h);
          if(!best || score<best.score){ best={cand:cand,fi:fi,f:f,score:score}; }
        }
      }
      if(!best) continue; // 当前件放不进，试下一件(空间可能够更小件)，勿停整柜
      // 占位
      var b=best.cand;
      var removed=frees.splice(best.fi,1)[0];
      var remain=guillotine(removed,{x:b.x,y:b.y,z:b.z,l:b.l,w:b.w,h:b.h}, q.stackable);
      // 去重合并(避免与既有 frees 重叠的重复块)
      remain.forEach(function(rb){
        // 简单去重：跳过被已放件覆盖的或与现有块完全相同的
        if(conflicts(rb,placed)) return;
        frees.push(rb);
      });
      if(frees.length>FREE_LIMIT) break;

      placed.push({uid:q.uid,name:q.name,l:b.l,w:b.w,h:b.h,x:b.x,y:b.y,z:b.z,wt:q.wt,stackable:q.stackable});
      count++; cbm+=vol; wt+=q.wt;
    }

    // 归并明细
    var itemsIn={}; placed.forEach(function(p){ itemsIn[p.uid]=(itemsIn[p.uid]||0)+1; });
    var details=Object.keys(itemsIn).map(function(uid){
      var it=models[uid];
      return {name:it.name,count:itemsIn[uid],l:it.l,w:it.w,h:it.h,cbm:it.l*it.w*it.h/1e9,wt:it.wt,orient:[it.l,it.w,it.h]};
    });
    return {type:c.name,cbm:cbm,wt:wt,count:count,utilCbm:cbm/c.cbm,utilWt:wt/c.maxWt,placed:placed,items:details};
  }
  var models={}; // uid -> item 模型(供归并), 每次 pack 重置

  // ---- 多货装箱 ----
  function pack(items, containerType){
    var c=CONTAINERS[containerType]; if(!c) return {containers:[],totalCbm:0,totalWt:0,totalCount:0};
    c.name=containerType;
    models={}; items.forEach(function(it){ models[it.uid]=it; });
    var containers=[], totalCbm=0,totalWt=0,totalCount=0;
    var remaining=items.map(function(it){return {it:it,remain:Math.max(0,Math.floor(+it.quantity)||0)};});
    var guard=0;
    while(remaining.some(function(r){return r.remain>0;}) && guard<60){
      guard++;
      var batch=remaining.filter(function(r){return r.remain>0;}).map(function(r){
        return {uid:r.it.uid,name:r.it.name,l:r.it.l,w:r.it.w,h:r.it.h,wt:r.it.wt,quantity:r.remain,stackable:r.it.stackable,stackLayers:r.it.stackLayers};
      });
      var fc=fillContainer(c,batch);
      if(!fc.count) break;
      containers.push(fc);
      var byUid={}; fc.placed.forEach(function(p){ byUid[p.uid]=(byUid[p.uid]||0)+1; });
      remaining.forEach(function(r){ if(byUid[r.it.uid]) r.remain=Math.max(0,r.remain-byUid[r.it.uid]); });
      totalCbm+=fc.cbm; totalWt+=fc.wt; totalCount+=fc.count;
    }
    var c0=CONTAINERS[containerType];
    var volNeeded=totalCbm/(c0.cbm||1), wtNeeded=totalWt/(c0.maxWt||1);
    var cbmFirst=volNeeded>wtNeeded;
    return {containers:containers,totalCbm:totalCbm,totalWt:totalWt,totalCount:totalCount,cbmFirst:cbmFirst};
  }

  // 自动选柜
  function autoSelect(items){
    var best=null;
    Object.keys(CONTAINERS).forEach(function(type){
      var r=pack(items,type);
      if(!r.containers.length) return;
      var usedCount=r.containers.length;
      var score=r.cbmFirst? (r.totalCbm/(usedCount*CONTAINERS[type].cbm)) : (r.totalWt/(usedCount*CONTAINERS[type].maxWt));
      if(!best||usedCount<best.count||(usedCount===best.count&&score>best.score)){
        best={type:type,count:usedCount,score:score,result:r};
      }
    });
    return best;
  }

  // ---- 逐件→按层/排行(供明细表与SVG) ----
  // 层: 按 z 分组(双精度容差 2mm)；排: 同层内按 y(row/排) 分组，再按 x 排序
  function groupByLayerRow(placed){
    var layers=[]; // [{z, h(layer高=该层max顶层), items:[{..,row}]}]
    var byZ={};
    placed.forEach(function(p){
      var key=Math.round(p.z);
      if(!byZ[key]) byZ[key]=[];
      byZ[key].push(p);
    });
    Object.keys(byZ).sort(function(a,b){return +a-+b;}).forEach(function(z){
      var items=byZ[z];
      var topH=0; items.forEach(function(p){ var t=p.z+p.h; if(t>topH)topH=t; });
      // 按 y 分排(row), x 排序
      var byY={};
      items.forEach(function(p){ var yk=Math.round(p.y); (byY[yk]=byY[yk]||[]).push(p); });
      var rows=Object.keys(byY).sort(function(a,b){return +a-+b;}).map(function(yk){
        var arr=byY[yk].sort(function(a,b){return a.x-b.x;});
        return {y:+yk, items:arr};
      });
      layers.push({z:+z, topH:topH, rows:rows, count:items.length});
    });
    return layers;
  }

  return {
    CONTAINERS:CONTAINERS,
    rotate:rotate,
    pack:pack,
    autoSelect:autoSelect,
    groupByLayerRow:groupByLayerRow
  };
})();