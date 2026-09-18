/* hscodetoolbox — 装柜计算核心引擎
   对标 SeaRates 核心装箱逻辑：
   - 多货品(纸箱/袋/吨袋/托盘)
   - 体积 + 重量双约束
   - 自动选柜 / 多柜型对比
   - 瓶颈提示(重量或体积先到顶)
   - 输出每柜件数/总CBM/总重/利用率/所需柜数/超重警告
   说明: 体积计算按 外箱/货件 外包络, 不计算柜内精确3D排布像素级优化(简单有效启发式)。
   仅供估算参考。 */
window.ContainerEngine = (function(){
  'use strict';

  // 标准柜内尺寸(mm) 与 最大载重(kg) —— 行业常见近似值
  var CONTAINERS = {
    "20'":  { innerL:5898, innerW:2352, innerH:2393, maxWt:21770, cbm:33.2 },
    "40'":  { innerL:12032,innerW:2352, innerH:2393, maxWt:26780, cbm:67.7 },
    "40'HC":{ innerL:12032,innerW:2352, innerH:2698, maxWt:26580, cbm:76.4 }
  };

  // 货件轴向旋转(6种朝向), 返回 [l,w,h] 组装
  function rotate(l,w,h){
    var a=[[l,w,h],[l,h,w],[w,l,h],[w,h,l],[h,l,w],[h,w,l]];
    return a;
  }

  // 在给定内尺寸容器内, 用简单"层/列"装箱启发式计算最多能放多少件(单一种类)
  // 返回 { count, usedCbm, usedWt, byOrient }
  function packOneKind(c, item){
    var L=c.innerL, W=c.innerW, H=c.innerH;
    var best={count:0,orient:null};
    // 尝试每种朝向
    rotate(item.l,item.w,item.h).forEach(function(o){
      var oL=o[0], oW=o[1], oH=o[2];
      if(oL>L||oW>W||oH>H) return;
      // 沿长度放排, 每排沿宽度放列, 每列沿高度叠层
      var rows=Math.floor(L/oL), cols=Math.floor(W/oW), layers=Math.floor(H/oH);
      var count=rows*cols*layers;
      if(count>best.count){ best={count:count,orient:o,rows:rows,cols:cols,layers:layers}; }
    });
    if(!best.orient) return {count:0,usedCbm:0,usedWt:0};
    var usedCbm = best.count * (item.l*item.w*item.h) / 1e9;
    var usedWt  = best.count * item.wt;
    return {
      count:best.count, usedCbm:usedCbm, usedWt:usedWt,
      orient:best.orient, rows:best.rows, cols:best.cols, layers:best.layers,
      item:item
    };
  }

  // 多货品装箱: 按体积逐类贪心填满每个柜
  // 返回 { containers:[{type,cbm,wt,count,utilCbm,utilWt,items:[{typeName,count,orient}]}], totalCbm, totalWt, totalCount, cbmFirst, wtFirst }
  function pack(items, containerType){
    var c=CONTAINERS[containerType];
    var containers=[];
    // 复制工作队列
    var q=items.map(function(it){ return {it:it, remain:it.quantity}; });
    var totalCbm=0, totalWt=0;
    // 单柜最大可装
    function fillOne(){
      var cbmUsed=0, wtUsed=0, itemsIn={};
      // 先按单件体积降序, 工程上大件先放
      var pool=q.filter(function(x){return x.remain>0;});
      if(!pool.length) return null;
      pool.sort(function(a,b){ var va=a.it.l*a.it.w*a.it.h, vb=b.it.l*b.it.w*b.it.h; return vb-va; });
      pool.forEach(function(entry){
        // 同一货种: 尽量把当前柜装满, 塞不下再交给下一个柜
        while(entry.remain>0){
          var room = c.innerL*c.innerW*c.innerH/1e9 - cbmUsed;
          var itemVol = entry.it.l*entry.it.w*entry.it.h/1e9;
          if(itemVol<=0) break;
          var wtLim = (c.maxWt - wtUsed)/Math.max(entry.it.wt,0.001);
          var volLim = Math.floor(room/itemVol);
          var canFitByVol = Math.max(0, volLim);
          var canFit = Math.min(entry.remain, canFitByVol, Math.floor(wtLim));
          // 用排布上限约束(单件朝向), 不能填满时取一次能放的最小值(≥1)分离处理
          if(canFit>0){
            var one=packOneKind(c,entry.it);
            var oneCount=Math.max(one.count,1);
            canFit=Math.min(canFit, oneCount);
          }
          if(canFit<=0) break; // 当前柜对此货再也装不下
          entry.remain-=canFit;
          cbmUsed+= canFit*itemVol;
          wtUsed += canFit*entry.it.wt;
          itemsIn[entry.it.uid]= (itemsIn[entry.it.uid]||0)+canFit;
          totalCbm+=canFit*itemVol; totalWt+=canFit*entry.it.wt;
          // 单件排布不能让canFit减为0的情况, 若体积/重量都装不下则break(已经canFit<=0)
        }
      });
      return {cbmUsed:cbmUsed, wtUsed:wtUsed, itemsIn:itemsIn};
    }
    // 循环装柜, 直到队列清空
    var guard=0;
    while(q.some(function(x){return x.remain>0;}) && guard<60){
      guard++;
      var filled=fillOne();
      if(!filled) break;
      if(filled.itemsIn && Object.keys(filled.itemsIn).length===0) break; // 无进展终止
      containers.push(filled);
    }
    if(!containers.length){ return {containers:[], totalCbm:0,totalWt:0,totalCount:0}; }

    // 详细装入信息
    var details=containers.map(function(f,idx){
      var dItems=[];
      var ids=Object.keys(f.itemsIn);
      ids.forEach(function(id){
        var it=items.filter(function(x){return x.uid===id;})[0];
        if(it) dItems.push({name:it.name, count:f.itemsIn[id], orient:packOneKind(CONTAINERS[containerType],it).orient||[it.l,it.w,it.h], l:it.l,w:it.w,h:it.h,cbm:it.l*it.w*it.h/1e9,wt:it.wt});
      });
      return { type:containerType, cbm:f.cbmUsed, wt:f.wtUsed, count:Object.keys(f.itemsIn).reduce(function(s,k){return s+f.itemsIn[k];},0), utilCbm:f.cbmUsed/(CONTAINERS[containerType].cbm), utilWt:f.wtUsed/CONTAINERS[containerType].maxWt, items:dItems };
    });
    var totalCount=details.reduce(function(s,c){return s+c.count;},0);
    // 瓶颈: 体积所需柜数 vs 重量所需柜数, 哪个大哪个先到顶
    var c0=CONTAINERS[containerType];
    var volNeeded = totalCbm>0 ? totalCbm/c0.cbm : 0;
    var wtNeeded  = totalWt>0  ? totalWt/c0.maxWt : 0;
    var cbmFirst = volNeeded > wtNeeded;
    return { containers:details, totalCbm:totalCbm, totalWt:totalWt, totalCount:totalCount, cbmFirst:cbmFirst };
  }

  // 自动选柜: 比较各柜型所需柜数, 选柜数最少; 同柜数选 CBM 利用率最高的
  function autoSelect(items){
    var best=null;
    Object.keys(CONTAINERS).forEach(function(type){
      var r=pack(items, type);
      if(!r.containers.length) return;
      var usedCount=r.containers.length;
      var score = r.cbmFirst ? (r.totalCbm/ (usedCount*CONTAINERS[type].cbm)) : (r.totalWt/(usedCount*CONTAINERS[type].maxWt));
      if(!best || usedCount<best.count || (usedCount===best.count && score>best.score)){
        best={type:type,count:usedCount,score:score,result:r};
      }
    });
    return best;
  }

  // 2D三视图数据(俯/侧/正): 生成占位矩形(按当前柜, 简化示意不同规格不同色)
  function generateViews(containerType, items){
    var c=CONTAINERS[containerType];
    var palette=['#1360a6','#2aa06a','#d68a1c','#b2458f','#7a5ad8','#c05a5a','#2c9aa5','#8a9b2f'];
    var views={
      top:{label:'Top (俯视)', w:c.innerW, h:c.innerL, blocks:[]},
      side:{label:'Side view (侧视)', w:c.innerL, h:c.innerH, blocks:[]},
      front:{label:'Front (正视)', w:c.innerW, h:c.innerH, blocks:[]}
    };
    if(!items || !items.length){ return views; }
    var size=0;
    items.forEach(function(it){ if(it.quantity>0) size++; });
    var usable=items.filter(function(it){return it.quantity>0;});
    // 按体积占比分配大致比例绘制示意块(非精确3D投影,用于可视化)
    var totalVol=usable.reduce(function(s,it){return s+it.l*it.w*it.h*it.quantity;},0)||1;
    var accX=0;
    usable.forEach(function(it,idx){
      var vol=it.l*it.w*it.h*it.quantity;
      var fr=Math.min(vol/totalVol, 0.5); // 单类不超半
      var color=palette[idx%palette.length];
      // Top: 用宽度块
      var bw=Math.max(20, c.innerW*Math.sqrt(fr));
      var bl=Math.max(20, c.innerL*Math.sqrt(fr));
      views.top.blocks.push({x:accX%(c.innerW-bw), y:(Math.floor(accX/(c.innerW-bw))* (c.innerL-bl))%(c.innerL-bl), w:bw, l:bl, color:color, label:it.name, idx:idx});
      // Front: 宽×高
      views.front.blocks.push({x:accX%(c.innerW-bw), y:0, w:bw, h:c.innerH*Math.min(fr*2,0.8), color:color, label:it.name, idx:idx});
      // Side: 长×高
      views.side.blocks.push({x:0, y:0, w:c.innerL*Math.min(fr*1.6,0.9), h:c.innerH*Math.min(fr*1.4,0.75), color:color, label:it.name, idx:idx});
      accX+=bw+10;
    });
    return views;
  }

  return {
    CONTAINERS:CONTAINERS,
    pack:pack,
    autoSelect:autoSelect,
    generateViews:generateViews
  };
})();