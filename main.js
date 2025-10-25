import { els, person, state, setStatus } from "./state.js";
import { renderOverlays, refreshDataVisibility, updateOverlayTheme } from "./overlays.js";
import { PRESETS, setBgFromUrl, setBgFromFile, generateBg } from "./ai_bg.js";
import { startCamera, stopCamera } from "./segmentation_bg.js";

function bindControls() {
  els.btnStart.addEventListener("click", startCamera);
  els.btnStop.addEventListener("click", stopCamera);

  els.btnToggleBg.addEventListener("click", () => toggleBg());
  document.addEventListener("keydown", e => {
    const tag = (e.target && e.target.tagName || "").toLowerCase();
    if (["input", "textarea", "select"].includes(tag)) return;
    const isB = (e.code === "KeyB") || (e.key && e.key.toLowerCase() === "b");
    if (isB) { e.preventDefault(); toggleBg() }
    if (e.key === "Escape" && !els.dataModal.hidden) closeModal();
  });

  els.privacy.addEventListener("change", e => requestAnimationFrame(() => renderOverlays(person, e.target.value)));

  els.btnToggleData.addEventListener("click", () => { state.dataVisible = !state.dataVisible; refreshDataVisibility() });

  els.bgPreset.addEventListener("change", e => { const k = e.target.value; if (k && PRESETS[k]) setBgFromUrl(PRESETS[k]) });
  els.bgFile.addEventListener("change", e => { const f = e.target.files?.[0]; if (!f) return; setBgFromFile(URL.createObjectURL(f)); els.bgPreset.value = "" });

  els.btnGenBg.addEventListener("click", () => generateBg(person));

  document.addEventListener("bg-toggle-ui", () => refreshBgToggleUI());
  document.addEventListener("bg-updated", () => requestAnimationFrame(updateOverlayTheme));

  document.getElementById("btnOpenModal").addEventListener("click", openModal);
  els.btnCloseModal.addEventListener("click", closeModal);
  els.btnCloseModal2.addEventListener("click", closeModal);
  els.dataModal.addEventListener("click", e => { if (e.target === els.dataModal) closeModal() });

  const inputs = ["in_fullName","in_position","in_company","in_department","in_office","in_email","in_telegram","in_logo"].map(id=>document.getElementById(id));
  inputs.forEach(i => i.addEventListener("input", applyForm));
}

function refreshBgToggleUI() {
  els.btnToggleBg.textContent = state.bgEnabled ? "Фон: вкл" : "Фон: выкл";
  els.btnToggleBg.setAttribute("aria-pressed", String(state.bgEnabled));
  setStatus(state.bgEnabled ? "Фон включён" : "Фон выключен");
  requestAnimationFrame(updateOverlayTheme);
}

function toggleBg() {
  state.bgEnabled = !state.bgEnabled;
  refreshBgToggleUI();
}

function openModal() {
  syncForm();
  els.dataModal.hidden = false;
  setTimeout(() => els.in_fullName.focus(), 0);
}

function closeModal() {
  els.dataModal.hidden = true;
}

function syncForm() {
  const e = person.employee;
  els.in_fullName.value = e.full_name || "";
  els.in_position.value = e.position || "";
  els.in_company.value = e.company || "";
  els.in_department.value = e.department || "";
  els.in_office.value = e.office_location || "";
  els.in_email.value = e?.contact?.email || "";
  els.in_telegram.value = e?.contact?.telegram || "";
  els.in_logo.value = e?.branding?.logo_url || "";
}

function applyForm() {
  const e = person.employee;
  e.full_name = els.in_fullName.value;
  e.position = els.in_position.value;
  e.company = els.in_company.value;
  e.department = els.in_department.value;
  e.office_location = els.in_office.value;
  e.contact = { email: els.in_email.value, telegram: els.in_telegram.value };
  e.branding = { logo_url: els.in_logo.value };
  renderOverlays(person, els.privacy.value);
}

function init() {
  renderOverlays(person, els.privacy.value);
  refreshBgToggleUI();
  refreshDataVisibility();
  requestAnimationFrame(updateOverlayTheme);
}

bindControls();
init();
