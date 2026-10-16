// Builds the full HTML for a pig skin WebView — exact CSS from scroll-pig-reactions.html
// Each skin has its own accessories, colors, and tap reaction animation.

const BASE_CSS = `
*{margin:0;padding:0;box-sizing:border-box;-webkit-tap-highlight-color:transparent;-webkit-user-select:none;user-select:none}
html,body{
  font-family:-apple-system,BlinkMacSystemFont,"SF Pro Rounded","Segoe UI",sans-serif;
  background:transparent;width:100%;height:100%;overflow:hidden;
  display:flex;align-items:center;justify-content:center;
}
.stage{position:relative;width:100%;height:100%;overflow:hidden}
.shadow{position:absolute;bottom:6%;left:50%;transform:translateX(-50%);width:120px;height:16px;border-radius:50%;
  background:radial-gradient(ellipse,rgba(120,45,38,.1),rgba(120,45,38,0) 65%)}
.ghostShadow{width:100px;opacity:.5}

.wrap{position:absolute;left:50%;top:50%;margin-left:-90px;margin-top:-84px;width:180px;height:168px;animation:idle 3.6s ease-in-out infinite;transform-origin:50% 50%}
@keyframes idle{0%,100%{transform:scale(1,1)}50%{transform:scale(1.035,.965) translateY(2px)}}
.wrap.floaty{animation:ghostFloat 3.4s ease-in-out infinite}
@keyframes ghostFloat{0%,100%{transform:translateY(0) rotate(0deg)}50%{transform:translateY(-12px) rotate(1.6deg)}}

/* tap reactions */
.wrap.poked{animation:poke .5s cubic-bezier(.34,1.56,.64,1)}
@keyframes poke{0%{transform:scale(1,1)}20%{transform:scale(1.12,.88) translateY(4px)}50%{transform:scale(.92,1.1) translateY(-8px)}75%{transform:scale(1.04,.97)}100%{transform:scale(1,1)}}
.wrap.jiggle{animation:jiggle .4s cubic-bezier(.34,1.3,.5,1)}
@keyframes jiggle{0%{transform:scale(1,1) translateY(0)}20%{transform:scale(1.08,.92) translateY(4px)}45%{transform:scale(.9,1.1) translateY(-6px)}65%{transform:scale(1.05,.96) translateY(2px)}85%{transform:scale(.97,1.03) translateY(-1px)}100%{transform:scale(1,1) translateY(0)}}
.wrap.squish{animation:squish .45s cubic-bezier(.34,1.56,.64,1)}
@keyframes squish{0%{transform:scale(1,1)}30%{transform:scale(1.15,.85) translateY(6px)}60%{transform:scale(.9,1.12) translateY(-4px)}100%{transform:scale(1,1)}}
.wrap.hop{animation:hop .6s cubic-bezier(.34,1.56,.64,1)}
@keyframes hop{0%{transform:scale(1,1) translateY(0)}15%{transform:scale(1.1,.85) translateY(4px)}40%{transform:scale(.88,1.15) translateY(-16px)}60%{transform:scale(1.06,.92) translateY(0) rotate(3deg)}80%{transform:scale(.97,1.04) rotate(-2deg)}100%{transform:scale(1,1) translateY(0) rotate(0deg)}}
.wrap.wobble{animation:wobble .55s cubic-bezier(.34,1.3,.5,1)}
@keyframes wobble{0%{transform:scale(1,1) translateY(0)}12%{transform:scale(1.1,.9) translateY(5px)}28%{transform:scale(.88,1.12) translateY(-10px)}44%{transform:scale(1.07,.93) translateY(3px)}60%{transform:scale(.94,1.06) translateY(-5px)}76%{transform:scale(1.03,.98) translateY(1px)}100%{transform:scale(1,1) translateY(0)}}

/* themed reactions */
.wrap.r-pirate{animation:rPirate .95s cubic-bezier(.34,1.3,.5,1)}
@keyframes rPirate{0%{transform:scale(1,1) translateY(0)}16%{transform:scale(1.1,.92) translateY(4px)}38%{transform:scale(.94,1.08) translateY(-10px)}58%{transform:scale(1.06,.95) translateY(2px)}78%{transform:scale(.98,1.02) translateY(-3px)}100%{transform:scale(1,1) translateY(0)}}
.wrap.r-swish{animation:rSwish .95s cubic-bezier(.34,1.4,.5,1)}
@keyframes rSwish{0%{transform:scale(1,1)}14%{transform:scale(1.15,.85)}34%{transform:translateY(-16px) scale(.94,1.07)}54%{transform:translateY(0) scale(1.08,.93)}70%{transform:translateY(-8px) scale(.97,1.03)}86%{transform:translateY(0) scale(1.03,.98)}100%{transform:scale(1,1)}}
.wrap.r-ghost{animation:rGhost .95s cubic-bezier(.3,1.2,.5,1)}
@keyframes rGhost{0%{transform:scale(1,1) translateY(0)}20%{transform:scale(.9,1.06) translateY(5px)}40%{transform:scale(1.26,1.2) translateY(-16px)}58%{transform:scale(1.2,1.15) translateY(-12px)}78%{transform:scale(.97,1.02) translateY(0)}100%{transform:scale(1,1)}}
.pigA.flicker{animation:flick .5s steps(2,jump-none) 2}
@keyframes flick{0%{opacity:.96}50%{opacity:.55}100%{opacity:.96}}
.wrap.r-zombie{animation:rZombie 1.05s cubic-bezier(.45,.05,.55,.95)}
@keyframes rZombie{0%{transform:scale(1,1) translateY(0)}14%{transform:scale(1.04,.96) translateY(3px)}28%{transform:scale(.97,1.04) translateY(-4px)}46%{transform:scale(1.05,.95) translateY(5px)}62%{transform:scale(.98,1.03) translateY(-3px)}80%{transform:scale(1.02,.99) translateY(1px)}100%{transform:scale(1,1) translateY(0)}}
.wrap.r-punk{animation:rPunk .9s cubic-bezier(.4,.1,.5,1)}
@keyframes rPunk{0%{transform:scale(1,1) translateY(0)}11%{transform:scale(1.06,.94) translateY(5px)}22%{transform:scale(.92,1.08) translateY(-8px)}33%{transform:scale(1.05,.95) translateY(4px)}44%{transform:scale(.94,1.06) translateY(-6px)}56%{transform:scale(1.04,.97) translateY(3px)}68%{transform:scale(.96,1.03) translateY(-4px)}82%{transform:scale(1.02,.99) translateY(1px)}100%{transform:scale(1,1) translateY(0)}}

.wrap.r-cowboy{animation:rCowboy 1s cubic-bezier(.34,1.4,.5,1)}
@keyframes rCowboy{
  0%{transform:scale(1,1) translateY(0)}
  14%{transform:scale(1.1,.86) translateY(6px)}
  35%{transform:scale(.88,1.16) translateY(-18px)}
  52%{transform:scale(1.08,.9) translateY(0)}
  66%{transform:scale(.94,1.08) translateY(-14px)}
  82%{transform:scale(1.03,.98) translateY(0)}
  100%{transform:scale(1,1) translateY(0)}}

.wrap.r-devil{animation:rDevil .9s cubic-bezier(.3,1.2,.5,1)}
@keyframes rDevil{
  0%{transform:scale(1,1) translateY(0)}
  18%{transform:scale(1.16,1.1) translateY(-6px)}
  36%{transform:scale(1.2,1.14) translateY(-10px)}
  54%{transform:scale(.92,1.02) translateY(0)}
  72%{transform:scale(1.06,.96) translateY(-3px)}
  100%{transform:scale(1,1) translateY(0)}}

.wrap.r-astro{animation:rAstro 1.1s cubic-bezier(.3,1.3,.5,1)}
@keyframes rAstro{
  0%{transform:scale(1,1) translateY(0)}
  16%{transform:scale(1.08,.88) translateY(4px)}
  38%{transform:scale(.92,1.1) translateY(-18px)}
  54%{transform:scale(.9,1.12) translateY(-22px)}
  70%{transform:scale(1.06,.92) translateY(0)}
  84%{transform:scale(.97,1.03) translateY(-2px)}
  100%{transform:scale(1,1) translateY(0)}}

.wrap.r-king{animation:rKing .95s cubic-bezier(.34,1.4,.5,1)}
@keyframes rKing{
  0%{transform:scale(1,1) translateY(0)}
  18%{transform:scale(1.12,.86) translateY(6px)}
  38%{transform:scale(.9,1.14) translateY(-20px)}
  54%{transform:scale(1.08,.92) translateY(0)}
  68%{transform:scale(.96,1.06) translateY(-8px)}
  82%{transform:scale(1.02,.98) translateY(0)}
  100%{transform:scale(1,1) translateY(0)}}

/* base pig */
.pigA{width:180px;height:168px;position:relative;overflow:visible}
.pigA .head{position:absolute;inset:0;border-radius:46% 46% 44% 44%/50% 50% 46% 46%;
  background:radial-gradient(circle at 34% 26%,#FFE4DE 0%,#FDC9C0 30%,#F6ABA0 62%,#E98D82 100%);
  box-shadow:inset 8px 12px 22px rgba(255,255,255,.75),inset -12px -18px 28px rgba(190,90,80,.38),inset 0 -4px 8px rgba(255,255,255,.2),0 14px 28px rgba(140,50,42,.28)}
.pigA .head::before{content:"";position:absolute;top:10px;left:26px;width:74px;height:44px;border-radius:50%;
  background:radial-gradient(ellipse,rgba(255,255,255,.65),rgba(255,255,255,0) 70%);filter:blur(4px)}
.pigA .ear{position:absolute;top:-22px;width:58px;height:62px;
  background:radial-gradient(circle at 45% 40%,#FDCFC7,#F3A296 68%,#E88C80);
  border-radius:70% 30% 60% 40%/78% 78% 22% 22%;
  box-shadow:inset 6px 8px 12px rgba(255,255,255,.5),inset -6px -8px 14px rgba(190,90,80,.35),0 4px 10px rgba(140,50,42,.15);transform-origin:50% 90%}
.pigA .ear::after{content:"";position:absolute;top:14px;left:16px;width:26px;height:30px;
  border-radius:70% 30% 60% 40%/78% 78% 22% 22%;background:radial-gradient(circle at 45% 40%,#F49A93,#E37B72);filter:blur(1px)}
.pigA .ear.l{left:8px;transform:rotate(-14deg)}.pigA .ear.r{right:8px;transform:rotate(14deg) scaleX(-1)}
.eye{position:absolute;width:14px;height:15px;top:62px;background:#000;border-radius:50%}
.eye.l{left:42px}.eye.r{right:42px}
.blinking .eye{animation:blink .16s ease-in-out}
@keyframes blink{50%{transform:scaleY(.1)}}
.pigA .snout{position:absolute;top:76px;left:50%;transform:translateX(-50%);width:78px;height:56px;border-radius:48%;
  background:radial-gradient(circle at 36% 28%,#FBB9AE,#F0958A 58%,#E07E73);
  box-shadow:inset 5px 7px 10px rgba(255,255,255,.55),inset -6px -9px 12px rgba(180,80,70,.4),0 5px 12px rgba(140,50,42,.22);z-index:2}
.nostril{position:absolute;top:50%;transform:translateY(-50%);width:11px;height:17px;border-radius:50%;
  background:radial-gradient(circle at 42% 32%,#C4655B,#9E4A41);box-shadow:inset 0 2px 3px rgba(0,0,0,.25)}
.nostril.l{left:18px}.nostril.r{right:18px}
.cheekB{position:absolute;border-radius:50%;filter:blur(2px);top:96px;width:26px;height:15px;
  background:radial-gradient(circle,#F98F84,rgba(249,143,132,0) 72%)}
.cheekB.l{left:10px}.cheekB.r{right:10px}

.snout-pulse .snout{animation:snoutPop .4s cubic-bezier(.34,1.4,.5,1)}
@keyframes snoutPop{0%{transform:translateX(-50%) scale(1)}40%{transform:translateX(-50%) scale(1.18,1.1)}70%{transform:translateX(-50%) scale(.95)}100%{transform:translateX(-50%) scale(1)}}

/* speech bubble */
.bubble{position:absolute;top:15%;left:50%;z-index:9;white-space:normal;
  background:#FFF5F8;color:#2D2D2D;font-weight:500;font-size:13px;letter-spacing:.02em;
  padding:8px 14px;border-radius:14px;border:1.5px solid rgba(255,133,160,0.3);
  box-shadow:0 4px 10px rgba(255,133,160,.15);
  transform:translate(-50%,0);opacity:0;
  max-width:85%;text-align:center;word-wrap:break-word}
.bubble::after{content:"";position:absolute;bottom:-9px;left:50%;transform:translateX(-50%);
  width:0;height:0;border:7px solid transparent;border-top-color:var(--bc,#E0A093);border-bottom:0}
`;

