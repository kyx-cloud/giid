/* ===============================
   9:16 螢幕比例（與前頁一致）
=============================== */
function resize(){
  const s = Math.min(
    window.innerWidth / 1080,
    window.innerHeight / 1920
  );
  document.documentElement.style.setProperty("--scale-factor", s);
}
resize();
window.addEventListener("resize", resize);

/* ===============================
   DOM
=============================== */
const video  = document.getElementById("video");
const canvas = document.getElementById("canvas");
const ctx    = canvas.getContext("2d");

/* ===============================
   設定
=============================== */
const AUTO_SHOT_MS = 5000;

/* ===============================
   載入貼臉文字圖片
=============================== */
const textImg = new Image();
textImg.src = "image/text1.png";

/* ===============================
   開鏡頭
=============================== */
navigator.mediaDevices.getUserMedia({ video: { facingMode:"user" } })
.then(stream => {
  video.srcObject = stream;

  // 等 video 有實際尺寸
  const wait = setInterval(() => {
    if (video.videoWidth > 0) {
      clearInterval(wait);
      startFaceMesh();
      startAutoShot();
    }
  }, 100);
})
.catch(err => console.error("Camera error:", err));

/* ===============================
   FaceMesh 初始化
=============================== */
let faceMesh = null;
let cam      = null;

function startFaceMesh(){
  faceMesh = new FaceMesh({
    locateFile: f =>
      `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${f}`
  });

  faceMesh.setOptions({
    maxNumFaces: 1,
    refineLandmarks: true,
    minDetectionConfidence: 0.6,
    minTrackingConfidence: 0.6
  });

  cam = new Camera(video, {
    onFrame: async () => {
      if (!video.videoWidth) return;
      await faceMesh.send({ image: video });
    },
    width: 1080,
    height: 1920
  });

  cam.start();
  faceMesh.onResults(drawFace);
}

/* ===============================
   FaceMesh → 畫文字濾鏡
=============================== */
function drawFace(results){
  const w = video.videoWidth;
  const h = video.videoHeight;
  if (!w || !h) return;

  canvas.width  = w;
  canvas.height = h;

  ctx.clearRect(0,0,w,h);

  if (!results.multiFaceLandmarks || !results.multiFaceLandmarks.length) return;
  const lm = results.multiFaceLandmarks[0];

  // 臉左右邊界（鏡像）
  const L = (1 - lm[234].x) * w;
  const R = (1 - lm[454].x) * w;

  // 額頭位置
  const T = lm[10].y * h;

  const faceW = Math.abs(R - L);

  // 文字大小（跟你原本一樣）
  const imgW = faceW * 5;
  const imgH = faceW * 3;

  const cx = (L + R) / 2;
  const x  = cx - imgW / 1.9;
  const y  = T  - imgH * 0.25;

  ctx.drawImage(textImg, x, y, imgW, imgH);
}

/* ===============================
   自動拍照
=============================== */
function startAutoShot(){
  console.log("⏱ 5 秒後自動拍照");

  setTimeout(() => {
    takePhotoAndGo();
  }, AUTO_SHOT_MS);
}

/* ===============================
   拍照 + 跳轉
=============================== */
/* ===============================
   拍照 + 跳轉
=============================== */
function takePhotoAndGo(){
  const w = video.videoWidth;
  const h = video.videoHeight;
  if (!w || !h) return;

  const snap = document.createElement("canvas");
  snap.width  = w;
  snap.height = h;
  const sctx  = snap.getContext("2d");

  // ① 畫鏡像攝影機 (跟原本一樣)
  sctx.save();
  sctx.translate(w, 0);
  sctx.scale(-1, 1);
  sctx.drawImage(video, 0, 0, w, h);
  sctx.restore();

  // ② 疊上目前 canvas 的文字濾鏡 (跟原本一樣)
  sctx.drawImage(canvas, 0, 0, w, h);

  // ③ 存成圖片
  const photo = snap.toDataURL("image/png");
  
  // ✅ 保留你原本跳轉 post.html 用的 key
  localStorage.setItem("capturedImage", photo);
  
  // ✅ 新增：存給列印選擇頁面用的 key
  localStorage.setItem("text_shot", photo);

  console.log("📸 已拍照，儲存至 text_shot 並跳轉 post.html");

  // ④ 跳轉 (跟原本一樣)
  window.location.href = "post.html";
}