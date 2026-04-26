const form = document.getElementById("rsvp-form");
const feedbackEl = document.getElementById("rsvp-feedback");
const downloadBtn = document.getElementById("download-csv");

/*
  ↳ Guardar en Google Sheets (Drive) usando Apps Script

  1) Crea una hoja de cálculo nueva en Google Drive.
  2) Ve a Extensiones → Apps Script.
  3) Pega este código y guarda:

    function doPost(e) {
      const ss = SpreadsheetApp.getActiveSpreadsheet();
      const sheet = ss.getActiveSheet();
      const data = JSON.parse(e.postData.contents);
      sheet.appendRow([
        new Date(data.timestamp),
        data.nombre,
        data.email,
        data.asistencia,
        data.transporte,
        data.acompanante,
        data.mensaje,
      ]);
      return ContentService.createTextOutput("OK").setMimeType(ContentService.MimeType.TEXT);
    }

  4) Publica → Implementar como aplicación web → Ejecutar como: "Yo" → ¿Quién tiene acceso?: "Cualquiera".
  5) Copia la URL que te dé y pégala abajo.
*/
// URL de la Web App de Apps Script (NO es la URL del documento de Sheets).
// Debe tener el formato: https://script.google.com/macros/s/XXXXXXXX/exec
const GOOGLE_SHEETS_URL = "https://script.google.com/macros/s/AKfycbxFAjuzIT_At0pBjOk_703tHuG5iBBXZGXDzXuB8G8AOhZskW1fCE8lxTGmA8qzNSeZAA/exec";

const STORAGE_KEY = "rsvpList";

function getStoredRSVPs() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function storeRSVPs(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

function updateDownloadButton() {
  const list = getStoredRSVPs();
  downloadBtn.disabled = list.length === 0;
}

function escapeCsv(value) {
  const str = String(value ?? "");
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function buildCsv(entries) {
  const header = [
    "Fecha (UTC)",
    "Nombre",
    "Correo",
    "Asistirá",
    "Transporte",
    "Acompañante",
    "Mensaje"
  ];

  const rows = entries.map((entry) => [
    entry.timestamp,
    entry.nombre,
    entry.email,
    entry.asistencia,
    entry.transporte,
    entry.acompanante,
    entry.mensaje
  ]);

  const lines = [header, ...rows].map((row) => row.map(escapeCsv).join(","));
  return lines.join("\n");
}

function downloadCsv() {
  const list = getStoredRSVPs();
  if (!list.length) return;

  const csv = buildCsv(list);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `RSVP-boda-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(form);
  const nombre = formData.get("nombre").trim();
  const email = (formData.get("email") || "").trim();
  const asistencia = formData.get("asistencia");
  const transporte = formData.get("transporte");
  const acompanante = (formData.get("acompanante") || "").trim();
  const mensaje = (formData.get("mensaje") || "").trim();

  if (!nombre || !asistencia || !transporte || !email) {
    feedbackEl.textContent = "Por favor completa todos los campos requeridos.";
    feedbackEl.style.color = "#d32f2f";
    return;
  }

  const list = getStoredRSVPs();
  list.push({
    timestamp: new Date().toISOString(),
    nombre,
    email,
    asistencia,
    transporte,
    acompanante,
    mensaje
  });

  storeRSVPs(list);
  updateDownloadButton();

  feedbackEl.textContent = "¡Gracias! Hemos recibido tu confirmación.";
  feedbackEl.style.color = "#2e7d32";

  // Si tienes una URL de Google Sheet configurada, enviamos también allí.
  if (GOOGLE_SHEETS_URL) {
  fetch(GOOGLE_SHEETS_URL, {
    method: "POST",
    body: JSON.stringify({
      nombre,
      email,
      asistencia,
      transporte,
      acompanante,
      mensaje,
    }),
  })
  .then(r => r.text())
  .then(console.log)
  .catch(console.error);
}


  form.reset();
});

downloadBtn.addEventListener("click", downloadCsv);

// Acordeón simple
const accordionButtons = document.querySelectorAll(".accordion-button");

accordionButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const targetId = button.dataset.target;
    const panel = document.getElementById(targetId);

    const expanded = button.getAttribute("aria-expanded") === "true";
    button.setAttribute("aria-expanded", String(!expanded));

    if (!expanded) {
      panel.style.maxHeight = panel.scrollHeight + "px";
    } else {
      panel.style.maxHeight = "0";
    }
  });
});

updateDownloadButton();