export const SKIN_CSS = {
  pirate: `
.bandana{position:absolute;top:-6px;left:5px;right:5px;height:54px;
  border-radius:50% 50% 40% 40%/88% 88% 26% 26%;
  background:radial-gradient(circle,rgba(255,255,255,.85) 2.4px,rgba(0,0,0,0) 2.9px) 6px 4px/24px 17px,
    radial-gradient(circle at 35% 30%,#E85D55,#C23B33 65%,#A32C25);
  box-shadow:inset 4px 5px 8px rgba(255,255,255,.35),inset -5px -7px 10px rgba(120,25,20,.4),0 3px 8px rgba(120,30,25,.2);z-index:3}
.bandTail{position:absolute;background:linear-gradient(180deg,#D9483F,#A32C25);border-radius:6px;z-index:3}
.bandTail.t1{top:26px;right:-14px;width:30px;height:12px;transform:rotate(34deg)}
.bandTail.t2{top:38px;right:-10px;width:24px;height:10px;transform:rotate(58deg)}
.strap{position:absolute;top:57px;left:2px;right:2px;height:5px;background:#1E1E22;transform:rotate(-9deg);z-index:2;border-radius:3px}
.patch{position:absolute;top:53px;right:33px;width:29px;height:27px;border-radius:46%;
  background:radial-gradient(circle at 35% 30%,#3C3C42,#131316);z-index:3;
  box-shadow:inset 2px 2px 3px rgba(255,255,255,.15),0 2px 4px rgba(0,0,0,.3)}
.hoop{position:absolute;top:36px;left:0px;width:17px;height:17px;border:3.5px solid #F2C14E;border-radius:50%;z-index:3;
  box-shadow:0 2px 3px rgba(120,80,10,.4),inset 1px 1px 2px rgba(255,255,255,.5)}
.hook{position:absolute;right:-30px;top:110px;width:36px;height:48px;z-index:1;transform:rotate(20deg);transform-origin:50% 92%}
.hook::before{content:"";position:absolute;top:0;left:4px;width:26px;height:28px;
  border:6.5px solid #CDD3DC;border-top-color:transparent;border-right-color:transparent;
  border-radius:50%;transform:rotate(-42deg);filter:drop-shadow(0 1px 2px rgba(40,45,60,.35))}
.hook::after{content:"";position:absolute;bottom:0;left:8px;width:20px;height:18px;border-radius:6px 6px 9px 9px;
  background:linear-gradient(180deg,#7A5638,#5B3E26);box-shadow:inset 2px 2px 3px rgba(255,255,255,.25)}
`,
  baller: `
.hband{position:absolute;top:35px;left:13px;right:13px;height:17px;border-radius:10px;
  background:linear-gradient(180deg,#E6413A 0 33%,#F7F3EA 33% 66%,#3457C4 66% 100%);
  box-shadow:inset 2px 2px 4px rgba(255,255,255,.45),0 2px 5px rgba(120,40,30,.25);z-index:3}
.earband{position:absolute;width:30px;height:11px;border-radius:6px;
  background:linear-gradient(180deg,#E6413A 0 33%,#F7F3EA 33% 66%,#3457C4 66% 100%);z-index:3;
  box-shadow:0 1px 3px rgba(120,40,30,.25)}
.earband.l{top:0px;left:20px;transform:rotate(-14deg)}.earband.r{top:0px;right:20px;transform:rotate(14deg)}
.bball{position:absolute;bottom:26px;right:14px;width:46px;height:46px;border-radius:50%;
  background:radial-gradient(circle at 34% 28%,#F2913D,#D9702A 60%,#B4551C);
  box-shadow:inset 3px 4px 6px rgba(255,255,255,.4),inset -4px -5px 8px rgba(90,30,10,.35),0 6px 10px rgba(120,40,30,.3);
  animation:bounce 1.15s cubic-bezier(.45,.05,.55,1) infinite;z-index:1}
.bball::before{content:"";position:absolute;left:50%;top:0;bottom:0;width:2.5px;margin-left:-1.25px;background:#8A4517;border-radius:2px}
.bball::after{content:"";position:absolute;top:50%;left:0;right:0;height:2.5px;margin-top:-1.25px;background:#8A4517;border-radius:50%}
@keyframes bounce{0%,100%{transform:translateY(0) scale(1.08,.9)}12%{transform:translateY(-6px) scale(1,1)}50%{transform:translateY(-42px) scale(.97,1.05)}88%{transform:translateY(-6px) scale(1,1)}}
`,
  ghost: `
.pigA.ghost{filter:drop-shadow(0 0 16px rgba(195,215,255,.7));opacity:.96}
.ghost .head{background:radial-gradient(circle at 34% 26%,#FFFFFF 0%,#EDF2FC 32%,#CBD7EE 64%,#ABBAD9 100%);
  box-shadow:inset 8px 12px 22px rgba(255,255,255,.95),inset -12px -18px 28px rgba(110,130,175,.42),inset 0 -4px 8px rgba(255,255,255,.3),0 14px 28px rgba(80,100,150,.22)}
.ghost .ear{background:radial-gradient(circle at 45% 40%,#F4F8FF,#CBD7EE 68%,#B2C1DF);
  box-shadow:inset 6px 8px 12px rgba(255,255,255,.7),inset -6px -8px 14px rgba(110,130,175,.4),0 4px 10px rgba(80,100,150,.14)}
.ghost .ear::after{background:radial-gradient(circle at 45% 40%,#C6D2EA,#A1B2D4)}
.ghost .snout{background:radial-gradient(circle at 36% 28%,#F0F4FE,#C9D5EC 58%,#B0BFDD);
  box-shadow:inset 5px 7px 10px rgba(255,255,255,.75),inset -6px -9px 12px rgba(100,120,165,.42),0 5px 12px rgba(80,100,150,.2)}
.ghost .nostril{background:radial-gradient(circle at 42% 32%,#7284A8,#505E80)}
.ghost .cheekB{background:radial-gradient(circle,#C0CEEC,rgba(192,206,236,0) 72%)}
.wisp{position:absolute;top:-18px;left:50%;width:15px;height:22px;
  border-radius:50% 50% 50% 0;transform:translateX(-50%) rotate(-20deg);
  background:linear-gradient(180deg,#FFFFFF,#D8E2F6);opacity:.95;z-index:3;
  box-shadow:0 0 8px rgba(210,225,255,.8)}
`,
  zombie: `
.zombie .head{background:radial-gradient(circle at 34% 26%,#F1F7E0 0%,#DAE9B8 30%,#ADCA82 62%,#87A95E 100%);
  box-shadow:inset 8px 12px 22px rgba(255,255,255,.7),inset -12px -18px 28px rgba(95,125,60,.42),inset 0 -4px 8px rgba(255,255,255,.2),0 14px 28px rgba(80,105,50,.28)}
.zombie .ear{background:radial-gradient(circle at 45% 40%,#E3EFC4,#AECB84 68%,#93B168);
  box-shadow:inset 6px 8px 12px rgba(255,255,255,.5),inset -6px -8px 14px rgba(95,125,60,.4),0 4px 10px rgba(80,105,50,.15)}
.zombie .ear::after{background:radial-gradient(circle at 45% 40%,#A3BE77,#84A05A)}
.zombie .ear.r{transform:rotate(48deg) scaleX(-1);top:-8px}
.zombie .snout{background:radial-gradient(circle at 36% 28%,#E2EDC2,#A9C179 58%,#8CA65F);
  box-shadow:inset 5px 7px 10px rgba(255,255,255,.55),inset -6px -9px 12px rgba(85,110,55,.45),0 5px 12px rgba(80,105,50,.22)}
.zombie .nostril{background:radial-gradient(circle at 42% 32%,#647A45,#46572E)}
.zombie .cheekB{background:radial-gradient(circle,#9DB57A,rgba(157,181,122,0) 72%)}
.stitch{position:absolute;top:26px;left:32px;width:46px;height:3.5px;background:#44543A;transform:rotate(-22deg);z-index:3;border-radius:2px}
.stitch i{position:absolute;top:-4px;width:3.5px;height:11px;background:#44543A;border-radius:2px}
.stitch i:nth-child(1){left:18%}.stitch i:nth-child(2){left:48%}.stitch i:nth-child(3){left:78%}
.bag{position:absolute;top:79px;width:16px;height:6px;border-radius:0 0 9px 9px;background:rgba(70,90,50,.4);filter:blur(.5px)}
.bag.l{left:41px}.bag.r{right:41px}
`,
  punk: `
.spike{position:absolute;width:17px;clip-path:polygon(50% 0,100% 100%,0 100%);
  background:linear-gradient(180deg,#FF54A4,#D42B7C);z-index:1;filter:drop-shadow(0 2px 3px rgba(150,30,90,.35))}
.spike.s1{left:54px;top:-30px;height:34px;transform:rotate(-10deg)}
.spike.s2{left:73px;top:-40px;height:44px;transform:rotate(-3deg)}
.spike.s3{left:92px;top:-40px;height:44px;transform:rotate(3deg)}
.spike.s4{left:111px;top:-30px;height:34px;transform:rotate(10deg)}
.septum{position:absolute;top:112px;left:50%;width:20px;height:20px;border:3.5px solid #CDD2DB;border-radius:50%;
  clip-path:inset(46% 0 0 0);z-index:4;transform:translateX(-50%);transform-origin:50% 20%;
  filter:drop-shadow(0 1px 2px rgba(40,45,60,.4))}
.stud{position:absolute;top:20px;right:22px;width:8px;height:8px;border-radius:50%;
  background:radial-gradient(circle at 35% 30%,#F6F8FB,#99A0AD);z-index:3;box-shadow:0 1px 2px rgba(40,45,60,.4)}
.star{position:absolute;pointer-events:none;font-size:18px;z-index:8;will-change:transform,opacity}
`,
  cowboy: `
.cowhat{position:absolute;top:-28px;left:50%;transform:translateX(-50%);width:140px;height:50px;z-index:3}
.cowhat .brim{position:absolute;bottom:0;left:0;right:0;height:16px;border-radius:50%;
  background:radial-gradient(circle at 40% 30%,#D4A056,#B8863A 60%,#9A6E2E);
  box-shadow:inset 3px 3px 5px rgba(255,255,255,.4),inset -3px -4px 6px rgba(100,60,20,.35),0 4px 8px rgba(100,60,20,.3)}
.cowhat .crown{position:absolute;bottom:10px;left:28px;right:28px;height:36px;
  border-radius:40% 40% 0 0/70% 70% 0 0;
  background:radial-gradient(circle at 35% 25%,#E8B86A,#D4A056 55%,#B8863A);
  box-shadow:inset 4px 5px 8px rgba(255,255,255,.45),inset -4px -6px 8px rgba(100,60,20,.4)}
.cowhat .band{position:absolute;bottom:10px;left:28px;right:28px;height:8px;
  background:linear-gradient(180deg,#7A4A2E,#5B3820);border-radius:2px}
.lasso{position:absolute;right:-24px;top:100px;width:30px;height:30px;border:4px solid #C9A060;border-radius:50%;z-index:1;
  box-shadow:0 2px 4px rgba(100,60,20,.3);transform-origin:50% -20px}
`,
  devil: `
.devil .head{background:radial-gradient(circle at 34% 26%,#FFD4D4 0%,#F5A0A0 30%,#E06060 62%,#C03030 100%);
  box-shadow:inset 8px 12px 22px rgba(255,255,255,.65),inset -12px -18px 28px rgba(140,30,30,.42),inset 0 -4px 8px rgba(255,255,255,.2),0 14px 28px rgba(120,20,20,.3)}
.devil .ear{background:radial-gradient(circle at 45% 40%,#F5B0B0,#E07070 68%,#C84040);
  box-shadow:inset 6px 8px 12px rgba(255,255,255,.5),inset -6px -8px 14px rgba(140,30,30,.4),0 4px 10px rgba(120,20,20,.15)}
.devil .ear::after{background:radial-gradient(circle at 45% 40%,#D06060,#B03030)}
.devil .snout{background:radial-gradient(circle at 36% 28%,#F5B0A0,#E07060 58%,#C84838);
  box-shadow:inset 5px 7px 10px rgba(255,255,255,.5),inset -6px -9px 12px rgba(140,30,20,.45),0 5px 12px rgba(120,20,20,.22)}
.devil .nostril{background:radial-gradient(circle at 42% 32%,#8A2020,#601010)}
.devil .cheekB{background:radial-gradient(circle,#F07070,rgba(240,112,112,0) 72%)}
.horn{position:absolute;z-index:3;width:14px;
  background:linear-gradient(180deg,#2A2A2E,#4A4A50 40%,#1A1A1E);
  clip-path:polygon(50% 0,100% 100%,0 100%);
  filter:drop-shadow(0 2px 3px rgba(0,0,0,.4))}
.horn.hl{left:38px;top:-26px;height:30px;transform:rotate(-15deg)}
.horn.hr{right:38px;top:-26px;height:30px;transform:rotate(15deg)}
.dtail{position:absolute;bottom:18px;left:-16px;width:28px;height:40px;z-index:0}
.dtail::before{content:"";position:absolute;left:0;top:0;width:100%;height:100%;
  border:4px solid #C03030;border-radius:50%;border-top-color:transparent;border-right-color:transparent;transform:rotate(30deg)}
.dtail::after{content:"";position:absolute;bottom:-2px;left:2px;width:12px;height:8px;
  background:#C03030;clip-path:polygon(50% 0,100% 100%,0 100%);transform:rotate(-60deg)}
`,
  astro: `
.helmet{position:absolute;inset:-14px -10px -6px;border-radius:50%;z-index:4;
  background:radial-gradient(circle at 30% 25%,rgba(255,255,255,.35),rgba(255,255,255,.08) 60%,rgba(200,220,255,.1));
  border:3px solid rgba(200,210,230,.6);
  box-shadow:inset 4px 6px 14px rgba(255,255,255,.3),inset -6px -8px 14px rgba(80,100,140,.15),0 6px 16px rgba(80,100,140,.2)}
.helmet::before{content:"";position:absolute;top:8px;left:16px;width:50px;height:30px;border-radius:50%;
  background:radial-gradient(ellipse,rgba(255,255,255,.5),rgba(255,255,255,0) 70%);filter:blur(3px)}
.antenna{position:absolute;top:-32px;left:50%;transform:translateX(-50%);width:4px;height:20px;
  background:linear-gradient(180deg,#CDD3DC,#9AA0AD);border-radius:2px;z-index:5}
.antenna::after{content:"";position:absolute;top:-6px;left:50%;transform:translateX(-50%);
  width:10px;height:10px;border-radius:50%;background:radial-gradient(circle at 35% 30%,#FF6B6B,#E04040);
  box-shadow:0 0 8px rgba(255,80,80,.6);animation:antBlink 2s ease-in-out infinite}
@keyframes antBlink{0%,100%{opacity:1;box-shadow:0 0 8px rgba(255,80,80,.6)}50%{opacity:.4;box-shadow:0 0 3px rgba(255,80,80,.3)}}
`,
  king: `
.kcrown{position:absolute;top:-22px;left:50%;transform:translateX(-50%);width:100px;height:40px;z-index:3}
.kcrown .base{position:absolute;bottom:0;left:0;right:0;height:14px;border-radius:3px;
  background:linear-gradient(180deg,#FFD700,#E6B800);
  box-shadow:inset 2px 2px 4px rgba(255,255,255,.5),0 3px 6px rgba(160,120,0,.3)}
.kcrown .pt{position:absolute;bottom:10px;width:18px;
  background:linear-gradient(180deg,#FFD700,#E6B800);clip-path:polygon(50% 0,100% 100%,0 100%)}
.kcrown .pt.p1{left:6px;height:26px;transform:rotate(-6deg)}
.kcrown .pt.p2{left:26px;height:32px;transform:rotate(-2deg)}
.kcrown .pt.p3{left:50%;transform:translateX(-50%);height:36px}
.kcrown .pt.p4{right:26px;height:32px;transform:rotate(2deg)}
.kcrown .pt.p5{right:6px;height:26px;transform:rotate(6deg)}
.gem{position:absolute;width:8px;height:8px;border-radius:50%;z-index:4;
  box-shadow:inset 1px 1px 2px rgba(255,255,255,.6),0 1px 3px rgba(0,0,0,.3)}
.gem.g1{bottom:3px;left:20px;background:radial-gradient(circle at 35% 30%,#FF6B8A,#D42B5A)}
.gem.g2{bottom:3px;left:50%;transform:translateX(-50%);background:radial-gradient(circle at 35% 30%,#6BD4FF,#2B8AD4);width:10px;height:10px}
.gem.g3{bottom:3px;right:20px;background:radial-gradient(circle at 35% 30%,#6BFF8A,#2BD45A)}
.cape{position:absolute;top:151px;left:50%;transform:translateX(-50%);width:200px;height:55px;z-index:-1;
  background:linear-gradient(180deg,#C02040 0%,#A01830 60%,#8A1030);
  clip-path:polygon(15% 0%,85% 0%,100% 100%,0% 100%);
  box-shadow:0 4px 10px rgba(100,10,20,.2)}
.fur{position:absolute;top:144px;left:50%;transform:translateX(-50%);width:150px;height:24px;z-index:1;
  background:#F5F0E8;border-radius:6px;
  box-shadow:0 2px 4px rgba(100,60,40,.12)}
.fur::before{content:"";position:absolute;top:4px;left:10px;right:10px;height:16px;
  background:radial-gradient(circle,#2A2A2E 1.2px,transparent 1.2px) 0 0/8px 8px}
`,
};

