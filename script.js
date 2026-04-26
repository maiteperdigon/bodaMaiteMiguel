const form = document.getElementById("rsvp-form");
const feedbackEl = document.getElementById("rsvp-feedback");
// const downloadBtn = document.getElementById("download-csv");

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

// function updateDownloadButton() {
//   if (!downloadBtn) return;
//   const list = getStoredRSVPs();
//   downloadBtn.disabled = list.length === 0;
// }

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

// function downloadCsv() {
//   const list = getStoredRSVPs();
//   if (!list.length) return;

//   const csv = buildCsv(list);
//   const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
//   const url = URL.createObjectURL(blob);
//   const link = document.createElement("a");
//   link.href = url;
//   link.download = `RSVP-boda-${new Date().toISOString().slice(0, 10)}.csv`;
//   document.body.appendChild(link);
//   link.click();
//   document.body.removeChild(link);
//   URL.revokeObjectURL(url);
// }

if (form) {
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
      if (feedbackEl) {
        feedbackEl.textContent = "Por favor completa todos los campos requeridos.";
        feedbackEl.style.color = "#d32f2f";
      }
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
    // updateDownloadButton();

    if (feedbackEl) {
      feedbackEl.textContent = "¡Gracias! Hemos recibido tu confirmación.";
      feedbackEl.style.color = "#2e7d32";
    }

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
}

// if (downloadBtn) {
//   downloadBtn.addEventListener("click", downloadCsv);
// }

// Acordeón simple
document.addEventListener("DOMContentLoaded", () => {
  const accordionButtons = document.querySelectorAll(".accordion-button");

  accordionButtons.forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();

      const targetId = button.dataset.target;
      const panel = document.getElementById(targetId);

      if (!panel) return;

      const isExpanded = button.getAttribute("aria-expanded") === "true";

      // Toggle el estado
      button.setAttribute("aria-expanded", String(!isExpanded));

      if (!isExpanded) {
        // Abrir el panel
        panel.classList.add("open");
      } else {
        // Cerrar el panel
        panel.classList.remove("open");
      }
    });
  });
});

// Función de cuenta atrás
function updateCountdown() {
  // Fecha de la boda: 12 de septiembre de 2026 a las 16:00 (hora española - CEST UTC+2)
  const weddingDate = new Date('2026-09-12T16:00:00+02:00');
  const now = new Date();
  
  const timeDifference = weddingDate - now;
  
  if (timeDifference > 0) {
    const days = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeDifference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeDifference % (1000 * 60)) / 1000);
    
    document.getElementById('days').textContent = days.toString().padStart(2, '0');
    document.getElementById('hours').textContent = hours.toString().padStart(2, '0');
    document.getElementById('minutes').textContent = minutes.toString().padStart(2, '0');
    document.getElementById('seconds').textContent = seconds.toString().padStart(2, '0');
  } else {
    // Si ya pasó la fecha, mostrar 00:00:00:00
    document.getElementById('days').textContent = '00';
    document.getElementById('hours').textContent = '00';
    document.getElementById('minutes').textContent = '00';
    document.getElementById('seconds').textContent = '00';
  }
}

// Inicializar cuenta atrás
updateCountdown();
setInterval(updateCountdown, 1000);

// updateDownloadButton();
