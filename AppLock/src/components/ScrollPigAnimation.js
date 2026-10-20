import React, { useRef, useCallback } from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import { WebView } from "react-native-webview";
import { LEVELS, getPigScale } from "../utils/pigWeight";

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");

function buildHTML(fromLevel, toLevel, coinCount, titles) {
  // coinCount controls how many coins get vacuumed per feed round
  const coinsPerFeed = Math.max(4, Math.min(coinCount || 8, 20));
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
<style>
*{margin:0;padding:0;box-sizing:border-box;-webkit-tap-highlight-color:transparent;-webkit-user-select:none;user-select:none}
html,body{
  font-family:-apple-system,BlinkMacSystemFont,"SF Pro Rounded","Segoe UI",sans-serif;
  background:transparent;
  width:100%;height:100%;overflow:hidden;
  display:flex;flex-direction:column;align-items:center;justify-content:center;
}

.stage{position:relative;width:100%;height:70%;display:flex;align-items:center;justify-content:center}
.floorShadow{position:absolute;bottom:12%;left:50%;transform:translateX(-50%);width:150px;height:24px;border-radius:50%;
  background:radial-gradient(ellipse,rgba(120,40,32,.28),rgba(120,40,32,0) 70%);
  transition:width .55s cubic-bezier(.34,1.56,.64,1)}

.wrap{position:relative;animation:idle 3.6s ease-in-out infinite;transform-origin:50% 100%;
  transition:scale .6s cubic-bezier(.3,1.6,.5,1)}
@keyframes idle{0%,100%{transform:scale(1,1)}50%{transform:scale(1.03,.97) translateY(2px)}}
.wrap.inhale{animation:inhale .7s cubic-bezier(.34,1.3,.5,1)}
@keyframes inhale{
  0%{transform:scale(1,1)}30%{transform:scale(.965,1.02) translateY(1.5px)}
  56%{transform:scale(1.1,1.06)}78%{transform:scale(.975,.995)}100%{transform:scale(1,1)}
}
.wrap.feast{animation:feast 1.7s cubic-bezier(.4,.2,.5,1)}
@keyframes feast{
  0%{transform:translateX(0) scale(1,1)}
  10%{transform:translateX(-2px) scale(.99,1.01)}
  20%{transform:translateX(2px) scale(1,1.02)}
  30%{transform:translateX(-2.5px) scale(1.02,1.03)}
  40%{transform:translateX(2.5px) scale(1.03,1.04)}
  50%{transform:translateX(-2px) scale(1.05,1.05)}
  60%{transform:translateX(2px) scale(1.07,1.06)}
  70%{transform:translateX(-1.5px) scale(1.09,1.08)}
  80%{transform:translateX(0) scale(1.13,1.1)}
  88%{transform:scale(.96,1.02)}
  100%{transform:scale(1,1)}
}
.wrap.t-hop{animation:tHop 1s cubic-bezier(.34,1.56,.64,1)}
@keyframes tHop{
  0%{transform:scale(1,1)}20%{transform:scale(1.26,.7)}
  44%{transform:scale(.84,1.2) translateY(-42px) rotate(-5deg)}
  60%{transform:scale(1.12,.88) translateY(0) rotate(4deg)}
  76%{transform:scale(.95,1.06) rotate(-2deg)}100%{transform:scale(1,1)}
}

.pigA{width:180px;height:168px;position:relative}
.pigA .head{
  position:absolute;inset:0 -8px;
  border-radius:48% 48% 46% 46%/50% 50% 48% 48%;
  background:radial-gradient(circle at 34% 26%,#FFE4DE 0%,#FDC9C0 30%,#F6ABA0 62%,#E98D82 100%);
  box-shadow:inset 8px 12px 22px rgba(255,255,255,.75),inset -12px -18px 28px rgba(190,90,80,.38),
    inset 0 -4px 8px rgba(255,255,255,.2),0 14px 28px rgba(140,50,42,.28);
}
.pigA .head::before{content:"";position:absolute;top:10px;left:26px;width:74px;height:44px;border-radius:50%;
  background:radial-gradient(ellipse,rgba(255,255,255,.65),rgba(255,255,255,0) 70%);filter:blur(4px)}
.pigA .ear{position:absolute;top:-22px;width:58px;height:62px;
  background:radial-gradient(circle at 45% 40%,#FDCFC7,#F3A296 68%,#E88C80);
  border-radius:70% 30% 60% 40%/78% 78% 22% 22%;
  box-shadow:inset 6px 8px 12px rgba(255,255,255,.5),inset -6px -8px 14px rgba(190,90,80,.35),0 4px 10px rgba(140,50,42,.15);
  transform-origin:50% 90%}
.pigA .ear::after{content:"";position:absolute;top:14px;left:16px;width:26px;height:30px;
  border-radius:70% 30% 60% 40%/78% 78% 22% 22%;
  background:radial-gradient(circle at 45% 40%,#F49A93,#E37B72);filter:blur(1px)}
.pigA .ear.l{left:8px;transform:rotate(-14deg);animation:earL 3.6s ease-in-out infinite}
.pigA .ear.r{right:8px;transform:rotate(14deg) scaleX(-1);animation:earR 3.6s ease-in-out infinite}
@keyframes earL{0%,100%{transform:rotate(-14deg)}50%{transform:rotate(-19deg)}}
@keyframes earR{0%,100%{transform:rotate(14deg) scaleX(-1)}50%{transform:rotate(19deg) scaleX(-1)}}
.eye{position:absolute;width:14px;height:15px;top:62px;background:#000;border-radius:50%}
.eye.l{left:42px}.eye.r{right:42px}
.blinking .eye{animation:blink .16s ease-in-out}
@keyframes blink{50%{transform:scaleY(.1)}}
.pigA .snout{
  position:absolute;top:76px;left:50%;transform:translateX(-50%);
  width:78px;height:56px;border-radius:48%;
  background:radial-gradient(circle at 36% 28%,#FBB9AE,#F0958A 58%,#E07E73);
  box-shadow:inset 5px 7px 10px rgba(255,255,255,.55),inset -6px -9px 12px rgba(180,80,70,.4),0 5px 12px rgba(140,50,42,.22)}
.nostril{position:absolute;top:50%;transform:translateY(-50%);
  width:11px;height:17px;border-radius:50%;
  background:radial-gradient(circle at 42% 32%,#C4655B,#9E4A41);
  box-shadow:inset 0 2px 3px rgba(0,0,0,.25)}
.nostril.l{left:18px}.nostril.r{right:18px}
.cheekB{position:absolute;border-radius:50%;filter:blur(2px);top:96px;width:26px;height:15px;
  background:radial-gradient(circle,#F98F84,rgba(249,143,132,0) 72%)}
.cheekB.l{left:10px}.cheekB.r{right:10px}

/* ===== coin ===== */
.coin{position:absolute;pointer-events:none;will-change:transform;z-index:5;border-radius:50%;box-sizing:border-box;
  background:#FFFFFF;border:solid #F7A0B2;box-shadow:0 3px 8px rgba(247,160,178,.45)}
/* matches the app's P coin logo: white coin, pink ring, heavy pink P */
.coin::after{content:"P";position:absolute;inset:0;display:flex;align-items:center;justify-content:center;
  font-size:inherit;font-weight:800;color:#F7A0B2;font-family:-apple-system,BlinkMacSystemFont,sans-serif}

.stream{position:absolute;pointer-events:none;z-index:5;will-change:transform;
  border-radius:45% 55% 48% 52%/28% 26% 72% 74%;
  box-shadow:inset 2px 3px 5px rgba(255,255,255,.4),inset -3px -4px 6px rgba(0,0,0,.25)}
.suck{position:absolute;pointer-events:none;z-index:4;height:3px;border-radius:2px;
  background:linear-gradient(90deg,rgba(255,255,255,0),rgba(255,255,255,.75));will-change:transform,opacity}
.ripple{position:absolute;pointer-events:none;border-radius:50%;z-index:6;
  background:radial-gradient(circle,rgba(255,255,255,.5),rgba(255,255,255,0) 65%)}
.sparkle{position:absolute;pointer-events:none;width:7px;height:7px;border-radius:50%;background:#FFE9B8;
  box-shadow:0 0 8px 2px rgba(255,214,120,.8);z-index:5;will-change:transform,opacity}
.burstText{position:absolute;top:34%;left:50%;transform:translate(-50%,-50%) scale(.4);
  font-size:29px;font-weight:900;color:#fff;text-shadow:0 3px 10px rgba(150,50,40,.5);
  pointer-events:none;opacity:0;z-index:7;white-space:nowrap}

.hud{display:flex;flex-direction:column;align-items:center;gap:7px;padding-bottom:16px}
.lvl{font-size:20px;font-weight:800;color:#2D2D2D}
.lvl b{color:#F7A0B2;text-shadow:0 0 2px #fff}
/* matches XPBar on Home/Stats: light track, white edge, pink glow, glossy gradient fill */
.bar{width:220px;height:10px;border-radius:5px;background:rgba(255,255,255,.55);border:1px solid rgba(255,255,255,.9);overflow:hidden;
  box-shadow:0 0 5px rgba(247,160,178,.45);transition:box-shadow .3s ease}
.bar.glowing{box-shadow:0 0 11px rgba(247,160,178,.95)}
.fill{position:relative;height:100%;width:0%;min-width:8px;border-radius:5px;overflow:hidden;
  background:linear-gradient(90deg,#FBC3CF,#F7A0B2,#F48DA4);transition:width 1.1s cubic-bezier(.33,1,.68,1)}
.fill::before{content:"";position:absolute;top:0;left:0;right:0;height:45%;background:rgba(255,255,255,.35)}
.fill::after{content:"";position:absolute;top:0;bottom:0;left:-40px;width:40px;opacity:0;
  background:linear-gradient(90deg,rgba(255,255,255,0),rgba(255,255,255,.85),rgba(255,255,255,0))}
.bar.glowing .fill::after{animation:sheen 1.1s ease-in-out}
@keyframes sheen{0%{left:-40px;opacity:1}100%{left:100%;opacity:1}}
.hint{font-size:12px;color:#2D2D2D;opacity:.65;font-weight:700;min-height:16px}

@media (prefers-reduced-motion:reduce){.wrap,.pigA .ear.l,.pigA .ear.r{animation:none}}
</style>
</head>
<body>

<div class="stage" id="stage">
  <div class="floorShadow" id="floorShadow"></div>
  <div class="wrap" id="wrap">
    <div class="pigA">
      <div class="ear l"></div><div class="ear r"></div>
      <div class="head"></div>
      <div class="eye l"></div><div class="eye r"></div>
      <div class="cheekB l"></div><div class="cheekB r"></div>
      <div class="snout" id="snout">
        <div class="nostril l" id="nosL"></div>
        <div class="nostril r" id="nosR"></div>
      </div>
    </div>
  </div>
  <div class="burstText" id="burstText"></div>
</div>

<div class="hud">
  <div class="lvl">Level <b id="lvlNum">${fromLevel}</b> · <span id="lvlTitle"></span></div>
  <div class="bar"><div class="fill" id="fill"></div></div>
  <div class="hint" id="hint"></div>
</div>

<script>
var FROM_LEVEL=${fromLevel},TO_LEVEL=${toLevel},COINS_PER_FEED=${coinsPerFeed};
var stage=document.getElementById('stage'),wrap=document.getElementById('wrap'),
  snoutEl=document.getElementById('snout'),nosL=document.getElementById('nosL'),
  nosR=document.getElementById('nosR'),floorShadow=document.getElementById('floorShadow'),
  fill=document.getElementById('fill'),barEl=fill.parentNode,lvlNum=document.getElementById('lvlNum'),
  lvlTitle=document.getElementById('lvlTitle'),hint=document.getElementById('hint'),
  burstText=document.getElementById('burstText');

var level=FROM_LEVEL,feeds=0,feedsNeeded=2,busy=false,playing=false,lastSide='r';
var titles=${JSON.stringify(titles)};
var scales=${JSON.stringify(LEVELS.map((l) => getPigScale(l.level)))};

function sizeFor(lv){return scales[Math.min(lv,scales.length)-1];}
var cur=sizeFor(level);
function setSize(sz){
  cur={x:sz.x,y:sz.y};
  wrap.style.scale=sz.x+' '+sz.y;
  floorShadow.style.width=150*sz.x+'px';
}
function applySize(){
  setSize(sizeFor(level));
  lvlTitle.textContent=titles[level-1]||'';
}
applySize();

/* Each mouthful plumps the pig a little toward its next size */
function growFromFeed(frac){
  if(level>=TO_LEVEL)return;
  var a=sizeFor(level),b=sizeFor(level+1),k=.35*frac;
  setSize({x:a.x+(b.x-a.x)*k*1.4,y:a.y+(b.y-a.y)*k});
}

/* Level-up: inflate in gulps, overshoot the new size, then jiggle to rest */
function plumpTo(to){
  var f=cur,sc=function(x,y){return x.toFixed(3)+' '+y.toFixed(3)};
  var mx=function(t){return f.x+(to.x-f.x)*t},my=function(t){return f.y+(to.y-f.y)*t};
  wrap.style.transition='none';
  var anim=wrap.animate([
    {scale:sc(f.x,f.y)},
    {scale:sc(f.x*1.05,f.y*.96),offset:.12},
    {scale:sc(mx(.45)*1.07,my(.45)*1.01),offset:.26},
    {scale:sc(mx(.45)*1.02,my(.45)*.98),offset:.36},
    {scale:sc(mx(.85)*1.08,my(.85)*1.02),offset:.5},
    {scale:sc(to.x*1.16,to.y*1.07),offset:.64},
    {scale:sc(to.x*.95,to.y*1.03),offset:.76},
    {scale:sc(to.x*1.04,to.y*.98),offset:.87},
    {scale:sc(to.x,to.y)}
  ],{duration:1250,easing:'ease-out'});
  floorShadow.style.width=150*to.x+'px';
  anim.onfinish=function(){setSize(to);wrap.style.transition='';};
  cur={x:to.x,y:to.y};
}
setInterval(function(){wrap.classList.add('blinking');setTimeout(function(){wrap.classList.remove('blinking')},200)},2400+Math.random()*2000);

var stageRect=null;
function pt(el){
  var r=el.getBoundingClientRect();
  if(!stageRect)stageRect=stage.getBoundingClientRect();
  return{x:r.left+r.width/2-stageRect.left,y:r.top+r.height/2-stageRect.top};
}

/* ======== coin factory ======== */
function makeCoin(size){
  var c=document.createElement('div');
  c.className='coin';
  c.style.width=size+'px';c.style.height=size+'px';
  c.style.fontSize=Math.round(size*.46)+'px';
  c.style.borderWidth=Math.max(1.5,size*.11)+'px';
  stage.appendChild(c);
  return c;
}

function cPos(el,x,y,extra){
  var w=parseFloat(el.style.width),h=parseFloat(el.style.height);
  return 'translate('+(x-w/2)+'px,'+(y-h/2)+'px) '+(extra||'');
}

function flare(n,amount,dur){
  n.animate([
    {transform:'translateY(-50%) scale(1)'},
    {transform:'translateY(-50%) scale('+amount+')',offset:.45},
    {transform:'translateY(-50%) scale(1)'}
  ],{duration:dur,easing:'cubic-bezier(.34,1.3,.5,1)'});
}
function snoutPulse(){
  snoutEl.animate([
    {transform:'translateX(-50%) scale(1)'},
    {transform:'translateX(-50%) scale(1.14,1.08)',offset:.4},
    {transform:'translateX(-50%) scale(.97)',offset:.72},
    {transform:'translateX(-50%) scale(1)'}
  ],{duration:500,easing:'cubic-bezier(.34,1.4,.5,1)'});
}
function streamInto(nx,ny,w,h,dur){
  var s=document.createElement('div');
  s.className='stream';
  s.style.width=w+'px';s.style.height=h+'px';
  s.style.left=(nx-w/2)+'px';s.style.top=ny+'px';
  s.style.transformOrigin='50% 0%';
  s.style.background='linear-gradient(180deg,#E69500,#FFD54F)';
  stage.appendChild(s);
  s.animate([
    {transform:'scaleY(1) scaleX(1)'},
    {transform:'scaleY(.5) scaleX(1.15)',offset:.45},
    {transform:'scaleY(0) scaleX(.5)'}
  ],{duration:dur,easing:'cubic-bezier(.55,.05,.7,.5)'}).onfinish=function(){s.remove()};
}
function suckLine(tx,ty){
  var l=document.createElement('div');
  l.className='suck';
  var ang=Math.random()*Math.PI*2;
  var dist=70+Math.random()*70;
  var sx=tx+Math.cos(ang)*dist, sy=ty+Math.sin(ang)*dist*.7;
  var rot=Math.atan2(ty-sy,tx-sx)*180/Math.PI;
  l.style.width=(26+Math.random()*20)+'px';
  l.style.left=sx+'px';l.style.top=sy+'px';
  stage.appendChild(l);
  l.animate([
    {transform:'rotate('+rot+'deg) translateX(0) scaleX(1)',opacity:.8},
    {transform:'rotate('+rot+'deg) translateX('+dist*.8+'px) scaleX(.2)',opacity:0}
  ],{duration:340+Math.random()*160,easing:'cubic-bezier(.5,0,.8,.5)'}).onfinish=function(){l.remove()};
}
function ripple(x,y,size){
  var r=document.createElement('div');
  r.className='ripple';
  r.style.left=(x-size/2)+'px';r.style.top=(y-size/2)+'px';
  r.style.width=size+'px';r.style.height=size+'px';
  stage.appendChild(r);
  r.animate([
    {transform:'scale(.3)',opacity:.9},
    {transform:'scale(1.6)',opacity:0}
  ],{duration:560,easing:'cubic-bezier(.2,.6,.4,1)'}).onfinish=function(){r.remove()};
}
function sparkles(n){
  var cx=stage.offsetWidth/2, cy=stage.offsetHeight*.42;
  for(var i=0;i<n;i++){
    var s=document.createElement('div');
    s.className='sparkle';
    s.style.left=cx+'px';s.style.top=cy+'px';
    stage.appendChild(s);
    var ang=Math.random()*Math.PI*2,dist=60+Math.random()*90;
    s.animate([
      {transform:'translate(0,0) scale(1)',opacity:1},
      {transform:'translate('+Math.cos(ang)*dist+'px,'+Math.sin(ang)*dist+'px) scale(0)',opacity:0}
    ],{duration:750+Math.random()*300,easing:'cubic-bezier(.2,.6,.4,1)'}).onfinish=function(){this.effect.target.remove()};
  }
}

/* ======== VACUUM FEED — coins get sucked into nostrils ======== */
function feedVacuum(){
  stageRect=stage.getBoundingClientRect();
  var N=COINS_PER_FEED;
  snoutPulse();
  wrap.classList.remove('feast');void wrap.offsetWidth;
  wrap.classList.add('feast');
  var nostrils=[nosL,nosR];
  var sw=stage.offsetWidth, sh=stage.offsetHeight;
  var cx=sw/2;
  for(var i=0;i<N;i++){
    (function(i){
      var nEl=nostrils[i%2];
      var n=pt(nEl);
      // coins spawn in a wide arc around the pig
      var side=i%2===0?-1:1;
      var sx=cx+side*(50+Math.random()*(sw/2-80));
      var sy=sh*0.3+Math.random()*sh*0.45;
      var size=16+Math.random()*10;
      var coin=makeCoin(size);
      // appear then vacuum into nostril
      var midX=sx+(cx-sx)*.4+side*-20;
      var midY=sy-30-Math.random()*20;
      setTimeout(function(){
        coin.animate([
          {transform:cPos(coin,sx,sy,'rotate(0deg) scale(.3)'),opacity:0},
          {transform:cPos(coin,sx,sy,'rotate(0deg) scale(1)'),opacity:1,offset:.12},
          {transform:cPos(coin,midX,midY,'rotate('+side*90+'deg) scale(1)'),offset:.5},
          {transform:cPos(coin,n.x,n.y+18,'rotate('+side*180+'deg) scale(.5,1.1)'),offset:.88},
          {transform:cPos(coin,n.x,n.y+10,'rotate('+side*200+'deg) scale(.2,.9)'),opacity:1}
        ],{duration:600,easing:'cubic-bezier(.5,.05,.65,.5)',fill:'forwards'}).onfinish=function(){
          coin.remove();
          streamInto(n.x,n.y-2,8,18,160);
          flare(nEl,1.45,240);
        };
      },i*100);
      setTimeout(function(){suckLine(cx,sh*.48)},i*75);
    })(i);
  }
  setTimeout(function(){ripple(cx,sh*.48,80)},N*100+300);
}

function showBurst(txt){
  burstText.textContent=txt;
  burstText.animate([
    {opacity:0,transform:'translate(-50%,-50%) scale(.4)'},
    {opacity:1,transform:'translate(-50%,-50%) scale(1.15)',offset:.35},
    {opacity:1,transform:'translate(-50%,-50%) scale(1)',offset:.6},
    {opacity:0,transform:'translate(-50%,-80%) scale(1)'}
  ],{duration:1100,easing:'cubic-bezier(.3,1.4,.5,1)'});
}

function levelUp(){
  if(busy||level>=TO_LEVEL)return;
  busy=true;
  level++;feeds=0;resetFill();
  wrap.classList.remove('t-hop','inhale','feast');
  plumpTo(sizeFor(level));
  setTimeout(function(){sparkles(10+level*5);},700);
  setTimeout(function(){
    lvlTitle.textContent=titles[level-1]||'';lvlNum.textContent=level;
    showBurst('LEVEL '+level+(titles[level-1]?' \\u00B7 '+titles[level-1].toUpperCase():''));
  },320);
  setTimeout(function(){
    busy=false;
    hint.textContent='';
    if(level>=TO_LEVEL){
      try{window.ReactNativeWebView.postMessage(JSON.stringify({type:'done',level:level}))}catch(e){}
    }
  },1400);
}

/* Bar glow + shine while filling; the reset to empty after a level-up is instant */
var glowTimer=null;
function glowBar(){
  barEl.classList.remove('glowing');void barEl.offsetWidth;barEl.classList.add('glowing');
  clearTimeout(glowTimer);glowTimer=setTimeout(function(){barEl.classList.remove('glowing')},1100);
}
function resetFill(){
  fill.style.transition='none';fill.style.width='0%';void fill.offsetWidth;fill.style.transition='';
}

/* Auto-play: vacuum coins, fill bar, level up */
async function autoPlay(){
  playing=true;
  var wait=function(ms){return new Promise(function(r){setTimeout(r,ms)})};
  await wait(500);
  for(var L=FROM_LEVEL;L<TO_LEVEL;L++){
    for(var f=0;f<feedsNeeded;f++){
      feedVacuum();
      feeds=f+1;fill.style.width=(feeds/feedsNeeded*100)+'%';glowBar();
      setTimeout(function(fr){return function(){growFromFeed(fr);};}(feeds/feedsNeeded),900);
      await wait(1900);
    }
    await wait(200);
    levelUp();
    await wait(1900);
  }
  playing=false;
}

stage.addEventListener('click',function(){
  if(!playing && level>=TO_LEVEL) feedVacuum();
});

autoPlay();
</script>
</body>
</html>`;
}

export default function ScrollPigAnimation({
  fromLevel = 1,
  toLevel = 2,
  coinCount = 8,
  titles = ["Piglet", "Snacker", "Muncher", "Chonker", "MAX SLOP"],
  onAnimationComplete,
}) {
  var webViewRef = useRef(null);

  var handleMessage = useCallback(function(event) {
    try {
      var data = JSON.parse(event.nativeEvent.data);
      if (data.type === "done" && onAnimationComplete) {
        onAnimationComplete();
      }
    } catch (e) {}
  }, [onAnimationComplete]);

  var clampedFrom = Math.max(1, fromLevel);
  var clampedTo = Math.max(clampedFrom + 1, toLevel);

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        source={{ html: buildHTML(clampedFrom, clampedTo, coinCount, titles) }}
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
    </View>
  );
}

var styles = StyleSheet.create({
  container: {
    width: SCREEN_W,
    height: SCREEN_H * 0.75,
    marginHorizontal: -24,
    overflow: "visible",
  },
  webview: {
    flex: 1,
    backgroundColor: "transparent",
    overflow: "visible",
  },
});