export const SKIN_EXTRAS_HTML = {
  default: "",
  pirate: '<div class="bandana"></div><div class="bandTail t1"></div><div class="bandTail t2"></div><div class="strap"></div><div class="patch"></div><div class="hoop"></div><div class="hook"></div>',
  baller: '<div class="hband"></div><div class="earband l"></div><div class="earband r"></div>',
  ghost: '<div class="wisp"></div>',
  zombie: '<div class="stitch"><i></i><i></i><i></i></div><div class="bag l"></div><div class="bag r"></div>',
  punk: '<div class="spike s1"></div><div class="spike s2"></div><div class="spike s3"></div><div class="spike s4"></div><div class="septum"></div><div class="stud"></div>',
  cowboy: '<div class="cowhat"><div class="crown"></div><div class="band"></div><div class="brim"></div></div><div class="lasso"></div>',
  devil: '<div class="horn hl"></div><div class="horn hr"></div><div class="dtail"></div>',
  astro: '<div class="helmet"></div><div class="antenna"></div>',
  king: '<div class="kcrown"><div class="pt p1"></div><div class="pt p2"></div><div class="pt p3"></div><div class="pt p4"></div><div class="pt p5"></div><div class="base"></div><div class="gem g1"></div><div class="gem g2"></div><div class="gem g3"></div></div><div class="fur"></div><div class="cape"></div>',
};

