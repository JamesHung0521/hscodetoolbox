/* ============================================================
   svg.js — 装柜 v2 三视图渲染（俯视 / 侧视 / 等距立体）
   三视图共用同一份逐件 x/y/z 坐标(container-engine-v2.js 的 placed)
   全部原生 SVG，无第三方库；等距视图固定视角(斜45°看柜内堆叠)
   ============================================================ */
var svgCur={ci:0,result:null,type:null};
var svgHost=null;

function renderSVG(r,type){
  svgCur={ci:0,result:r,type:type};
  drawSVG();
}
function svgPrev(){ svgCur.ci=Math.max(0,svgCur.ci-1); drawSVG(); }
function svgNext(){ svgCur.ci=Math.min(svgCur.result.containers.length-1,svgCur.ci+1); drawSVG(); }

function drawSVG(){
  var r=svgCur.result, type=svgCur.type, ci=svgCur.ci;
  var con=E.CONTAINERS[type];
  if(!r.containers.length) return;
  var c=r.containers[ci];
  var wrap=document.getElementById('svgWrap'); wrap.innerHTML='';
  svgHost=wrap;
  var legend=document.getElementById('legendBox'); legend.innerHTML='';
  // 图例
  var uidLegend={};
  r.containers.forEach(function(cc){ cc.placed.forEach(function(p){ if(!uidLegend[p.uid]) uidLegend[p.uid]=p.name; }); });
  Object.keys(uidLegend).forEach(function(uid,i){
    legend.innerHTML+='<span class="lg"><span class="sw" style="background:'+PALETTE[i%PALETTE.length]+'"></span>'+uidLegend[uid]+'</span>';
  });
  legend.innerHTML+='<span class="lg"><span class="sw" style="background:'+CONTAINER_C+'"></span>Container wall</span>';

  // 顶部"柜切换" + 汇总
  var cap=document.createElement('div');
  cap.style.cssText='width:100%;font-size:12px;color:#5a7186;margin-bottom:6px;';
  cap.innerHTML='<b style="color:#0f4c8a">Container '+(ci+1)+' / '+r.containers.length+'</b> ('+type+')';
  if(r.containers.length>1){
    cap.innerHTML+=' <button class="ghost" style="padding:2px 8px;font-size:11px" onclick="svgPrev()">◀ Previous</button> <button class="ghost" style="padding:2px 8px;font-size:11px" onclick="svgNext()">Next ▶</button>';
  }
  cap.innerHTML+=' <span style="color:#8aa0b5;font-size:11px">'+c.count+' pcs · CBM '+(c.cbm).toFixed(1)+' ('+(c.utilCbm*100).toFixed(0)+'%) · '+c.wt+'kg</span>';
  wrap.appendChild(cap);

  // 三张图：竖排 Isometric → Top → Side（主人手绘要求）
  drawIso(con,c);
  drawTop(con,c);
  drawSide(con,c);
}

/* ---------- 俯视 Top（柜宽W横 × 柜长L纵） ---------- */
/* ---------- 俯视 Top（柜长L横 × 柜宽W纵，真实等比；40'为细长横条） ---------- */
function drawTop(con,c){
  // 柜长横放：横向=innerL(柜长)、纵向=innerW(柜宽)，按真实长宽比；40' → 430×84px 长条
  var PAD=18; // 底部标注带
  var topW=430, topH=Math.max(32, topW*con.innerW/con.innerL);
  var svg=svgBox(topW, topH+PAD, 'Top View — length × width · floor layout');
  var sx=topW/con.innerL, sy=topH/con.innerW;
  drawFrame(svg,topW,topH,CONTAINER_C);
  // 柜门方向: 柜长尽头(x=max)为开口端, 画门缝 + Door 标注(文字移进框内右端保证完整可见)
  var doorTop=document.createElementNS(NS,'line');
  doorTop.setAttribute('x1',topW-1);doorTop.setAttribute('y1',1);doorTop.setAttribute('x2',topW-1);doorTop.setAttribute('y2',topH-1);
  doorTop.setAttribute('stroke','#c05a2a');doorTop.setAttribute('stroke-width',2);doorTop.setAttribute('stroke-dasharray','3 2');
  svg.appendChild(doorTop);
  var dtText=svgText(topW-16, Math.max(14, Math.min(topH-4, Math.floor(topH/2)+3)), 'Door', 10, '#c05a2a', true);
  dtText.setAttribute('fill-opacity','0.95');
  svg.appendChild(dtText);
  // 尺寸标注带(柜体底部外, 不压货不溢出): 长L × 宽W —— 与等距图信息对等
  svg.appendChild(svgText(topW/2, topH+PAD-6, 'L '+(con.innerL/CM2MM)+'cm  ×  W '+(con.innerW/CM2MM)+'cm', 10, '#0b3a6b', true));
  c.placed.forEach(function(p){
    // 俯视: 货沿柜长x(横)·沿柜宽y(纵) 排布
    svgRect(svg, p.x*sx, p.y*sy, p.l*sx, p.w*sy, PALETTE[pidx(p.uid)], 0.88);
  });
}

