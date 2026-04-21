const alumnoFields = [
  "matricula",
  "apellidos",
  "nombres",
  "sexo",
  "fechaNac",
  "run",
  "curso",
  "direccion",
  "comuna",
  "procedencia",
  "fechaIncorp",
  "cursosRep",
  "fechaRetiro",
  "causalRetiro",
  "fechaEgreso",
  "nivelPadre",
  "nivelMadre",
  "convivencia",
  "apNombres",
  "apDireccion",
  "apEmail",
  "apCelular",
  "apEmergencia",
  "observaciones",
];

const dateFields = ["fechaNac", "fechaIncorp", "fechaRetiro", "fechaEgreso"];

function parseDate(value) {
  if (!value) return null;
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatDate(value) {
  if (!value) return "";
  return new Date(value).toISOString().slice(0, 10);
}

export function normalizeAlumnoPayload(payload) {
  const data = {};

  for (const field of alumnoFields) {
    if (!(field in payload)) continue;
    const value = payload[field];

    if (dateFields.includes(field)) {
      data[field] = parseDate(value);
      continue;
    }

    if (typeof value === "string") {
      data[field] = value.trim();
      continue;
    }

    data[field] = value ?? null;
  }

  data.matricula = typeof data.matricula === "string" ? data.matricula : "";
  data.apellidos = typeof data.apellidos === "string" ? data.apellidos : "";
  data.nombres = typeof data.nombres === "string" ? data.nombres : "";
  data.run = typeof data.run === "string" ? data.run : "";

  return data;
}

export function validateAlumnoPayload(payload) {
  const errors = [];

  if (!payload.matricula) errors.push("La matrícula es obligatoria.");
  if (!payload.apellidos) errors.push("Los apellidos son obligatorios.");
  if (!payload.nombres) errors.push("Los nombres son obligatorios.");
  if (!payload.run) errors.push("El RUN es obligatorio.");

  return errors;
}

export function serializeAlumno(alumno) {
  if (!alumno) return null;

  const result = { ...alumno };
  for (const field of dateFields) {
    result[field] = formatDate(alumno[field]);
  }
  return result;
}
