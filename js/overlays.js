import { els, ctx, state, toStr, tgUrl } from "./state.js";

function areaLuma(el) {
  const cvs = els.canvas;
  const cr = cvs.getBoundingClientRect();
  const r = el.getBoundingClientRect();
  const sx = Math.max(0, Math.round((r.left - cr.left) * cvs.width / cr.width));
  const sy = Math.max(0, Math.round((r.top - cr.top) * cvs.height / cr.height));
  const sw = Math.min(cvs.width - sx, Math.round(r.width * cvs.width / cr.width));
  const sh = Math.min(cvs.height - sy, Math.round(r.height * cvs.height / cr.height));
  if (sw <= 0 || sh <= 0) return null;
  const data = ctx.getImageData(sx, sy, sw, sh).data;
  let s = 0, n = 0;
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i] / 255, g = data[i + 1] / 255, b = data[i + 2] / 255;
    s += 0.2126 * r + 0.7152 * g + 0.0722 * b; n++;
  }
  return n ? s / n : null;
}

function themeFor(el, onlyText = false) {
  const l = areaLuma(el); if (l == null) return;
  const dark = l < 0.42;
  const setColor = c => { el.style.color = c; el.querySelectorAll(".info-label,.brand-name,.qr-label").forEach(x => x.style.color = c) };
  if (dark) { setColor("#e8eefc"); if (!onlyText) { el.style.background = "rgba(20,24,34,.55)"; el.style.borderColor = "rgba(255,255,255,.18)" } }
  else { setColor("#0b0d10"); if (!onlyText) { el.style.background = "rgba(250,252,255,.58)"; el.style.borderColor = "rgba(0,0,0,.22)" } }
}

export function updateOverlayTheme() {
  if (!els.overlayBottom.hidden) themeFor(els.overlayBottom, false);
  if (!els.overlayTop.hidden) themeFor(els.overlayTop, true);
}

export function renderOverlays(data, forcedLevel = null) {
  const e = data.employee || {};
  const level = (forcedLevel || els.privacy.value || "medium").toLowerCase();

  els.brandLogo.src = toStr(e?.branding?.logo_url);
  els.brandLogo.alt = e?.company || "Логотип";
  els.brandName.textContent = e?.company || "Компания";

  els.qrTarget.innerHTML = "";
  const url = tgUrl(e?.contact?.telegram);
  if (level === "high" && url && window.QRCode && state.dataVisible) {
    new QRCode(els.qrTarget, { text: url, width: 84, height: 84, correctLevel: QRCode.CorrectLevel.M });
    els.qrRight.hidden = false; els.qrText.style.display = "block";
  } else { els.qrRight.hidden = true; els.qrText.style.display = "none" }

  els.overlayTop.hidden = !state.dataVisible;

  els.vFullName.textContent = e.full_name || "—";
  els.vPosition.textContent = e.position || "—";
  els.vCompany.textContent = e.company || "—";
  els.vDept.textContent = e.department || "—";
  els.vOffice.textContent = e.office_location || "—";
  els.vEmail.textContent = e?.contact?.email || "—";
  els.vTg.textContent = e?.contact?.telegram || "—";

  const showMed = (level === "medium" || level === "high");
  els.lnCompany.style.display = showMed ? "" : "none";
  els.lnDept.style.display = showMed ? "" : "none";
  els.lnOffice.style.display = showMed ? "" : "none";
  const showHigh = (level === "high");
  els.lnEmail.style.display = showHigh ? "" : "none";
  els.lnTg.style.display = showHigh ? "" : "none";

  els.overlayBottom.hidden = !state.dataVisible;
  requestAnimationFrame(updateOverlayTheme);
}

export function refreshDataVisibility() {
  els.overlayBottom.hidden = !state.dataVisible;
  els.overlayTop.hidden = !state.dataVisible;
  els.btnToggleData.textContent = state.dataVisible ? "Скрыть" : "Показать";
  requestAnimationFrame(updateOverlayTheme);
}
