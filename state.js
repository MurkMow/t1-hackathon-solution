export const W = 640, H = 480;
export const els = {
  btnStart: document.getElementById("btnStart"),
  btnStop: document.getElementById("btnStop"),
  btnToggleBg: document.getElementById("btnToggleBg"),
  btnOpenModal: document.getElementById("btnOpenModal"),
  fps: document.getElementById("fps"),
  status: document.getElementById("status"),
  privacy: document.getElementById("privacySelect"),
  btnToggleData: document.getElementById("btnToggleData"),
  bgFile: document.getElementById("bgFile"),
  bgPreset: document.getElementById("bgPreset"),
  aiPrompt: document.getElementById("aiPrompt"),
  aiStyle: document.getElementById("aiStyle"),
  btnGenBg: document.getElementById("btnGenBg"),
  lightBoost: document.getElementById("lightBoost"),
  canvas: document.getElementById("canvasResult"),
  overlayTop: document.getElementById("overlayTop"),
  brandLogo: document.getElementById("brandLogo"),
  brandName: document.getElementById("brandName"),
  qrRight: document.getElementById("qrRight"),
  qrTarget: document.getElementById("qrTarget"),
  qrText: document.getElementById("qrText"),
  overlayBottom: document.getElementById("overlayBottom"),
  lnCompany: document.getElementById("lnCompany"),
  lnDept: document.getElementById("lnDept"),
  lnOffice: document.getElementById("lnOffice"),
  lnEmail: document.getElementById("lnEmail"),
  lnTg: document.getElementById("lnTg"),
  vFullName: document.getElementById("valFullName"),
  vPosition: document.getElementById("valPosition"),
  vCompany: document.getElementById("valCompany"),
  vDept: document.getElementById("valDept"),
  vOffice: document.getElementById("valOffice"),
  vEmail: document.getElementById("valEmail"),
  vTg: document.getElementById("valTg"),
  dataModal: document.getElementById("dataModal"),
  btnCloseModal: document.getElementById("btnCloseModal"),
  btnCloseModal2: document.getElementById("btnCloseModal2"),
  in_fullName: document.getElementById("in_fullName"),
  in_position: document.getElementById("in_position"),
  in_company: document.getElementById("in_company"),
  in_department: document.getElementById("in_department"),
  in_office: document.getElementById("in_office"),
  in_email: document.getElementById("in_email"),
  in_telegram: document.getElementById("in_telegram"),
  in_logo: document.getElementById("in_logo")
};
export const ctx = els.canvas.getContext("2d", { willReadFrequently: true });
export const person = { employee: { full_name: "Недиков Егор Александрович", position: "Junior Java Developer", company: "ООО «Т1 ИННОТЕХ»", department: "Департамент", office_location: "Воронеж", contact: { email: "sergey.ivanov@t1dp.ru", telegram: "@Bambl54" }, branding: { logo_url: "https://analystdays.ru/files/autoupload/18/23/88/nyqt3yc167510.png" } } };
export const state = {
  bgCurrent: null,
  bgNext: null,
  bgReady: false,
  bgEnabled: true,
  dataVisible: true,
  roomLuma: 0.5
};
export const setStatus = t => els.status.textContent = t;
export const toStr = v => v == null ? "" : String(v);
export const tgUrl = h => { if (!h) return null; const u = h.trim().replace(/^@/, ""); return u ? "https://t.me/" + encodeURIComponent(u) : null };