/* ---------- 侧视 Side（柜长L横 × 柜高H纵，看堆叠） ---------- */
function drawSide(con,c){
  var PAD=18; // 底部标注带
  var sideW=430, sideH=Math.min(260, sideW*con.innerH/con.innerL);
  var svg=svgBox(sideW, sideH+PAD, 'Side View — length × height · stacking');
  var sx=sideW/con.innerL, sy=sideH/con.innerH;
  drawFrame(svg,sideW,sideH,CONTAINER_C);
  // 柜门方向: 长向尽头(右侧)为开口端
  var doorSide=document.createElementNS(NS,'line');
  doorSide.setAttribute('x1',sideW-1);doorSide.setAttribute('y1',1);doorSide.setAttribute('x2',sideW-1);doorSide.setAttribute('y2',sideH-1);
  doorSide.setAttribute('stroke','#c05a2a');doorSide.setAttribute('stroke-width',2);doorSide.setAttribute('stroke-dasharray','3 2');
  svg.appendChild(doorSide);
  svg.appendChild(svgText(sideW-16, 16, 'Door', 10, '#c05a2a', true));
  // 尺寸标注带(柜体底部外, 不压货不溢出): 长L × 高H —— 与等距图信息对等
  svg.appendChild(svgText(sideW/2, sideH+PAD-6, 'L '+(con.innerL/CM2MM)+'cm  ×  H '+(con.innerH/CM2MM)+'cm', 10, '#0b3a6b', true));
  c.placed.forEach(function(p){
    // 侧视: 长L横、高H纵, y(柜宽)压缩进单排; z堆叠朝上
    var x=p.x*sx, y=(con.innerH-p.z-p.h)*sy, w=p.l*sx, h=p.h*sy;
    svgRect(svg,x,y,w,h,PALETTE[pidx(p.uid)],0.88);
  });
}

/* ============================================================
   等距立体图 (Isometric / Axonometric)
   固定斜45°视角看柜内堆叠。投影规则(等比):
     X_screen = (x - z)*cos30            (x 柜长 向右斜)
     Y_screen = (x + z)*sin30 - y        (y 柜宽 向下, z 高度 向上分量)
   每件按 x/y/z 投影成平行四边形：顶面 + 两个可见侧面(明暗)
   容器：半透明等距盒 + 线框 + 尺寸标注(长·宽·高 cm)
   ============================================================ */
