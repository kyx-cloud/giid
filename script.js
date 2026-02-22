
// ----------------------------------
// 全域狀態
// ----------------------------------
let introPhase = "loop";
let overlayStep = 0;
let arStarted = false;

const $ = s => document.querySelector(s);

// 黑幕
const blackout = document.getElementById("tv-blackout");

function blackoutOn()  { blackout.classList.add("active"); }
function blackoutOff() { blackout.classList.remove("active"); }


// ----------------------------------
// 9:16 Scale
// ----------------------------------
function calculateScale() {
  const scale = Math.min(window.innerWidth / 1080, window.innerHeight / 1920);
  document.documentElement.style.setProperty("--scale-factor", scale);
}
calculateScale();
window.addEventListener("resize", calculateScale);


// ----------------------------------
// DOM
// ----------------------------------
const introContainer = $("#intro-container");
const introVideo     = $("#intro-video");

const typeScreen     = $("#typewriter-screen");
const typeTextEl     = $("#typewriter-text");

const type2Screen    = $("#typewriter2-screen");
const type2TextEl    = $("#typewriter2-text");

const arScene        = $("#ar-scene");
const cameraOverlay  = $("#camera-overlay");
const cameraFade     = $("#camera-fade");

const scanOverlay    = $("#scan-overlay");
const scanCountdown  = $("#scan-countdown");

const ratingOverlay   = $("#rating-overlay");
const lowScoreOverlay = $("#low-score-overlay");
const photoOffOverlay = $("#photo-off-overlay");

const btnLowOff  = $("#btn-off");
const btnLowNext = $("#btn-next");
const btnEndOff  = $("#btn-end-off");


// ----------------------------------
// Hands video
// ----------------------------------
let handsVideo = document.getElementById("mk-video");
if (!handsVideo) {
  handsVideo = document.createElement("video");
  handsVideo.id = "mk-video";
  handsVideo.playsInline = true;
  handsVideo.muted = true;
  handsVideo.style.display = "none";
  document.body.appendChild(handsVideo);
}


// ----------------------------------
// 隱藏全部 overlay
// ----------------------------------
function hideAll() {
  [
    cameraOverlay, scanOverlay,
    ratingOverlay, lowScoreOverlay,
    photoOffOverlay, typeScreen, type2Screen
  ].forEach(el => el && (el.style.display = "none"));
}



// ===============================
// TV（開機 / 關機）
// ===============================
function playTVOpen(el) {

  blackoutOff(); // 進畫面前 → 確保黑幕退掉

  el.style.display = "flex";
  el.classList.remove("tv-off");
  void el.offsetWidth;
  el.classList.add("tv-on");
}

function playTVOff(el, cb) {

  blackoutOn(); // 關機瞬間 → 黑幕蓋上

  el.classList.remove("tv-on");
  el.classList.add("tv-off");

  setTimeout(() => {

    el.style.display = "none";
    el.classList.remove("tv-off");

    cb && cb();

  }, 450);
}



// ===============================
// 第一段 打字機
// ===============================
function showLoadingText(text){

    const el = document.getElementById("loading-text");
    if(el) el.textContent = text;
  const box = document.getElementById("loading-box");
  if(box) box.style.display = "block";
}

function startFakeLoading(targetPercent){
  const bar  = document.getElementById("progress-bar");
  const text = document.getElementById("progress-text");

  let p = 0;
  const t = setInterval(()=>{
    p++;
    bar.style.width = p + "%";
    text.textContent = p + "%";

    if(p >= targetPercent){
      clearInterval(t);
    }
  }, 120);
}

const TYPEWRITER_TEXT = `
> ……
歡迎來到「模範生」系統

正在同步群體審美數據...計算你的外貌相似度

你的臉部特徵將被送入模型進行比對

請正視鏡頭 並保持中立表情
任何微小變化都將被記錄

———

即將進入評分程序
請準備好被觀看
`;

let typingIndex = 0;
let typingTimer = null;

function startTypewriterEffect() {

  typeTextEl.textContent = "";
  typingIndex = 0;
  clearInterval(typingTimer);

  typingTimer = setInterval(() => {

    if(typingIndex >= TYPEWRITER_TEXT.length){
      clearInterval(typingTimer);
    
     
   // ✅ 打字機結束 → 第一次進度條（10%）
showLoadingText("系統正在載入模型標準");
startFakeLoading(10);

    
      return;
    }
    

    typeTextEl.textContent =
      TYPEWRITER_TEXT.slice(0, typingIndex++);

  }, 50);
}