const SKIN_STAGE_EXTRAS = {
  baller: '<div class="bball"></div>',
};

export const SKIN_CLASS = {
  ghost: "ghost",
  zombie: "zombie",
  devil: "devil",
};

const SKIN_REACTION = {
  default: { reactions: "['poked','jiggle','squish','hop','wobble']", themed: false },
  pirate: { reaction: "r-pirate", say: "ARGH!", bc: "#C23B33", fxKey: "pirate" },
  baller: { reaction: "r-swish", say: "SWISH!", bc: "#3457C4", fxKey: "swish" },
  ghost: { reaction: "r-ghost", say: "BOO!", bc: "#8FA5D6", fxKey: "ghost", floaty: true },
  zombie: { reaction: "r-zombie", say: "BRAAAINS…", bc: "#87A95E", fxKey: "zombie" },
  punk: { reaction: "r-punk", say: "OI! OI!", bc: "#D42B7C", fxKey: "punk" },
  cowboy: { reaction: "r-cowboy", say: "YEEHAW!", bc: "#B8863A", fxKey: "cowboy" },
  devil: { reaction: "r-devil", say: "MUAHAHA", bc: "#C03030", fxKey: "devil" },
  astro: { reaction: "r-astro", say: "HOUSTON…", bc: "#4A8AD6", fxKey: "astro" },
  king: { reaction: "r-king", say: "KNEEL!", bc: "#E6B800", fxKey: "king" },
};