var NS='http://www.w3.org/2000/svg';
function _iso(w_,d_,h_){ // w:柜长方向 x, d:柜宽方向 y, h:高度
  var c30=Math.sqrt(3)/2; // ~0.866
  var s30=0.5;
  return { x: (w_ - h_)*c30, y: (w_ + h_)*s30 - d_ };
}
function drawIso(con,c){
  var w=520, h=430;
  var svg=svgBox(w, h, 'Isometric View — fixed 45° into the container', true);
  // 投影方向定义: 柜长沿 +X(is 向右), 高沿 H(左上反), 柜宽沿 -Y(右下前)
  // 重新定义坐标系让柜长横放、宽向前、高向上, 更像 loadspace
  // 约定: 用 (len, wid, hgt) -> 屏幕
  function proj(len, wid, hgt){
    // 调整: 让"柜长向右, 柜高向上, 柜宽向前下方"
    var c30=0.866, s30=0.5;
    return { x: len*c30 - wid*c30, y: -hgt + len*s30 + wid*s30 };
  }
  var L=con.innerL, W=con.innerW, H=con.innerH;
  // 计算整体边界定 scale & 偏移
  var pts=[
    proj(0,0,0), proj(L,0,0), proj(0,W,0), proj(0,0,H),
    proj(L,W,0), proj(L,0,H), proj(0,W,H), proj(L,W,H)
  ];
  var minX=Infinity,maxX=-Infinity,minY=Infinity,maxY=-Infinity;
  pts.forEach(function(q){ if(q.x<minX)minX=q.x; if(q.x>maxX)maxX=q.x; if(q.y<minY)minY=q.y; if(q.y>maxY)maxY=q.y; });
  var spx=w/(maxX-minX), spy=h/(maxY-minY);
  // 容器缩放留 padding(约8%边距)，方便尺寸标注落在容器外侧空白，不压货、不裁切
  var S=Math.min(spx,spy)*0.80;
  var offX=(w-(maxX-minX)*S)/2, offY=(h-(maxY-minY)*S)/2;
  function P(len,wid,hgt){ var q=proj(len,wid,hgt); return {x:offX+(q.x-minX)*S, y:offY+(q.y-minY)*S}; }
  function v(len,wid,hgt){ return P(len,wid,hgt); }

  // --- 容器：后面板(半透明)+线框 ---
  // 由于视角从"右前上"看, 可见柜壁面：顶面、前面(柜长×高)、右面(柜宽×高)
  // 半透明等距盒：画顶面(浅) + 前面 + 右面 的容器填充，作为底
  var A=v(0,0,H), B=v(L,0,H), C=v(L,W,H), D=v(0,W,H); // 顶面四角
  var A0=v(0,0,0), B0=v(L,0,0), C0=v(L,W,0), D0=v(0,W,0); // 底面四角
  // 顶面(半透明淡蓝)
  poly(svg,[A,B,C,D],'rgba(15,76,138,0.10)','none',1);
  // 前面(柜长×高): A-B 面(朝向观察者右侧)
  poly(svg,[A,B,B0,A0],'rgba(15,76,138,0.06)','none',1);
  // 右面(柜宽×高): B-C 面
  poly(svg,[B,C,C0,B0],'rgba(15,76,138,0.06)','none',1);
  // 容器线框(所有12条棱)
  var edge=[[A,B],[B,C],[C,D],[D,A],[A0,B0],[B0,C0],[C0,D0],[D0,A0],[A,A0],[B,B0],[C,C0],[D,D0]];
  edge.forEach(function(e){
    line(svg,e[0],e[1],CONTAINER_C,1.6);
  });

  // --- 货物：按 x/y/z 投影成平行四边形, 前下近优先绘制(手绘遮挡: 远先画近后画) ---
  // 排序: 沿"柜长+柜宽"更近的/view更靠前的后画(可见), 这里按 (x+y) 小先画, 大的后画
  var placed=c.placed.slice().sort(function(a,b){ return (a.x+a.y)-(b.x+b.y); });
  // 件号(可选): 仅当件数较少时显示, 避免海量件号糊成一片(工具站默认关闭)
    var showUID = SHOW_ISO_LABEL && placed.length<=60;
    placed.forEach(function(p){
      var col=PALETTE[pidx(p.uid)];
    // 六角投影点
    // 货物在柜内坐标: 货的棱 = 柜长x / 柜宽y / 柜高z 三个方向
    var x0=p.x,y0=p.y,z0=p.z, x1=p.x+p.l, y1=p.y+p.w, z1=p.z+p.h;
    var corners={
      '000':v(x0,y0,z0),'100':v(x1,y0,z0),'110':v(x1,y1,z0),'010':v(x0,y1,z0),
      '001':v(x0,y0,z1),'101':v(x1,y0,z1),'111':v(x1,y1,z1),'011':v(x0,y1,z1)
    };
    // 可见面: 顶面(001,101,111,011) + 右前面(沿x, 101,111,110,100) + 前面(沿y, 011,111,110,010)
    // 顶面
    poly(svg,[corners['001'],corners['101'],corners['111'],corners['011']], shade(col,0.30),'rgba(255,255,255,0.35)',1);
    // 右面(柜长方向 x): 101,111,110,100 —— 较亮侧面
    poly(svg,[corners['101'],corners['111'],corners['110'],corners['100']], shade(col,0.10),'rgba(255,255,255,0.2)',1);
    // 前/侧(柜宽方向 y): 011,111,110,010 —— 较暗侧面
    poly(svg,[corners['011'],corners['111'],corners['110'],corners['010']], shade(col,-0.22),'rgba(0,0,0,0.12)',1);
    // 件号(可选): 显示件序号
    if(showUID){
      var cc=corners['111'];
      var txt=svgText(cc.x,cc.y-4, p.uid.replace(/\D/g,'')||'', 9, '#13293d', true);
      svg.appendChild(txt);
    }
  });

  // --- 尺寸标注(长·宽·高 cm)，平移到容器外侧空白，不压货、不裁切 ---
  var LB=(L/CM2MM), WB=(W/CM2MM), HB=(H/CM2MM);
  // L(长)标柜长底前缘：向观察者下方平移
  var l1=P(0,0,0), l2=P(L,0,0);
  isoDim(svg,l1,l2,'L '+LB+'cm', 0, 20);
  // W(宽)标柜宽右底棱：往右前外侧平移
  var r1=P(L,0,0), r2=P(L,W,0);
  isoDim(svg,r1,r2,'W '+WB+'cm', 22, 22);
  // H(高)标柜高右侧竖棱：往右侧空白平移
  var hb1=P(L,0,0), hb2=P(L,0,H);
  isoDim(svg,hb1,hb2,'H '+HB+'cm', 26, 0);
}
// 件号显示开关: 页面可经 window.SHOW_ISO_LABEL 覆盖(工具站置 false); 另加 placed<=60 阈值双保险
var SHOW_ISO_LABEL=(typeof window!=='undefined' && window.SHOW_ISO_LABEL!==undefined) ? !!window.SHOW_ISO_LABEL : true;

