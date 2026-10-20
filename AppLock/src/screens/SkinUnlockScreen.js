import React, { useRef, useCallback } from "react";
import { View, StyleSheet, Dimensions, TouchableOpacity, Text } from "react-native";
import { WebView } from "react-native-webview";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppLock } from "../context/AppLockContext";
import { getSkinById } from "../data/pigSkins";
import { SKIN_CSS, SKIN_EXTRAS_HTML, SKIN_CLASS } from "../data/pigSkinHTML";
import { heavyTap, successTap } from "../utils/haptics";
import { getLevel, getPigScale } from "../utils/pigWeight";
import CloseButton from "../components/CloseButton";

const { width: SW, height: SH } = Dimensions.get("window");

function buildCrateHTML(skin, level) {
  const ps = getPigScale(level);
  const rc = {
    common: { glow: "#F7A0B2", bar: "#2D2D2D", barEnd: "#F7A0B2" },
    rare: { glow: "#4A93D6", bar: "#4A93D6", barEnd: "#6BB5F0" },
    epic: { glow: "#9C6FE0", bar: "#9C6FE0", barEnd: "#C9A4F5" },
    legendary: { glow: "#F0A93A", bar: "#F0A93A", barEnd: "#FFD86B" },
  }[skin.rarity] || { glow: "#F7A0B2", bar: "#2D2D2D", barEnd: "#F7A0B2" };

  const skinCSS = SKIN_CSS[skin.id] || "";
  const skinClass = SKIN_CLASS[skin.id] || "";
  const skinExtras = SKIN_EXTRAS_HTML[skin.id] || "";

  return `<!DOCTYPE html>
<html><head><meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">
<style>
*{margin:0;padding:0;box-sizing:border-box;-webkit-tap-highlight-color:transparent;-webkit-user-select:none;user-select:none}
html,body{width:100%;height:100%;overflow:hidden;
  font-family:-apple-system,BlinkMacSystemFont,"SF Pro Rounded",sans-serif;
  background:linear-gradient(180deg,#EDE8E4,#F5CCD5);
  display:flex;align-items:center;justify-content:center}
.scene{position:relative;width:100%;height:100%;display:flex;align-items:center;justify-content:center;overflow:hidden}

/* ===== WEATHERED WOODEN CRATE — 3D look ===== */
.crate{position:absolute;width:170px;height:170px;cursor:pointer;z-index:5;
  filter:drop-shadow(0 24px 40px rgba(0,0,0,.6));transform-style:preserve-3d;
  transform:perspective(400px) rotateX(4deg) rotateY(-6deg)}

/* Front face */
.face{position:absolute;inset:0;border-radius:6px;overflow:hidden;
  background:linear-gradient(180deg,#8B7355 0%,#6B5740 15%,#7A6448 30%,#5E4A36 50%,#6F5B44 70%,#584832 85%,#4A3C2A);
  box-shadow:inset 4px 4px 12px rgba(255,220,170,.15),inset -4px -6px 12px rgba(20,10,0,.5),
    0 0 0 2px rgba(40,25,10,.6)}

/* Horizontal planks */
.plank-line{position:absolute;left:0;right:0;height:2px;
  background:linear-gradient(90deg,rgba(30,18,8,.5),rgba(30,18,8,.25) 20%,rgba(30,18,8,.4) 50%,rgba(30,18,8,.2) 80%,rgba(30,18,8,.5))}
.pl1{top:14%}.pl2{top:28%}.pl3{top:42%}.pl4{top:56%}.pl5{top:70%}.pl6{top:84%}

/* Wood grain texture lines */
.grain{position:absolute;left:0;right:0;height:1px;opacity:.2;
  background:linear-gradient(90deg,transparent 5%,rgba(160,130,90,.4) 15%,transparent 25%,rgba(160,130,90,.3) 40%,transparent 55%,rgba(160,130,90,.4) 70%,transparent 85%)}

/* Vertical iron brackets — left and right */
.bracket{position:absolute;top:6px;bottom:6px;width:18px;z-index:2;
  background:linear-gradient(90deg,#4A4A52 0%,#6A6A72 30%,#5A5A62 50%,#4A4A52 70%,#3A3A42);
  box-shadow:inset 1px 2px 3px rgba(255,255,255,.2),inset -1px -2px 3px rgba(0,0,0,.4),
    2px 0 4px rgba(0,0,0,.3)}
.bracket.l{left:6px;border-radius:3px}.bracket.r{right:6px;border-radius:3px}

/* Corner plates */
.corner{position:absolute;width:26px;height:26px;z-index:3;
  background:linear-gradient(135deg,#5A5A64,#3A3A44);border-radius:3px;
  box-shadow:inset 1px 1px 2px rgba(255,255,255,.2),inset -1px -1px 2px rgba(0,0,0,.4),0 2px 4px rgba(0,0,0,.3)}
.corner.tl{top:0;left:0}.corner.tr{top:0;right:0}
.corner.bl{bottom:0;left:0}.corner.br{bottom:0;right:0}

/* Nails/rivets */
.nail{position:absolute;width:6px;height:6px;border-radius:50%;z-index:4;
  background:radial-gradient(circle at 35% 30%,#7A7A84,#4A4A54);
  box-shadow:inset 0 1px 1px rgba(255,255,255,.3),0 1px 2px rgba(0,0,0,.5)}
.n1{top:8px;left:8px}.n2{top:8px;right:8px}.n3{bottom:8px;left:8px}.n4{bottom:8px;right:8px}
.n5{top:8px;left:50%;margin-left:-3px}.n6{bottom:8px;left:50%;margin-left:-3px}
.n7{top:50%;left:8px;margin-top:-3px}.n8{top:50%;right:8px;margin-top:-3px}

/* Horizontal iron band across middle */
.hband{position:absolute;left:6px;right:6px;top:50%;margin-top:-5px;height:10px;z-index:2;border-radius:2px;
  background:linear-gradient(180deg,#5A5A64 0%,#7A7A84 40%,#5A5A64 60%,#4A4A54);
  box-shadow:inset 1px 1px 2px rgba(255,255,255,.25),0 2px 3px rgba(0,0,0,.3)}

/* Rarity glow behind crate */
.crate-glow{position:absolute;width:220px;height:220px;border-radius:50%;z-index:0;
  background:radial-gradient(circle,${rc.glow}35,transparent 55%);
  animation:cglow 2.2s ease-in-out infinite}
@keyframes cglow{0%,100%{opacity:.35;transform:scale(1)}50%{opacity:.65;transform:scale(1.06)}}

/* Question mark */
.qmark{position:absolute;z-index:5;font-size:48px;font-weight:900;
  background:linear-gradient(180deg,${rc.bar},${rc.barEnd});
  -webkit-background-clip:text;-webkit-text-fill-color:transparent;
  filter:drop-shadow(0 3px 8px ${rc.glow}80);
  animation:qp 1.5s ease-in-out infinite}
@keyframes qp{0%,100%{transform:scale(1);opacity:.75}50%{transform:scale(1.06);opacity:1}}

.hint{position:absolute;bottom:14%;font-size:14px;font-weight:800;letter-spacing:.12em;
  color:rgba(255,255,255,.25);z-index:6;text-transform:uppercase}

/* ===== crack on crate ===== */
.crack{position:absolute;border-radius:1px;transform-origin:top center;z-index:5;
  background:linear-gradient(180deg,rgba(255,200,120,.6),rgba(140,100,50,.3));
  box-shadow:0 0 4px rgba(255,200,120,.3)}

/* ===== REVEAL ===== */
.light-burst{position:absolute;width:100%;height:100%;z-index:3;opacity:0;
  background:radial-gradient(circle,${rc.glow}50,${rc.glow}18 35%,transparent 60%)}
.plank-debris{position:absolute;border-radius:4px;z-index:8;
  background:linear-gradient(180deg,#8B7355,#5E4A36);
  box-shadow:inset 1px 1px 2px rgba(255,220,170,.15),0 2px 4px rgba(0,0,0,.4)}
.iron-bit{position:absolute;border-radius:2px;z-index:8;
  background:linear-gradient(135deg,#6A6A72,#3A3A42);box-shadow:0 1px 3px rgba(0,0,0,.4)}
.dust{position:absolute;border-radius:50%;z-index:6;
  background:radial-gradient(circle,rgba(180,150,110,.3),transparent 60%)}
.sparkle{position:absolute;border-radius:50%;z-index:10;box-shadow:0 0 8px currentColor}

/* ===== PIG (drawn directly) ===== */
.pig-wrap{position:absolute;z-index:5;visibility:hidden}
.pigA{width:160px;height:150px;position:relative;animation:idle 3.6s ease-in-out infinite;transform-origin:50% 100%}
@keyframes idle{0%,100%{transform:scale(1,1)}50%{transform:scale(1.03,.97) translateY(2px)}}
.pigA .head{position:absolute;inset:0 -8px;border-radius:48% 48% 46% 46%/50% 50% 48% 48%;
  background:radial-gradient(circle at 34% 26%,#FFE4DE 0%,#FDC9C0 30%,#F6ABA0 62%,#E98D82 100%);
  box-shadow:inset 8px 12px 22px rgba(255,255,255,.75),inset -12px -18px 28px rgba(190,90,80,.38),
    inset 0 -4px 8px rgba(255,255,255,.2),0 14px 28px rgba(140,50,42,.28)}
.pigA .head::before{content:"";position:absolute;top:10px;left:23px;width:66px;height:40px;border-radius:50%;
  background:radial-gradient(ellipse,rgba(255,255,255,.6),transparent 70%);filter:blur(4px)}
.pigA .ear{position:absolute;top:-20px;width:52px;height:56px;
  background:radial-gradient(circle at 45% 40%,#FDCFC7,#F3A296 68%,#E88C80);
  border-radius:70% 30% 60% 40%/78% 78% 22% 22%;
  box-shadow:inset 6px 8px 12px rgba(255,255,255,.5),inset -6px -8px 14px rgba(190,90,80,.35),0 4px 10px rgba(140,50,42,.15);transform-origin:50% 90%}
.pigA .ear::after{content:"";position:absolute;top:12px;left:14px;width:24px;height:28px;
  border-radius:70% 30% 60% 40%/78% 78% 22% 22%;background:radial-gradient(circle at 45% 40%,#F49A93,#E37B72);filter:blur(1px)}
.pigA .ear.l{left:2px;transform:rotate(-14deg)}.pigA .ear.r{right:2px;transform:rotate(14deg) scaleX(-1)}
.eye{position:absolute;width:12px;height:13px;top:56px;background:#000;border-radius:50%}
.eye.l{left:38px}.eye.r{right:38px}
.pigA .snout{position:absolute;top:68px;left:50%;transform:translateX(-50%);width:70px;height:50px;border-radius:48%;
  background:radial-gradient(circle at 36% 28%,#FBB9AE,#F0958A 58%,#E07E73);
  box-shadow:inset 5px 7px 10px rgba(255,255,255,.55),inset -6px -9px 12px rgba(180,80,70,.4),0 5px 12px rgba(140,50,42,.22);z-index:2}
.nos{position:absolute;top:50%;transform:translateY(-50%);width:10px;height:15px;border-radius:50%;
  background:radial-gradient(circle at 42% 32%,#C4655B,#9E4A41);box-shadow:inset 0 2px 3px rgba(0,0,0,.25)}
.nos.l{left:16px}.nos.r{right:16px}
.cheekB{position:absolute;border-radius:50%;filter:blur(2px);top:86px;width:24px;height:14px;
  background:radial-gradient(circle,#F98F84,rgba(249,143,132,0) 72%)}
.cheekB.l{left:9px}.cheekB.r{right:9px}
${skinCSS}

/* bubble */
.bubble{position:absolute;top:10%;left:50%;z-index:11;white-space:nowrap;
  background:#fff;color:#3A2420;font-weight:900;font-size:22px;letter-spacing:.02em;
  padding:10px 18px;border-radius:17px;border:3px solid ${rc.bar};
  box-shadow:0 8px 18px rgba(0,0,0,.3);transform:translate(-50%,0) scale(0);transform-origin:50% 100%}
.bubble::after{content:"";position:absolute;bottom:-11px;left:50%;transform:translateX(-50%);
  width:0;height:0;border:9px solid transparent;border-top-color:${rc.bar};border-bottom:0}

/* nameplate */
.nameplate{position:absolute;bottom:10%;left:50%;transform:translateX(-50%);z-index:12;text-align:center;opacity:0}
.nameplate .sn{font-size:26px;font-weight:900;color:#3A3535;text-shadow:none;white-space:nowrap}
.nameplate .rt{display:inline-block;margin-top:8px;padding:5px 16px;border-radius:10px;
  font-size:11px;font-weight:900;letter-spacing:.2em;color:#fff;text-transform:uppercase;
  background:linear-gradient(90deg,${rc.bar},${rc.barEnd});box-shadow:0 4px 12px ${rc.glow}50}
.nameplate .tl{font-size:14px;font-weight:700;color:rgba(255,255,255,.45);margin-top:8px;font-style:italic}
</style>
</head>
<body>
<div class="scene" id="scene">
  <div class="crate-glow" id="glow"></div>
  <div class="crate" id="crate">
    <div class="face">
      <div class="plank-line pl1"></div><div class="plank-line pl2"></div><div class="plank-line pl3"></div>
      <div class="plank-line pl4"></div><div class="plank-line pl5"></div><div class="plank-line pl6"></div>
      ${Array.from({length:12},(_,i)=>'<div class="grain" style="top:'+((i+1)*7.5)+'%"></div>').join('')}
      <div class="bracket l"></div><div class="bracket r"></div>
      <div class="hband"></div>
      <div class="corner tl"></div><div class="corner tr"></div><div class="corner bl"></div><div class="corner br"></div>
      <div class="nail n1"></div><div class="nail n2"></div><div class="nail n3"></div><div class="nail n4"></div>
      <div class="nail n5"></div><div class="nail n6"></div><div class="nail n7"></div><div class="nail n8"></div>
    </div>
  </div>
  <div class="qmark" id="qmark">?</div>
  <div class="hint" id="hint">TAP TO BREAK</div>
  <div class="light-burst" id="burst"></div>
  <div class="pig-wrap" id="pigWrap">
    <div class="pigA ${skinClass}" style="scale:${ps.x} ${ps.y}">
      <div class="ear l"></div><div class="ear r"></div>
      <div class="head"></div>
      <div class="eye l"></div><div class="eye r"></div>
      <div class="cheekB l"></div><div class="cheekB r"></div>
      <div class="snout"><div class="nos l"></div><div class="nos r"></div></div>
      ${skinExtras}
    </div>
  </div>
  <div class="nameplate" id="nameplate">
    <div class="sn">${skin.name}</div>
    <div class="rt">${skin.rarityLabel}</div>
    <div class="tl">"${skin.tagline}"</div>
  </div>
</div>
<script>
var scene=document.getElementById('scene'),crate=document.getElementById('crate'),
  glow=document.getElementById('glow'),burst=document.getElementById('burst'),
  pigWrap=document.getElementById('pigWrap'),nameplate=document.getElementById('nameplate'),
  hintEl=document.getElementById('hint'),qmark=document.getElementById('qmark');
var hits=0,done=false,W=window.innerWidth,H=window.innerHeight;

crate.addEventListener('click',function(){
  if(done)return;
  hits++;
  try{window.ReactNativeWebView.postMessage(JSON.stringify({type:'hit',hits:hits}))}catch(e){}

  var n=3+hits*5;
  crate.animate([
    {transform:'perspective(400px) rotateX(4deg) rotateY(-6deg)'},
    {transform:'perspective(400px) rotateX('+(4+n)+'deg) rotateY('+(-6-n)+'deg) translateX(-'+n+'px)',offset:.15},
    {transform:'perspective(400px) rotateX('+(4-n*.7)+'deg) rotateY('+(-6+n)+'deg) translateX('+n+'px)',offset:.35},
    {transform:'perspective(400px) rotateX('+(4+n*.5)+'deg) rotateY('+(-6-n*.6)+'deg) translateX(-'+Math.round(n*.5)+'px)',offset:.55},
    {transform:'perspective(400px) rotateX('+(4-n*.3)+'deg) rotateY('+(-6+n*.3)+'deg)',offset:.75},
    {transform:'perspective(400px) rotateX(4deg) rotateY(-6deg)'}
  ],{duration:400});

  // Cracks
  var face=crate.querySelector('.face');
  for(var c=0;c<2+hits;c++){
    var ck=document.createElement('div');ck.className='crack';
    ck.style.left=(20+Math.random()*130)+'px';ck.style.top=(20+Math.random()*130)+'px';
    var ang=Math.random()*360,len=8+hits*14+Math.random()*16;
    ck.style.width='2px';ck.style.height=len+'px';ck.style.transform='rotate('+ang+'deg)';
    face.appendChild(ck);
    ck.animate([{opacity:0,height:'0px'},{opacity:1,height:len+'px'}],{duration:200,fill:'forwards'});
  }
  glow.style.opacity=.35+hits*.12;

  // Small debris
  for(var i=0;i<2+hits*2;i++){
    var sp=document.createElement('div');sp.className='iron-bit';
    sp.style.width=(3+Math.random()*6)+'px';sp.style.height=(2+Math.random()*4)+'px';
    sp.style.left=W/2+'px';sp.style.top=H/2+'px';
    scene.appendChild(sp);
    var a=Math.random()*Math.PI*2,d=25+Math.random()*45;
    sp.animate([
      {transform:'translate(0,0) rotate(0)',opacity:1},
      {transform:'translate('+Math.cos(a)*d+'px,'+Math.sin(a)*d+'px) rotate('+(Math.random()*300)+'deg)',opacity:0}
    ],{duration:350+Math.random()*200,fill:'forwards'}).onfinish=function(){this.effect.target.remove()};
  }

  if(hits>=3){
    done=true;
    hintEl.style.display='none';qmark.style.display='none';
    try{window.ReactNativeWebView.postMessage(JSON.stringify({type:'smash'}))}catch(e){}

    setTimeout(function(){
      crate.animate([
        {transform:'perspective(400px) rotateX(4deg) rotateY(-6deg) scale(1)',opacity:1},
        {transform:'perspective(400px) rotateX(10deg) rotateY(-10deg) scale(1.12)',opacity:1,offset:.12},
        {transform:'perspective(400px) scale(0)',opacity:0}
      ],{duration:300,fill:'forwards'});

      burst.animate([
        {opacity:0,transform:'scale(.3)'},{opacity:1,transform:'scale(1.3)',offset:.3},
        {opacity:.5,transform:'scale(1.6)',offset:.6},{opacity:0,transform:'scale(2)'}
      ],{duration:1000,fill:'forwards'});

      // Planks
      for(var i=0;i<14;i++){
        var p=document.createElement('div');p.className='plank-debris';
        var pw=14+Math.random()*28,ph=5+Math.random()*10;
        p.style.width=pw+'px';p.style.height=ph+'px';
        p.style.left=W/2+'px';p.style.top=H/2+'px';
        scene.appendChild(p);
        var a=Math.random()*Math.PI*2,d=80+Math.random()*150;
        p.animate([
          {transform:'translate(0,0) rotate(0) scale(1)',opacity:1},
          {transform:'translate('+Math.cos(a)*d+'px,'+Math.sin(a)*d+'px) rotate('+(Math.random()*500-250)+'deg) scale(.1)',opacity:0}
        ],{duration:700+Math.random()*400,fill:'forwards',easing:'cubic-bezier(.15,.6,.35,1)'}).onfinish=function(){this.effect.target.remove()};
      }
      // Iron bits
      for(var i=0;i<6;i++){
        var ib=document.createElement('div');ib.className='iron-bit';
        ib.style.width=(6+Math.random()*10)+'px';ib.style.height=(4+Math.random()*6)+'px';
        ib.style.left=W/2+'px';ib.style.top=H/2+'px';
        scene.appendChild(ib);
        var a2=Math.random()*Math.PI*2,d2=70+Math.random()*100;
        ib.animate([
          {transform:'translate(0,0) rotate(0)',opacity:1},
          {transform:'translate('+Math.cos(a2)*d2+'px,'+Math.sin(a2)*d2*1.3+'px) rotate('+(Math.random()*400)+'deg)',opacity:0}
        ],{duration:800,fill:'forwards'}).onfinish=function(){this.effect.target.remove()};
      }
      // Dust
      for(var i=0;i<6;i++){
        var du=document.createElement('div');du.className='dust';
        var sz=40+Math.random()*50;du.style.width=sz+'px';du.style.height=sz+'px';
        du.style.left=(W/2-sz/2+Math.random()*50-25)+'px';
        du.style.top=(H/2-sz/2+Math.random()*40-20)+'px';
        scene.appendChild(du);
        du.animate([{transform:'scale(.4)',opacity:.5},{transform:'scale(3)',opacity:0}],
          {duration:900+Math.random()*500,fill:'forwards'}).onfinish=function(){this.effect.target.remove()};
      }

      // Pig rises
      setTimeout(function(){
        pigWrap.style.visibility='visible';
        pigWrap.style.opacity='1';
        pigWrap.style.transform='scale(1)';
        pigWrap.animate([
          {transform:'translateY(40px) scale(0)',opacity:0},
          {transform:'translateY(-12px) scale(1.12)',opacity:1,offset:.6},
          {transform:'translateY(0) scale(1)',opacity:1}
        ],{duration:700,fill:'forwards',easing:'cubic-bezier(.34,1.56,.64,1)'});
        // Sparkles
        for(var i=0;i<24;i++){
          var s=document.createElement('div');s.className='sparkle';
          var colors=['#FFE9B8','${rc.bar}','#FFB84D','#FFF','${rc.barEnd}'];
          var col=colors[i%5];
          s.style.width=(5+Math.random()*4)+'px';s.style.height=s.style.width;
          s.style.background=col;s.style.color=col;
          s.style.left=W/2+'px';s.style.top=H*.38+'px';
          scene.appendChild(s);
          var a3=Math.random()*Math.PI*2,d4=50+Math.random()*110;
          s.animate([
            {transform:'translate(0,0) scale(1)',opacity:1},
            {transform:'translate('+Math.cos(a3)*d4+'px,'+Math.sin(a3)*d4+'px) scale(0)',opacity:0}
          ],{duration:600+Math.random()*400,fill:'forwards',easing:'cubic-bezier(.2,.6,.4,1)'}).onfinish=function(){this.effect.target.remove()};
        }
        // Bubble
        var bub=document.createElement('div');bub.className='bubble';
        bub.textContent='${skin.tagline}';
        scene.appendChild(bub);
        // Bouncy pop-in only; a whole-animation overshoot easing pushed the exit past scale 0
        // (flipping the bubble upside down) and past its end point (floating it off the top)
        bub.animate([
          {transform:'translate(-50%,10px) scale(0)',opacity:1,easing:'cubic-bezier(.34,1.56,.64,1)'},
          {transform:'translate(-50%,0) scale(1)',opacity:1,offset:.18},
          {transform:'translate(-50%,0) scale(1)',opacity:1,offset:.85,easing:'ease-in'},
          {transform:'translate(-50%,-6px) scale(.85)',opacity:0}
        ],{duration:2600,fill:'forwards'}).onfinish=function(){bub.remove()};
        try{window.ReactNativeWebView.postMessage(JSON.stringify({type:'revealed'}))}catch(e){}
      },200);

      // Name
      setTimeout(function(){
        nameplate.animate([
          {opacity:0,transform:'translateX(-50%) translateY(24px)'},
          {opacity:1,transform:'translateX(-50%) translateY(0)'}
        ],{duration:600,fill:'forwards',easing:'cubic-bezier(.34,1.4,.5,1)'});
        try{window.ReactNativeWebView.postMessage(JSON.stringify({type:'done'}))}catch(e){}
      },700);
    },150);
  }
});

// Blink
setInterval(function(){
  var eyes=document.querySelectorAll('.eye');
  eyes.forEach(function(e){e.animate([{transform:'scaleY(1)'},{transform:'scaleY(.1)',offset:.5},{transform:'scaleY(1)'}],{duration:160})});
},2400+Math.random()*2000);
</script>
</body></html>`;
}