function showTypewriterScreen() {

  playTVOpen(typeScreen);
  startTypewriterEffect();
  setTimeout(() => {

    playTVOff(typeScreen, () => enterAR());

  }, 13000);
}



// ===============================
// INTRO 影片流程
// ===============================


function playFullIntroOnce() {

  introPhase = "full";
  introVideo.loop = false;
  introVideo.muted = true;  
  introVideo.currentTime = 0;
  introVideo.play().catch(()=>{});

  introVideo.onended = () => {
    introVideo.onended = null;
    showTypewriterScreen();
  };
}






// ===============================
// 進入 AR（攝影畫面）
// ===============================
function enterAR() {

  if (arStarted) return;
  arStarted = true;

  introVideo?.pause();
  introContainer && (introContainer.style.display = "none");

  arScene.style.display = "block";
  cameraOverlay.style.display = "flex";

  blackoutOff(); // 鏡頭出現前一定先退黑幕

  if (cameraFade) {
    cameraFade.style.display = "block";
    cameraFade.classList.remove("show");
    requestAnimationFrame(() => cameraFade.classList.add("show"));
  }

  setTimeout(startScanSequence, 2000);
}



// ===============================
// 掃描倒數
// ===============================
function startScanSequence() {
  const scanMusic = document.getElementById("scan-music");
  if (scanMusic) {
    scanMusic.currentTime = 0;
    scanMusic.volume = 0.05;   // 可自行調整
    scanMusic.play().catch(()=>{});
  }
  
  overlayStep = 1;
  scanOverlay.style.display = "flex";
  let count = 10;
  scanCountdown.textContent = count;
  scanCountdown.style.display = "block";
  const t = setInterval(() => {

    count--;

    if (count > 0) {
      scanCountdown.textContent = count;
      return;
    }

    clearInterval(t);
    const scanMusic = document.getElementById("scan-music");
if (scanMusic) {
  scanMusic.pause();
  scanMusic.currentTime = 0;
}

    scanCountdown.style.display = "none";
    showPreRatingTypewriter();

  }, 1500);
}



// ===============================
// 第二段 打字機
// ===============================
const TYPEWRITER2_TEXT = `
> 臉部資料擷取完成

系統正在生成你的個人評分表
請保持靜止

———

演算法運行中
請勿關閉視窗
`;

let type2Index = 0;
let type2Timer = null;

function startTypewriter2() {

  type2TextEl.textContent = "";
  type2Index = 0;
  clearInterval(type2Timer);

  type2Timer = setInterval(() => {

    if (type2Index >= TYPEWRITER2_TEXT.length) {
      clearInterval(type2Timer);
      return;
    }

    type2TextEl.textContent =
      TYPEWRITER2_TEXT.slice(0, type2Index++);

  }, 45);
}


function showPreRatingTypewriter() {

  scanOverlay.style.display = "none";

  playTVOpen(type2Screen);
startTypewriter2();

/* ⭐ 第二次 loading 設定 */
const box2  = document.getElementById("loading2-box");
const bar2  = document.getElementById("progress2-bar");
const text2 = document.getElementById("progress2-text");

if (box2 && bar2 && text2) {
  box2.style.display = "block";
  bar2.style.width = "0%";
  text2.textContent = "0%";

  let p = 0;
  const t = setInterval(() => {
    p++;
    bar2.style.width = p + "%";
    text2.textContent = p + "%";
    if (p >= 30) clearInterval(t);
  }, 120);
}

  setTimeout(() => {

    playTVOff(type2Screen, () => {

      // 轉場時短暫遮罩
      blackoutOn();

      setTimeout(() => {

        // 顯示 05
        ratingOverlay.style.display = "flex";

        // 重置動畫
        ratingOverlay.classList.remove("fax-print");
        void ratingOverlay.offsetWidth;

        // 套用：上到下洗出 ＋ 微卡頓
        ratingOverlay.classList.add("fax-print");

        // 播放影印聲音
        const faxSound = document.getElementById("fax-sound");
        if (faxSound) {
          faxSound.currentTime = 0;
          faxSound.volume = 0.85;
          faxSound.play().catch(()=>{});
        }

        // 顯影開始 → 退黑幕
        setTimeout(() => blackoutOff(), 200);

        overlayStep = 2;

        // 05 → 06 popup
        // 05 → 顯示一段時間後 → 跳到 Step3.html
// ⭐ 評分表顯示一段時間 → 前往 step3.html
setTimeout(() => {
  window.location.href = "step3.html";
}, 14000);


      }, 280);
    });

  }, 20000);
}