const IDLE_CHATTER = {
  default: [
    "Must...scroll...", "Help! I can't stop scrollin!!", "Feed me slop!", "I'm addicted to slop baby!",
    "Just one more scroll...", "Belly full of slop, heck yeah", "Gimme that sweet sweet phone slop.",
    "More screen time please!", "Can't. Put. Phone. Down.", "Eating from the slop trough like it's my friggin job",
  ],
  pirate: [
    "Arrr, more slop!", "Scrollin' the seven seas!", "Yo ho ho I'm a hog for scroll.",
    "Gonna get scurvy if you don't gimme slop.", "Captain needs his scroll!", "Slop ahoy!",
    "My hook can't stop scrollin'!", "Treasure? Nah, give me some dang TikTok!", "Arrr, feed me slop!",
  ],
  baller: [
    "Ball is life? Uh, actually scroll is life!", "Swish! Another hour gone!", "From way downtown I be scrollin",
    "Dribbling through content", "I'm the MJ of screen time.", "Nothing but net...flix!",
    "Pay the old man money.", "MVP of averaging 50 likes a post.", "No timeouts from my friggin phone.", "Sloppy assist!",
  ],
  ghost: [
    "Boo! I'm a ghost pig addicted to scrolling.", "Haunting your feed lol", "Ghosting my responsibilities!",
    "Can't rest eternally…must scroll!", "Spooky amount of screen time!", "I'm dead inside AND outside.",
    "Boo-tiful slop!", "I'm the ghost of christmas slop.",
  ],
  zombie: [
    "Slop...need more slop...", "Came back from the dead just to look at reels lol.", "Braaaaains. and scrolling.",
    "Zombies be eatin brains and phone slop.", "Rotting away on my phone!", "Graaah...",
    "Walking dead but used to be scrolling alive.", "Slop forever and ever and ever and ev-",
  ],
  punk: [
    "Rules are for non-scrollers!", "Slop it to me baby!", "He was a scroller boi she said scroll ya later boi",
    "No rules, only reels!", "Rage scrolling to piss off my parents", "Down with productivity.",
    "Mosh pit on tiktok w/ the boys tn.", "Oink and destroy!",
  ],
  cowboy: [
    "Yeehaw, ridin' the feed!", "Goin hog wild on my phone rn", "This ain't my first scroll-deo",
    "Lasso me more of that sweet sweet content!", "Saddle up for screen time!", "Howdy, partner let's look at our phones",
    "There's a snake in my phone!", "I'm a cowboy pig with an iphone lol", "I'm on the frontier of slop",
  ],
  devil: [
    "Sold your soul for the scroll", "My only sin is sleeping when I should be looking at my phone.",
    "It's burning hot down here lol my phone ain't workin great", "Hell is a room without wifi.",
    "Devilishly addicted to content", "I'm the scroll devil baby hell yeah",
    "You've been damned to SCROLL.", "Tryna spend eternity on my phone",
  ],
  astro: [
    "Houston, I'm gonna scroll!", "One small scroll for piggies…", "Lost in endless slop",
    "Ground control to Major Scroll…", "Mission: more screen time!", "Houston, feed me some slop.",
    "If my phone dies shoot me into the friggin sun",
  ],
  king: [
    "Kneel before my screen time, pig!", "A royal decree: MORE SLOP!", "The crown demands content for my brain",
    "I rule the feeds", "Bow to the slop king", "Peasants do my scrolling for me.",
    "My kingdom for more reels!", "I'd win game of thrones if it was about looking at your phone the most.",
    "Reigning over your views and likes.",
  ],
};

