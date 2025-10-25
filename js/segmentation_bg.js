import { W, H, els, ctx, state, setStatus } from "./state.js";
import { updateOverlayTheme } from "./overlays.js";

const cut = document.createElement("canvas"); cut.width = W; cut.height = H;
const cutCtx = cut.getContext("2d");
const videoEl = document.createElement("video"); videoEl.playsInline = true; videoEl.muted = true;

const ds = document.createElement("canvas"); ds.width = 64; ds.height = 48;
const dctx = ds.getContext("2d", { willReadFrequently: true });
let frameIx = 0;

let cam = null, running = false, frameTimes = [], renderTimes = [], lastUi = 0;
const RENDER_SAMPLES = 60, FPS_UI_MS = 250, DARK_THR = 0.35;

function roomLight(image) {
  if ((frameIx++ % 3) !== 0) return;
  dctx.drawImage(image, 0, 0, ds.width, ds.height);
  const data = dctx.getImageData(0, 0, ds.width, ds.height).data;
  let s = 0, n = 0;
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i] / 255, g = data[i + 1] / 255, b = data[i + 2] / 255;
    s += 0.2126 * r + 0.7152 * g + 0.0722 * b; n++;
  }
  if (n) state.roomLuma = s / n;
}

function drawFPS(t0, t1) {
  renderTimes.push(t1 - t0); if (renderTimes.length > RENDER_SAMPLES) renderTimes.shift();
  const avg = renderTimes.reduce((a, b) => a + b, 0) / renderTimes.length;
  frameTimes.push(t1);
  const ago = t1 - 1000;
  while (frameTimes.length && frameTimes[0] < ago) frameTimes.shift();
  if (t1 - lastUi >= FPS_UI_MS) { els.fps.textContent = `FPS: ${Math.round(frameTimes.length)} · ${avg.toFixed(1)} ms`; lastUi = t1 }
}

function onResults(res) {
  const t0 = performance.now();
  roomLight(res.image);

  if (!state.bgEnabled) {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, W, H);
    ctx.globalCompositeOperation = "source-over";
    ctx.drawImage(res.image, 0, 0, W, H);
  } else {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, W, H);
    if (state.bgReady && state.bgCurrent) ctx.drawImage(state.bgCurrent, 0, 0, W, H);
    else { ctx.fillStyle = "#000"; ctx.fillRect(0, 0, W, H) }

    cutCtx.clearRect(0, 0, W, H);
    cutCtx.globalCompositeOperation = "source-over";
    cutCtx.drawImage(res.image, 0, 0, W, H);
    cutCtx.globalCompositeOperation = "destination-in";
    cutCtx.filter = "blur(2px)";
    cutCtx.drawImage(res.segmentationMask, 0, 0, W, H);
    cutCtx.filter = "none";
    cutCtx.globalCompositeOperation = "source-over";

    if (state.roomLuma < DARK_THR) {
      const boost = parseFloat(els.lightBoost.value) || 1.0;
      ctx.filter = `brightness(${boost.toFixed(2)}) contrast(1.05) saturate(1.06)`;
    } else ctx.filter = "none";

    ctx.drawImage(cut, 0, 0, W, H);
    ctx.filter = "none";
  }

  updateOverlayTheme();
  const t1 = performance.now();
  drawFPS(t0, t1);
}

const selfie = new SelfieSegmentation({ locateFile: f => `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/${f}` });
selfie.setOptions({ modelSelection: 1 });
selfie.onResults(onResults);

export async function startCamera() {
  if (running) return;
  try {
    cam = new Camera(videoEl, { onFrame: async () => { await selfie.send({ image: videoEl }) }, width: W, height: H });
    await cam.start();
    running = true; els.btnStart.disabled = true; els.btnStop.disabled = false;
    setStatus("Поток запущен");
    frameTimes.length = 0; renderTimes.length = 0; lastUi = 0;
  } catch { setStatus("Нет доступа к камере") }
}

export function stopCamera() {
  if (cam) cam.stop();
  running = false; els.btnStart.disabled = false; els.btnStop.disabled = true;
  els.fps.textContent = "FPS: —"; setStatus("Остановлено");
}