// ===============================
// 06 POPUP：按讚 / OFF
// ===============================
function goLowScoreNext() {

  stopHandsCamera();

  lowScoreOverlay.style.display = "none";
  ratingOverlay.style.display   = "none";

  window.location.href = "makeup.html";
}

function goLowScoreOff() {

  stopHandsCamera();

  lowScoreOverlay.style.display = "none";
  photoOffOverlay.style.display = "flex";

  overlayStep = 5;
}

btnLowNext && (btnLowNext.onclick = goLowScoreNext);
btnLowOff  && (btnLowOff.onclick  = goLowScoreOff);
btnEndOff  && (btnEndOff.onclick  = () => location.reload());



// ===============================
// MediaPipe Hands
// ===============================
const hands = new Hands({
  locateFile: f => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${f}`,
});

hands.setOptions({
  maxNumHands: 1,
  modelComplexity: 0,
  minDetectionConfidence: 0.7,
  minTrackingConfidence: 0.5,
});

let thumbUpFrames   = 0;
let thumbDownFrames = 0;
let lastThumbAction = 0;

const HOLD_NEED   = 2;
const COOLDOWN_MS = 1200;

function isThumbUp(lm){ return lm[4].y < lm[5].y - 0.02; }
function isThumbDown(lm){ return lm[4].y > lm[5].y + 0.02; }

function handleHandsResults(results) {

  if (overlayStep !== 3) return;

  if (!results.multiHandLandmarks?.length) {
    thumbUpFrames = thumbDownFrames = 0;
    return;
  }

  const lm  = results.multiHandLandmarks[0];
  const now = performance.now();

  const up   = isThumbUp(lm);
  const down = isThumbDown(lm);

  if (up)  { thumbUpFrames++;  thumbDownFrames = 0; }
  else if (down){ thumbDownFrames++; thumbUpFrames = 0; }
  else     { thumbUpFrames = thumbDownFrames = 0; }

  if (now - lastThumbAction < COOLDOWN_MS) return;

  if (thumbUpFrames >= HOLD_NEED) {
    lastThumbAction = now;
    goLowScoreNext();
    return;
  }

  if (thumbDownFrames >= HOLD_NEED) {
    lastThumbAction = now;
    goLowScoreOff();
  }
}

hands.onResults(handleHandsResults);



// ===============================
// Hands Camera
// ===============================
let handsCamera = null;
let handsCameraStarted = false;

function startHandsCamera() {

  if (handsCameraStarted) return;
  handsCameraStarted = true;

  navigator.mediaDevices.getUserMedia({ video:true })
  .then(stream => {

    handsVideo.srcObject = stream;

    handsCamera = new Camera(handsVideo, {
      onFrame: async () => {
        if (!handsVideo.videoWidth) return;
        await hands.send({ image: handsVideo });
      },
      width:1080,
      height:1920
    });

    handsCamera.start();
  });
}

function stopHandsCamera() {

  if (!handsCameraStarted) return;
  handsCameraStarted = false;

  try { handsCamera?.stop(); } catch{}

  if (handsVideo?.srcObject) {
    handsVideo.srcObject.getTracks().forEach(t=>t.stop());
    handsVideo.srcObject = null;
  }
}



// ===============================
// INIT
// ===============================
window.addEventListener("DOMContentLoaded", () => {

  hideAll();

  cameraFade?.classList.remove("show");
  cameraFade && (cameraFade.style.display = "none");

  arScene.style.display = "none";
  introContainer.style.display = "block";

  blackoutOff();   // 預設不覆蓋畫面

  playFullIntroOnce();


  console.log("✅ script ready（傳真洗出 + 黑幕穩定版）");
});