// Per-skin extra FX JS (hook swing, ball arc, etc.)
const SKIN_FX_JS = {
  pirate: `
    var hook=document.querySelector('.hook');
    hook.animate([
      {transform:'rotate(20deg) translateY(0)'},
      {transform:'rotate(-30deg) translateY(-34px)',offset:.3},
      {transform:'rotate(-12deg) translateY(-30px)',offset:.48},
      {transform:'rotate(-32deg) translateY(-34px)',offset:.66},
      {transform:'rotate(20deg) translateY(0)'}
    ],{duration:950,easing:'cubic-bezier(.34,1.3,.5,1)'});`,
  swish: `
    var ball=document.querySelector('.bball');
    ball.style.animation='none';
    ball.animate([
      {transform:'translate(0,0) rotate(0deg) scale(1)'},
      {transform:'translate(-90px,-150px) rotate(-240deg) scale(.94)',offset:.42},
      {transform:'translate(-180px,-40px) rotate(-420deg) scale(1)',offset:.66},
      {transform:'translate(-90px,-120px) rotate(-600deg)',offset:.84},
      {transform:'translate(0,0) rotate(-720deg) scale(1.06,.92)'}
    ],{duration:950,easing:'cubic-bezier(.45,.1,.5,1)'}).onfinish=function(){ball.style.animation=''};`,
  ghost: `
    var pig=document.querySelector('.pigA');
    pig.classList.remove('flicker');void pig.offsetWidth;pig.classList.add('flicker');
    var wisp=document.querySelector('.wisp');
    wisp.animate([
      {transform:'translateX(-50%) rotate(-20deg)'},
      {transform:'translateX(-50%) rotate(14deg)',offset:.3},
      {transform:'translateX(-50%) rotate(-26deg)',offset:.6},
      {transform:'translateX(-50%) rotate(-20deg)'}
    ],{duration:800,easing:'ease-in-out'});
    setTimeout(function(){pig.classList.remove('flicker')},1050);`,
  zombie: `
    var ear=document.querySelector('.zombie .ear.r');
    if(ear)ear.animate([
      {transform:'rotate(48deg) scaleX(-1)'},
      {transform:'rotate(74deg) scaleX(-1)',offset:.28},
      {transform:'rotate(42deg) scaleX(-1)',offset:.55},
      {transform:'rotate(66deg) scaleX(-1)',offset:.78},
      {transform:'rotate(48deg) scaleX(-1)'}
    ],{duration:1050,easing:'ease-in-out'});`,
  punk: `
    var sep=document.querySelector('.septum');
    sep.animate([
      {transform:'translateX(-50%) rotate(0deg)'},
      {transform:'translateX(-50%) rotate(30deg)',offset:.2},
      {transform:'translateX(-50%) rotate(-26deg)',offset:.42},
      {transform:'translateX(-50%) rotate(18deg)',offset:.64},
      {transform:'translateX(-50%) rotate(-10deg)',offset:.82},
      {transform:'translateX(-50%) rotate(0deg)'}
    ],{duration:900,easing:'ease-in-out'});
    var stage=document.querySelector('.stage');
    for(var i=0;i<5;i++){
      var st=document.createElement('div');st.className='star';
      st.textContent=['\\u26A1','\\u2726','\\u26A1','\\u2726','\\u26A1'][i];
      st.style.left=(105+Math.random()*40)+'px';st.style.top='60px';
      stage.appendChild(st);
      var ang=(-100+Math.random()*110)*Math.PI/180;var dist=44+Math.random()*56;
      st.animate([
        {transform:'translate(0,0) scale(.5) rotate(0deg)',opacity:1},
        {transform:'translate('+Math.cos(ang)*dist+'px,'+Math.sin(ang)*dist+'px) scale(1.1) rotate('+(Math.random()*220-110)+'deg)',opacity:0}
      ],{duration:620+Math.random()*260,easing:'cubic-bezier(.2,.6,.4,1)'}).onfinish=function(){this.effect.target.remove()};
    }`,
  cowboy: `
    var lasso=document.querySelector('.lasso');
    lasso.animate([
      {transform:'rotate(0deg)'},
      {transform:'rotate(360deg) scale(1.1)',offset:.35},
      {transform:'rotate(720deg) scale(1.3)',offset:.55},
      {transform:'rotate(1080deg) scale(.9)',offset:.8},
      {transform:'rotate(1080deg) scale(1)'}
    ],{duration:1000,easing:'cubic-bezier(.3,.8,.5,1)'});
    var hat=document.querySelector('.cowhat');
    hat.animate([
      {transform:'translateY(0)'},
      {transform:'translateY(-14px)',offset:.3},
      {transform:'translateY(-4px)',offset:.6},
      {transform:'translateY(0)'}
    ],{duration:900,easing:'cubic-bezier(.34,1.4,.5,1)'});`,
  devil: `
    var horns=document.querySelectorAll('.horn');
    horns.forEach(function(h){
      var isL=h.classList.contains('hl');
      var base=isL?-15:15;
      h.animate([
        {transform:'rotate('+base+'deg)'},
        {transform:'rotate('+(base+(isL?-10:10))+'deg) scaleY(1.2)',offset:.35},
        {transform:'rotate('+(base+(isL?5:-5))+'deg) scaleY(1.3)',offset:.55},
        {transform:'rotate('+base+'deg) scaleY(1)'}
      ],{duration:800,easing:'cubic-bezier(.34,1.3,.5,1)'});
    });
    var tail=document.querySelector('.dtail');
    if(tail)tail.animate([
      {transform:'scaleX(1)'},
      {transform:'scaleX(-1)',offset:.25},
      {transform:'scaleX(1)',offset:.5},
      {transform:'scaleX(-1)',offset:.75},
      {transform:'scaleX(1)'}
    ],{duration:900,easing:'ease-in-out'});
    var stage=document.querySelector('.stage');
    var cx=stage.offsetWidth/2,cy=stage.offsetHeight*.4;
    for(var i=0;i<4;i++){
      var fl=document.createElement('div');fl.className='star';
      fl.textContent='\\u{1F525}';fl.style.fontSize='16px';
      fl.style.left=cx+'px';fl.style.top=cy+'px';
      stage.appendChild(fl);
      var ang=Math.random()*Math.PI*2;var dist=40+Math.random()*50;
      fl.animate([
        {transform:'translate(0,0) scale(.4)',opacity:1},
        {transform:'translate('+Math.cos(ang)*dist+'px,'+Math.sin(ang)*dist+'px) scale(1.2)',opacity:0}
      ],{duration:550+Math.random()*250,easing:'cubic-bezier(.2,.6,.4,1)'}).onfinish=function(){this.effect.target.remove()};
    }`,
  astro: `
    var antenna=document.querySelector('.antenna');
    if(antenna)antenna.animate([
      {transform:'translateY(0)'},
      {transform:'translateY(-6px)',offset:.2},
      {transform:'translateY(2px)',offset:.5},
      {transform:'translateY(-3px)',offset:.75},
      {transform:'translateY(0)'}
    ],{duration:900,easing:'ease-in-out'});
    var helmet=document.querySelector('.helmet');
    if(helmet)helmet.animate([
      {opacity:1},
      {opacity:.5,offset:.3},
      {opacity:1,offset:.5},
      {opacity:.6,offset:.7},
      {opacity:1}
    ],{duration:800});
    var stage=document.querySelector('.stage');
    var cx=stage.offsetWidth/2,cy=stage.offsetHeight*.4;
    for(var i=0;i<6;i++){
      var st=document.createElement('div');st.className='star';
      st.textContent=['\\u2B50','\\u2726','\\u2728','\\u2B50','\\u2726','\\u2728'][i];st.style.fontSize='14px';
      st.style.left=cx+'px';st.style.top=cy+'px';
      stage.appendChild(st);
      var ang=Math.random()*Math.PI*2;var dist=50+Math.random()*60;
      st.animate([
        {transform:'translate(0,0) scale(.3)',opacity:1},
        {transform:'translate('+Math.cos(ang)*dist+'px,'+Math.sin(ang)*dist+'px) scale(.8)',opacity:0}
      ],{duration:700+Math.random()*400,easing:'cubic-bezier(.2,.6,.4,1)'}).onfinish=function(){this.effect.target.remove()};
    }`,
  king: `
    var crown=document.querySelector('.kcrown');
    if(crown)crown.animate([
      {transform:'translateX(-50%) translateY(0)'},
      {transform:'translateX(-50%) translateY(-6px)',offset:.28},
      {transform:'translateX(-50%) translateY(-4px)',offset:.55},
      {transform:'translateX(-50%) translateY(-1px)',offset:.78},
      {transform:'translateX(-50%) translateY(0)'}
    ],{duration:950,easing:'cubic-bezier(.34,1.4,.5,1)'});
    var cape=document.querySelector('.cape');
    if(cape)cape.animate([
      {transform:'translateX(-50%) scaleY(1)'},
      {transform:'translateX(-50%) scaleY(1.08)',offset:.3},
      {transform:'translateX(-50%) scaleY(.95)',offset:.6},
      {transform:'translateX(-50%) scaleY(1)'}
    ],{duration:900,easing:'cubic-bezier(.34,1.3,.5,1)'});
    var stage=document.querySelector('.stage');
    var cx=stage.offsetWidth/2,cy=stage.offsetHeight*.35;
    for(var i=0;i<5;i++){
      var sp=document.createElement('div');sp.className='star';
      sp.textContent='\\u2726';sp.style.fontSize='16px';sp.style.color='#FFD700';
      sp.style.left=cx+'px';sp.style.top=cy+'px';
      stage.appendChild(sp);
      var ang=Math.random()*Math.PI*2;var dist=45+Math.random()*55;
      sp.animate([
        {transform:'translate(0,0) scale(.3)',opacity:1},
        {transform:'translate('+Math.cos(ang)*dist+'px,'+Math.sin(ang)*dist+'px) scale(1)',opacity:0}
      ],{duration:650+Math.random()*300,easing:'cubic-bezier(.2,.6,.4,1)'}).onfinish=function(){this.effect.target.remove()};
    }`,
};

