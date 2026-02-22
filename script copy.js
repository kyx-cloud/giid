
      /* ===============================
         9:16 螢幕比例（跟你前頁一致）
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
         攝影機
      =============================== */
      const video = document.getElementById("video");
      navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => video.srcObject = stream)
        .catch(err => console.error("Camera error:", err));
      
      /* ===============================
         Canvas
      =============================== */
      const canvas = document.getElementById("canvas");
      const ctx = canvas.getContext("2d");
      
      /* ===============================
         載入文字圖片（貼臉用）
      =============================== */
      const textImg = new Image();
      textImg.src = "image/text1.png";
      
      /* ===============================
         FaceMesh 設定
      =============================== */
      const faceMesh = new FaceMesh({
        locateFile: f =>
          `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${f}`
      });
      
      faceMesh.setOptions({
        maxNumFaces: 1,
        refineLandmarks: true,
        minDetectionConfidence: 0.6,
        minTrackingConfidence: 0.6
      });
      
      /* ===============================
         Camera pipeline（只餵 FaceMesh）
      =============================== */
      const cam = new Camera(video, {
        onFrame: async () => {
          if (!video.videoWidth) return;
          await faceMesh.send({ image: video });
        },
        width: 1080,
        height: 1920
      });
      cam.start();
      
      /* ===============================
         FaceMesh 結果 → 畫圖
      =============================== */
      faceMesh.onResults(results => {
      
        const w = video.videoWidth;
        const h = video.videoHeight;
        if (!w || !h) return;
      
        canvas.width  = w;
        canvas.height = h;
       
        /* 🔹 畫鏡像攝影機 */
        ctx.save();
        ctx.translate(w, 0);
        ctx.scale(-1, 1);
        ctx.clearRect(0,0,w,h);
        ctx.restore();
      
        if (!results.multiFaceLandmarks?.length) return;
        const lm = results.multiFaceLandmarks[0];
      
        /* ===============================
           🔥 核心：文字圖片貼臉
           使用額頭 + 臉寬
        =============================== */
      
        // 臉左右邊界
        const L = (1 - lm[234].x) * w;
        const R = (1 - lm[454].x) * w;    
      
        // 額頭位置
        const T = lm[10].y * h;
      
        // 臉中心
        const cx = (L + R) / 2;
      
      
        // 用臉寬
        const faceW = Math.abs(R - L);

       // 🔥 寬度：跟臉走（夠寬）
       const imgW = faceW * 5;

       // 🔥 高度：不要用圖片比例，自己定（關鍵）
       const imgH = faceW * 3;   // ← 這行是重點

      
        // 額頭上方
        const x = cx - imgW / 1.9;
        const y = T - imgH * 0.25;
      
        // 畫上去
        ctx.drawImage(textImg, x, y, imgW, imgH);
      });