/* ---------- 通用 SVG 图元 ---------- */
function svgBox(w,h,title,iso){
  var v=document.createElement('div'); v.className='view-box'+(iso?' view-box-iso':'');
  v.innerHTML='<h3>'+title+'</h3>';
  var s=svgEl(w,h,(iso?'iso':'')); v.appendChild(s);
  svgHost.appendChild(v);
  return s;
}
function svgEl(w,h,kind){
  var s=document.createElementNS(NS,'svg');
  s.setAttribute('viewBox','0 0 '+w+' '+h);
  s.setAttribute('preserveAspectRatio','xMidYMid meet');
  s.style.width='100%'; s.style.height='auto'; s.style.display='block';
  if(kind==='iso') s.style.maxWidth='660px'; // 等距图限宽，避免满宽后过高占大半屏
  s.style.margin='0 auto';
  s.style.border='1px solid #e3eaf2'; s.style.borderRadius='6px';
  return s;
}
function drawFrame(svg,w,h,color){
  var r=document.createElementNS(NS,'rect');
  r.setAttribute('x',1);r.setAttribute('y',1);r.setAttribute('width',w-2);r.setAttribute('height',h-2);
  r.setAttribute('fill','#ffffff');r.setAttribute('stroke',color);r.setAttribute('stroke-width',2.2);r.setAttribute('rx',2);
  svg.appendChild(r);
  for(var i=5;i<w;i+=5){ var l=document.createElementNS(NS,'line'); l.setAttribute('x1',i);l.setAttribute('y1',1);l.setAttribute('x2',i);l.setAttribute('y2',h-1);l.setAttribute('stroke','#e9f0f7');l.setAttribute('stroke-width',0.6); svg.appendChild(l); }
  for(var j=5;j<h;j+=5){ var ll=document.createElementNS(NS,'line'); ll.setAttribute('x1',1);ll.setAttribute('y1',j);ll.setAttribute('x2',w-1);ll.setAttribute('y2',j);ll.setAttribute('stroke','#e9f0f7');ll.setAttribute('stroke-width',0.6); svg.appendChild(ll); }
}
function svgRect(svg,x,y,w,h,col,op){
  var r=document.createElementNS(NS,'rect');
  r.setAttribute('x',x+0.5);r.setAttribute('y',y+0.5);r.setAttribute('width',Math.max(1.2,w-1));r.setAttribute('height',Math.max(1.2,h-1));
  r.setAttribute('fill',col);r.setAttribute('fill-opacity',op);r.setAttribute('stroke','#ffffff');r.setAttribute('stroke-width',0.8);
  svg.appendChild(r);
}
function poly(svg,pts,fill,stroke,sw){
  var p=document.createElementNS(NS,'polygon');
  var points=pts.map(function(q){ return round1(q.x)+','+round1(q.y); }).join(' ');
  p.setAttribute('points',points);
  p.setAttribute('fill',fill);
  p.setAttribute('stroke',stroke&&stroke!=='none'?stroke:'#ffffff');
  p.setAttribute('stroke-width',sw);
  p.setAttribute('stroke-linejoin','round');
  svg.appendChild(p);
}
function line(svg,a,b,color,w){
  var l=document.createElementNS(NS,'line');
  l.setAttribute('x1',round1(a.x));l.setAttribute('y1',round1(a.y));
  l.setAttribute('x2',round1(b.x));l.setAttribute('y2',round1(b.y));
  l.setAttribute('stroke',color);l.setAttribute('stroke-width',w);l.setAttribute('stroke-linecap','round');
  svg.appendChild(l);
}
function svgText(x,y,str,size,fill,anchorMid){
  var t=document.createElementNS(NS,'text');
  t.setAttribute('x',round1(x));t.setAttribute('y',round1(y));
  t.setAttribute('font-size',size);t.setAttribute('fill',fill);
  if(anchorMid) t.setAttribute('text-anchor','middle');
  t.setAttribute('font-family','Arial, sans-serif');
  t.textContent=str;
  return t;
}
function dimLine(svg,a,b,label){
  line(svg,a,b,'rgba(11,58,107,0.55)',1.3);
  var mid={x:(a.x+b.x)/2,y:(a.y+b.y)/2};
  var t=svgText(mid.x,mid.y-6,label,10,'#0b3a6b',true);
  svg.appendChild(t);
  // 端点小圆
  [a,b].forEach(function(q){
    var c=document.createElementNS(NS,'circle');
    c.setAttribute('cx',round1(q.x));c.setAttribute('cy',round1(q.y));c.setAttribute('r',2);
    c.setAttribute('fill','#0b3a6b'); svg.appendChild(c);
  });
}
// 等距尺寸标注：整条标注线沿 (dx,dy) 平移到容器外侧空白，不压货、不裁切
function isoDim(svg,a,b,label,dx,dy){
  var a2={x:a.x+dx,y:a.y+dy}, b2={x:b.x+dx,y:b.y+dy};
  line(svg,a2,b2,'rgba(11,58,107,0.55)',1.3);
  var mid={x:(a2.x+b2.x)/2,y:(a2.y+b2.y)/2};
  var t=svgText(mid.x,mid.y-6,label,10,'#0b3a6b',true);
  svg.appendChild(t);
  [a2,b2].forEach(function(q){
    var c=document.createElementNS(NS,'circle');
    c.setAttribute('cx',round1(q.x));c.setAttribute('cy',round1(q.y));c.setAttribute('r',2);
    c.setAttribute('fill','#0b3a6b'); svg.appendChild(c);
  });
}
function shade(hex,amt){
  var h=hex.replace('#',''); var r=parseInt(h.substr(0,2),16),g=parseInt(h.substr(2,2),16),b=parseInt(h.substr(4,2),16);
  function c(v){ v=Math.round(v*(1+amt)); return Math.max(0,Math.min(255,v)); }
  return 'rgb('+c(r)+','+c(g)+','+c(b)+')';
}
function round1(n){ return Math.round(n*10)/10; }
function pidx(uid){ return Math.abs(String(uid).split('').reduce(function(a,c){return a+c.charCodeAt(0);},0))%PALETTE.length; }