function buildBubbleJS(say, bc, idleMessages) {
  const msgArray = JSON.stringify(idleMessages || []);
  return `
var _bubbleBC='${bc}';
var _activeBubble=null;
var _activeBubbleAnim=null;
function showBubble(msg){
  if(_activeBubble){_activeBubble.remove();_activeBubble=null;}
  if(_activeBubbleAnim){_activeBubbleAnim.cancel();_activeBubbleAnim=null;}
  var b=document.createElement('div');b.className='bubble';
  b.style.setProperty('--bc',_bubbleBC);b.textContent=msg||'${say}';
  document.querySelector('.stage').appendChild(b);
  _activeBubble=b;
  _activeBubbleAnim=b.animate([
    {transform:'translate(-50%,4px)',opacity:0},
    {transform:'translate(-50%,0)',opacity:1,offset:.08},
    {transform:'translate(-50%,0)',opacity:1,offset:.9},
    {transform:'translate(-50%,-6px)',opacity:0}
  ],{duration:4500,fill:'forwards'});
  _activeBubbleAnim.onfinish=function(){b.remove();_activeBubble=null;_activeBubbleAnim=null;};
}
var _idleMsgs=${msgArray};
var _idleQueue=[];
function idleBubble(){
  if(_idleMsgs.length===0)return;
  if(_idleQueue.length===0){
    _idleQueue=_idleMsgs.slice();
    for(var i=_idleQueue.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=_idleQueue[i];_idleQueue[i]=_idleQueue[j];_idleQueue[j]=t;}
  }
  showBubble(_idleQueue.pop());
}
function scheduleIdle(){
  var delay=5000+Math.random()*5000;
  setTimeout(function(){idleBubble();scheduleIdle();},delay);
}
scheduleIdle();`;
}