export default function SkinUnlockScreen({ navigation, route }) {
  const { state, dispatch } = useAppLock();
  // Show the new skin on the pig at its current size
  const level = getLevel(state.totalCoinsSpent).level;
  const skinId = route.params?.skinId || "pirate";
  const skin = getSkinById(skinId);
  const webRef = useRef(null);

  const handleMessage = useCallback((event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === "hit") heavyTap();
      if (data.type === "smash") successTap();
      if (data.type === "done") {
        dispatch({ type: "SET_SKIN", payload: skinId });
      }
    } catch (e) {}
  }, [skinId]);

  return (
    <View style={styles.container}>
      <WebView
        ref={webRef}
        source={{ html: buildCrateHTML(skin, level) }}
        style={styles.webview}
        scrollEnabled={false}
        bounces={false}
        overScrollMode="never"
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        onMessage={handleMessage}
        javaScriptEnabled={true}
        originWhitelist={["*"]}
        allowsInlineMediaPlayback={true}
      />
      <SafeAreaView style={styles.closeWrap} pointerEvents="box-none">
        <CloseButton
          onPress={() => {
            const queue = route.params?.queue || [];
            if (queue.length) navigation.replace("SkinUnlock", { skinId: queue[0], queue: queue.slice(1) });
            else navigation.goBack();
          }}
          style={styles.closeBtn}
        />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#EDE8E4" },
  webview: { flex: 1, backgroundColor: "transparent" },
  closeWrap: {
    position: "absolute", top: 0, right: 0, paddingTop: 8, paddingRight: 16,
  },
  closeBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: "rgba(0,0,0,.06)",
    alignItems: "center", justifyContent: "center",
  },
  closeText: { fontSize: 16, fontWeight: "700", color: "#2D2D2D" },
});
