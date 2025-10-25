import { els, state, setStatus } from "./state.js";

function pollinationsUrl(prompt) {
  const p = new URLSearchParams({ width: "1024", height: "768", nologo: "true", t: String(Date.now()) });
  return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?${p.toString()}`;
}

function loadImage(url, { revoke = false } = {}) {
  return new Promise((ok, fail) => {
    const i = new Image(); i.crossOrigin = "anonymous";
    i.onload = () => { if (revoke) URL.revokeObjectURL(url); ok(i) };
    i.onerror = () => { if (revoke) URL.revokeObjectURL(url); fail(new Error("load error")) };
    i.src = url;
  });
}

function swapIn(img) {
  state.bgNext = img;
  if (state.bgNext) { state.bgCurrent = state.bgNext; state.bgNext = null; state.bgReady = true }
  requestAnimationFrame(() => document.dispatchEvent(new CustomEvent("bg-updated")));
}

async function translateIfRu(text) {
  if (!/[А-Яа-яЁё]/.test(text)) return text;
  try {
    const url = "https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=en&dt=t&q=" + encodeURIComponent(text);
    const r = await fetch(url); const j = await r.json();
    return Array.isArray(j?.[0]) ? j[0].map(s => s[0]).join("") : text;
  } catch { return text }
}

export async function buildPrompt(person) {
  const e = person.employee;
  const base = (els.aiPrompt.value || "").trim() || "чистый ненавязчивый офисный фон, мягкое боке, минимум отвлечений";
  const baseEn = await translateIfRu(base);
  const style = (els.aiStyle.value || "").trim();
  const company = e.company ? `, color palette inspired by ${e.company}` : "";
  const dept = e.department ? `, ${e.department} theme subtle` : "";
  return baseEn + (style ? `, ${style}` : "") + company + dept + ", high detail, realistic lighting";
}

export async function setBgFromUrl(url) {
  if (!url) return;
  try { const img = await loadImage(url); swapIn(img); setStatus("Фон загружен") } catch { setStatus("Ошибка загрузки фона") }
}

export async function setBgFromFile(objectUrl) {
  try { const img = await loadImage(objectUrl, { revoke: true }); swapIn(img); setStatus("Фон загружен") } catch { setStatus("Ошибка фона") }
}

export async function generateBg(person) {
  try {
    els.btnGenBg.disabled = true;
    setStatus("Генерирую фон…");
    const prompt = await buildPrompt(person);
    await setBgFromUrl(pollinationsUrl(prompt));
    els.bgPreset.value = "";
    setStatus("Фон сгенерирован");
    if (!state.bgEnabled) {
      state.bgEnabled = true;
      document.dispatchEvent(new CustomEvent("bg-toggle-ui"));
    }
  } catch { setStatus("Ошибка генерации фона") }
  finally { els.btnGenBg.disabled = false }
}

export const PRESETS = {
  business: "https://tse1.mm.bing.net/th/id/OIP.d8_0fc_MSyQDGiq7yaXPOgHaE-?w=1920&h=1291&rs=1&pid=ImgDetMain&o=7&rm=3",
  solid: "https://tse2.mm.bing.net/th/id/OIP.vJyw5_fJs_VGLS_hxWuHVQHaE7?rs=1&pid=ImgDetMain&o=7&rm=3",
  chill: "https://tse3.mm.bing.net/th/id/OIP.Tus1uEXYurJ1NaVvhmdmRgHaE6?rs=1&pid=ImgDetMain&o=7&rm=3",
  space: "https://tse2.mm.bing.net/th/id/OIP.AHJqxGF4fe-unVYOtw8msAHaEK?rs=1&pid=ImgDetMain&o=7&rm=3"
};