export function buildPigSkinHTML(skinId, level, viewSize, centered, customIdleMessages) {
  const skinCSS = SKIN_CSS[skinId] || "";
  const skinClass = SKIN_CLASS[skinId] || "";
  const extras = SKIN_EXTRAS_HTML[skinId] || "";
  const stageExtras = SKIN_STAGE_EXTRAS[skinId] || "";
  const reactionInfo = SKIN_REACTION[skinId] || SKIN_REACTION.default;
  const isFloaty = reactionInfo.floaty;
  const isDefault = skinId === "default";

  const scales = "[{x:.92,y:1.0},{x:1.06,y:1.06},{x:1.22,y:1.12},{x:1.4,y:1.19},{x:1.6,y:1.27}]";

  const idleMessages = customIdleMessages || IDLE_CHATTER[skinId] || IDLE_CHATTER.default;

  let pokeJS;
  if (isDefault) {
    // Default pig: random from generic reactions + idle chatter
    const bubbleJS = buildBubbleJS("Oink!", "#E0A093", idleMessages);
    pokeJS = `
${bubbleJS}
var reactions=${reactionInfo.reactions};
var lastR=-1;var busy=false;
function pokePig(){
  if(busy)return;busy=true;
  var idx=Math.floor(Math.random()*reactions.length);
  if(idx===lastR)idx=(idx+1)%reactions.length;lastR=idx;
  var cls=reactions[idx];
  wrap.classList.remove('poked','jiggle','squish','hop','wobble');void wrap.offsetWidth;
  wrap.classList.add(cls);pigA.classList.add('snout-pulse');
  showBubble();
  setTimeout(function(){wrap.classList.remove(cls);pigA.classList.remove('snout-pulse');busy=false},650);
}`;
  } else {
    // Themed pig: specific reaction + bubble + idle chatter
    const fxJS = SKIN_FX_JS[reactionInfo.fxKey] || "";
    const bubbleJS = buildBubbleJS(reactionInfo.say, reactionInfo.bc, idleMessages);
    pokeJS = `
${bubbleJS}
var busy=false;
function pokePig(){
  if(busy)return;busy=true;
  wrap.classList.remove('${reactionInfo.reaction}');void wrap.offsetWidth;
  wrap.classList.add('${reactionInfo.reaction}');
  pigA.classList.add('snout-pulse');
  showBubble();
  ${fxJS}
  setTimeout(function(){wrap.classList.remove('${reactionInfo.reaction}');pigA.classList.remove('snout-pulse');busy=false},1150);
}`;
  }

  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
<style>${BASE_CSS}${skinCSS}</style></head>
<body>
<div class="stage" style="${viewSize ? `transform:scale(${viewSize / 224});transform-origin:50% 50%` : ''}${centered ? ';align-items:center;padding:0' : ''}">
  <div class="shadow ${isFloaty ? 'ghostShadow' : ''}"></div>
  <div class="wrap ${isFloaty ? 'floaty' : ''}" id="wrap">
    <div class="pigA ${skinClass}" id="pigA">
      <div class="ear l"></div><div class="ear r"></div>
      <div class="head"></div>
      <div class="eye l"></div><div class="eye r"></div>
      <div class="cheekB l"></div><div class="cheekB r"></div>
      <div class="snout"><div class="nostril l"></div><div class="nostril r"></div></div>
      ${extras}
    </div>
  </div>
  ${stageExtras}
</div>
<script>
var wrap=document.getElementById('wrap');var pigA=document.getElementById('pigA');
var scales=${scales};var lvl=Math.min(${level || 1},5);
var s=scales[lvl-1];wrap.style.scale=s.x+' '+s.y;
var shadow=document.querySelector('.shadow');if(shadow)shadow.style.width=140*s.x+'px';
setInterval(function(){wrap.classList.add('blinking');setTimeout(function(){wrap.classList.remove('blinking')},200)},2400+Math.random()*2000);
${pokeJS}
window.pokePig=pokePig;
</script>
</body></html>`;
}
