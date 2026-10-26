
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwxmx7imlRq3hZ1RQRxGpju09-h1TH06aVmi2md0oxWsJ0CLPNoBfuwEkyl36O7YGMIPQ/exec";

const weddingDate = new Date("2027-05-01T17:30:00+02:00");

// Cuenta atrás
function updateCountdown() {
  const now = new Date();
  let diff = Math.max(0, weddingDate - now);

  const sec = Math.floor(diff / 1000);
  const days = Math.floor(sec / 86400);
  const hours = Math.floor((sec % 86400) / 3600);
  const minutes = Math.floor((sec % 3600) / 60);
  const seconds = sec % 60;

  const setText = (selector, value) => {
    const el = document.querySelector(selector);
    if (el) el.textContent = value;
  };

  setText('[data-unit="days"]', String(days));
  setText('[data-unit="hours"]', String(hours).padStart(2, "0"));
  setText('[data-unit="minutes"]', String(minutes).padStart(2, "0"));
  setText('[data-unit="seconds"]', String(seconds).padStart(2, "0"));
}

updateCountdown();
setInterval(updateCountdown, 1000);

// Menú de navegación
const toggle = document.querySelector(".menu-toggle");
const nav = document.querySelector("#nav");

toggle?.addEventListener("click", () => {
  nav?.classList.toggle("open");
});

nav?.querySelectorAll("a").forEach((a) => {
  a.addEventListener("click", () => nav.classList.remove("open"));
});

// Campos condicionales del formulario
const form = document.querySelector("#rsvpForm");
const asistencia = document.querySelector("#asistencia");
const guestFields = document.querySelector("#guestFields");
const acompanante = document.querySelector("#acompanante");
const guestNameWrap = document.querySelector("#guestNameWrap");
const note = document.querySelector("#formNote");
const submitButton = form?.querySelector('button[type="submit"]');

function updateConditional() {
  if (!asistencia || !guestFields) return;

  const attending = asistencia.value.startsWith("Sí");
  guestFields.style.display = attending ? "grid" : "none";

  if (!attending) {
    guestFields.querySelectorAll("input, select, textarea").forEach((field) => {
      field.value = "";
    });

    if (guestNameWrap) guestNameWrap.classList.add("hidden");
  }
}

asistencia?.addEventListener("change", updateConditional);

acompanante?.addEventListener("change", () => {
  if (!guestNameWrap) return;

  const showName = acompanante.value === "Sí";
  guestNameWrap.classList.toggle("hidden", !showName);

  const nameInput = guestNameWrap.querySelector("input");
  if (nameInput && !showName) nameInput.value = "";
});

updateConditional();

// Convierte los datos en texto para copiar la respuesta
function formDataText() {
  if (!form) return "";

  const fd = new FormData(form);

  const lines = [
    `NOMBRE: ${fd.get("nombre") || ""}`,
    `ASISTENCIA: ${fd.get("asistencia") || ""}`,
    `ACOMPAÑANTE: ${fd.get("nombre_acompanante") || "—"}`,
    `ALERGIAS/INTOLERANCIAS: ${fd.get("alergias") || "—"}`,
    `MENÚ: ${fd.get("menu") || "—"}`,
    `HOTEL: ${fd.get("hotel") || "—"}`,
    `NECESIDADES ESPECIALES: ${fd.get("necesidades") || "—"}`,
    `CANCIÓN 1: ${fd.get("cancion1") || "—"}`,
    `CANCIÓN 2: ${fd.get("cancion2") || "—"}`,
    `CANCIÓN 3: ${fd.get("cancion3") || "—"}`,
    `COMENTARIOS: ${fd.get("comentarios") || "—"}`
  ];

  return lines.join("\n");
}

// Envío a Google Sheets
async function sendToGoogleSheets() {
  if (!form) return;

  const fd = new FormData(form);
  const payload = new URLSearchParams();

  for (const [key, value] of fd.entries()) {
    payload.append(key, String(value));
  }

  // Compatibilidad con la clave que espera el Apps Script existente.
  payload.set(
    "nombresAcompanantes",
    String(fd.get("nombre_acompanante") || "")
  );

  // Envío de formulario sin necesidad de que el invitado inicie sesión.
  // El navegador no permite leer la respuesta de Google en modo no-cors.
  await fetch(APPS_SCRIPT_URL, {
    method: "POST",
    mode: "no-cors",
    body: payload
  });
}

form?.addEventListener("submit", async (e) => {
  e.preventDefault();

  if (!form.reportValidity()) return;

  if (submitButton) {
    submitButton.disabled = true;
    submitButton.textContent = "Enviando confirmación…";
  }

  if (note) {
    note.textContent = "Estamos enviando vuestra respuesta…";
    note.style.fontWeight = "600";
  }

  try {
    await sendToGoogleSheets();

    if (note) {
      note.textContent =
        "¡Gracias por confirmar! ♡ Hemos enviado la solicitud. " +
        "Como Google no permite verificar aquí la recepción, " +
        "comprobad que aparece en la hoja de respuestas.";
      note.style.fontWeight = "600";
    }

    form.reset();
    updateConditional();
  } catch (error) {
    console.error("Error al enviar la confirmación:", error);

    if (note) {
      note.textContent =
        "No hemos podido enviar la respuesta. Comprueba tu conexión " +
        "y vuelve a intentarlo, o utiliza «Copiar respuesta».";
      note.style.fontWeight = "600";
    }
  } finally {
    if (submitButton) {
      submitButton.disabled = false;
      submitButton.textContent = "Preparar mi confirmación ♡";
    }
  }
});

// Botón para copiar la respuesta manualmente
document.querySelector("#copyRsvp")?.addEventListener("click", async () => {
  const text = formDataText();

  try {
    await navigator.clipboard.writeText(text);

    if (note) note.textContent = "Respuesta copiada al portapapeles ♡";
  } catch {
    if (note) {
      note.textContent =
        "No se pudo copiar automáticamente. Selecciona y copia los datos manualmente.";
    }
  }
});
