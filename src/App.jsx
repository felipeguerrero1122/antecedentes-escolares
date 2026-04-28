import { useEffect, useState } from "react";
import { api } from "./api";

const CURSOS = [
  "Pre-Kinder",
  "Kinder",
  "1° Básico",
  "2° Básico",
  "3° Básico",
  "4° Básico",
  "5° Básico",
  "6° Básico",
  "7° Básico",
  "8° Básico",
  "I° Medio",
  "II° Medio",
  "III° Medio",
  "IV° Medio",
];

const NIVEL_ED = [
  "Sin estudios",
  "Básica incompleta",
  "Básica completa",
  "Media incompleta",
  "Media completa",
  "Técnica incompleta",
  "Técnica completa",
  "Universitaria incompleta",
  "Universitaria completa",
  "Postgrado",
];

const CAUSALES = [
  "Traslado a otro establecimiento",
  "Cambio de ciudad/región",
  "Problemas de salud",
  "Razones económicas",
  "Otra",
];

const STEPS = [
  { id: 1, label: "Identificación" },
  { id: 2, label: "Domicilio" },
  { id: 3, label: "Antecedentes" },
  { id: 4, label: "Familia" },
  { id: 5, label: "Apoderado" },
  { id: 6, label: "Observaciones" },
];

const PALETTE = ["#0D9488", "#3B82F6", "#8B5CF6", "#EC4899", "#F59E0B", "#10B981", "#6366F1", "#EF4444"];

const EMPTY = {
  matricula: "",
  apellidos: "",
  nombres: "",
  sexo: "",
  fechaNac: "",
  run: "",
  curso: "",
  direccion: "",
  comuna: "",
  procedencia: "",
  fechaIncorp: "",
  cursosRep: "",
  fechaRetiro: "",
  causalRetiro: "",
  fechaEgreso: "",
  nivelPadre: "",
  nivelMadre: "",
  convivencia: "",
  apNombres: "",
  apDireccion: "",
  apEmail: "",
  apCelular: "",
  apEmergencia: "",
  observaciones: "",
};

function edad31Marzo(fechaNac) {
  if (!fechaNac) return null;
  const d = new Date(`${fechaNac}T00:00:00`);
  const ref = new Date(new Date().getFullYear(), 2, 31);
  let e = ref.getFullYear() - d.getFullYear();
  const m = ref.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && ref.getDate() < d.getDate())) e -= 1;
  return e;
}

function initials(apellidos, nombres) {
  return ((nombres?.[0] || "") + (apellidos?.[0] || "")).toUpperCase() || "?";
}

function colorAvatar(curso) {
  if (!curso) return PALETTE[0];
  return PALETTE[curso.charCodeAt(0) % PALETTE.length];
}

function fmtDate(str) {
  if (!str) return "—";
  return new Date(`${str}T00:00:00`).toLocaleDateString("es-CL");
}

function getErrorMessage(error, fallback = "Ocurrió un error inesperado.") {
  return error?.body?.error || error?.message || fallback;
}

function compareMatricula(a, b) {
  const valueA = (a?.matricula || "").trim();
  const valueB = (b?.matricula || "").trim();
  const numericA = /^\d+$/.test(valueA) ? Number(valueA) : Number.NaN;
  const numericB = /^\d+$/.test(valueB) ? Number(valueB) : Number.NaN;

  if (!Number.isNaN(numericA) && !Number.isNaN(numericB) && numericA !== numericB) {
    return numericA - numericB;
  }

  return valueA.localeCompare(valueB, "es", { numeric: true, sensitivity: "base" });
}

const S = {
  page: { maxWidth: 720, margin: "0 auto", padding: "24px 16px", fontFamily: "'Segoe UI', system-ui, sans-serif" },
  pageTall: { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 16, fontFamily: "'Segoe UI', system-ui, sans-serif" },
  h1: { margin: 0, fontSize: 22, fontWeight: 700, color: "#1e3a5f" },
  muted: { color: "#64748b", fontSize: 13 },
  row: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, gap: 12 },
  card: {
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: 12,
    padding: "14px 18px",
    marginBottom: 10,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: "50%",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 700,
    fontSize: 15,
    flexShrink: 0,
  },
  badge: {
    background: "#f0fdf4",
    color: "#166534",
    borderRadius: 6,
    padding: "2px 8px",
    fontSize: 12,
    fontWeight: 500,
  },
  badgeBlue: {
    background: "#eff6ff",
    color: "#1d4ed8",
    borderRadius: 6,
    padding: "2px 8px",
    fontSize: 12,
    fontWeight: 500,
  },
  input: {
    width: "100%",
    padding: "9px 12px",
    border: "1px solid #e2e8f0",
    borderRadius: 8,
    fontSize: 14,
    boxSizing: "border-box",
    background: "#fff",
    color: "#1e293b",
    outline: "none",
  },
  inputReadOnly: {
    width: "100%",
    padding: "9px 12px",
    border: "1px solid #f1f5f9",
    borderRadius: 8,
    fontSize: 14,
    boxSizing: "border-box",
    background: "#f8fafc",
    color: "#64748b",
  },
  label: { display: "block", fontSize: 12, fontWeight: 600, color: "#475569", marginBottom: 5, textTransform: "uppercase", letterSpacing: ".3px" },
  campo: { marginBottom: 16 },
  grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 },
  grid3: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 },
  btnP: { background: "#0D9488", color: "#fff", border: "none", borderRadius: 8, padding: "10px 20px", fontWeight: 600, fontSize: 14, cursor: "pointer" },
  btnS: { background: "#f8fafc", color: "#1e3a5f", border: "1px solid #e2e8f0", borderRadius: 8, padding: "9px 16px", fontSize: 14, fontWeight: 500, cursor: "pointer" },
  btnG: { background: "transparent", color: "#64748b", border: "1px solid #e2e8f0", borderRadius: 8, padding: "8px 12px", fontSize: 14, cursor: "pointer" },
  btnD: { background: "transparent", color: "#dc2626", border: "1px solid #fecaca", borderRadius: 8, padding: "8px 12px", fontSize: 14, cursor: "pointer" },
  back: { background: "none", border: "none", color: "#0D9488", fontWeight: 600, fontSize: 14, cursor: "pointer", padding: 0 },
  search: { width: "100%", padding: "10px 14px", border: "1px solid #e2e8f0", borderRadius: 10, fontSize: 14, marginBottom: 16, boxSizing: "border-box", outline: "none" },
  empty: { textAlign: "center", padding: "60px 20px", border: "1px dashed #cbd5e1", borderRadius: 12, background: "#f8fafc" },
  formCard: { background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: "24px", marginBottom: 20 },
  stepTitle: { fontSize: 17, fontWeight: 700, color: "#1e3a5f", margin: "0 0 20px" },
  sectionHead: { fontSize: 11, fontWeight: 700, color: "#0D9488", textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 },
  pill: { width: 28, height: 28, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, flexShrink: 0 },
  alert: { background: "#fff7ed", color: "#9a3412", border: "1px solid #fdba74", borderRadius: 10, padding: "10px 12px", fontSize: 14, marginBottom: 16 },
  loginWrap: { width: "100%", maxWidth: 420 },
  loginCard: { background: "#fff", border: "1px solid #e2e8f0", borderRadius: 18, padding: 28, boxShadow: "0 30px 60px rgba(15, 23, 42, 0.08)" },
  heroBadge: { display: "inline-flex", alignItems: "center", gap: 8, background: "#f0fdfa", color: "#0f766e", border: "1px solid #99f6e4", borderRadius: 999, padding: "6px 12px", fontSize: 12, fontWeight: 700, marginBottom: 18, textTransform: "uppercase", letterSpacing: ".06em" },
};

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
  * { font-family: 'Plus Jakarta Sans', 'Segoe UI', system-ui, sans-serif; }
  body {
    background:
      radial-gradient(circle at top, rgba(13, 148, 136, 0.08), transparent 35%),
      linear-gradient(180deg, #f8fafc 0%, #ffffff 34%);
  }
  .chover:hover { box-shadow: 0 4px 14px rgba(0,0,0,0.08); transform: translateY(-1px); transition: all .15s; }
  input:focus, select:focus, textarea:focus { border-color: #0D9488 !important; box-shadow: 0 0 0 3px rgba(13,148,136,0.12) !important; }
  button { transition: opacity .15s; }
  button:hover { opacity: .88; }
  button:active { transform: scale(0.97); }
  .stepper { display:flex; align-items:center; overflow-x:auto; padding-bottom:4px; margin-bottom:20px; }
  .step-line { height:2px; width:20px; flex-shrink:0; }
  ::-webkit-scrollbar { width:4px; height:4px; }
  ::-webkit-scrollbar-thumb { background:#cbd5e1; border-radius:4px; }
  @media (max-width: 720px) {
    .grid-2, .grid-3 {
      grid-template-columns: 1fr !important;
    }
  }
`;

function Campo({ label, required, children }) {
  return (
    <div style={S.campo}>
      <label style={S.label}>
        {label}
        {required && <span style={{ color: "#ef4444" }}> *</span>}
      </label>
      {children}
    </div>
  );
}

function Inp({ value, onChange, type = "text", placeholder, readOnly }) {
  return (
    <input
      style={readOnly ? S.inputReadOnly : S.input}
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      readOnly={readOnly}
    />
  );
}

function Sel({ value, onChange, options, placeholder }) {
  return (
    <select style={S.input} value={value} onChange={onChange}>
      <option value="">{placeholder || "Seleccionar..."}</option>
      {options.map((o) =>
        typeof o === "string" ? (
          <option key={o} value={o}>
            {o}
          </option>
        ) : (
          <option key={o.v} value={o.v}>
            {o.l}
          </option>
        ),
      )}
    </select>
  );
}

function SessionBar({ admin, onLogout }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{ textAlign: "right" }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#1e3a5f" }}>{admin.nombre}</div>
        <div style={{ ...S.muted, marginTop: 2 }}>{admin.email}</div>
      </div>
      <button style={S.btnS} onClick={onLogout}>Cerrar sesión</button>
    </div>
  );
}

function LoginView({ onLogin, error, loading }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function submit(event) {
    event.preventDefault();
    onLogin({ email, password });
  }

  return (
    <div style={S.pageTall}>
      <style>{CSS}</style>
      <div style={S.loginWrap}>
        <div style={S.loginCard}>
          <div style={S.heroBadge}>Acceso administrador</div>
          <h1 style={{ ...S.h1, fontSize: 32, lineHeight: 1.1, marginBottom: 12 }}>Libro de Matrícula</h1>
          <p style={{ ...S.muted, fontSize: 15, margin: "0 0 24px" }}>
            Inicia sesión para administrar antecedentes escolares, matrículas y fichas de alumnos.
          </p>

          {error && <div style={S.alert}>{error}</div>}

          <form onSubmit={submit}>
            <Campo label="Email" required>
              <Inp value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="admin@colegio.cl" />
            </Campo>
            <Campo label="Contraseña" required>
              <Inp value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Ingresa tu contraseña" />
            </Campo>
            <button style={{ ...S.btnP, width: "100%", marginTop: 8 }} type="submit" disabled={loading}>
              {loading ? "Ingresando..." : "Ingresar como administrador"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function StepIdentificacion({ form, upd }) {
  return (
    <>
      <h2 style={S.stepTitle}>Identificación del Alumno</h2>
      <div style={S.grid2} className="grid-2">
        <Campo label="N° de Matrícula" required><Inp value={form.matricula} onChange={upd("matricula")} placeholder="Ej: 001" /></Campo>
        <Campo label="RUN" required><Inp value={form.run} onChange={upd("run")} placeholder="12.345.678-9" /></Campo>
      </div>
      <div style={S.grid2} className="grid-2">
        <Campo label="Apellidos" required><Inp value={form.apellidos} onChange={upd("apellidos")} placeholder="Apellidos completos" /></Campo>
        <Campo label="Nombres" required><Inp value={form.nombres} onChange={upd("nombres")} placeholder="Nombres completos" /></Campo>
      </div>
      <div style={S.grid3} className="grid-3">
        <Campo label="Sexo">
          <Sel value={form.sexo} onChange={upd("sexo")} options={[{ v: "M", l: "Masculino" }, { v: "F", l: "Femenino" }]} />
        </Campo>
        <Campo label="Fecha de Nacimiento">
          <Inp type="date" value={form.fechaNac} onChange={upd("fechaNac")} />
        </Campo>
        <Campo label="Edad al 31 de Marzo">
          <div style={S.inputReadOnly}>{form.fechaNac ? `${edad31Marzo(form.fechaNac)} años` : "—"}</div>
        </Campo>
      </div>
      <Campo label="Curso">
        <Sel value={form.curso} onChange={upd("curso")} options={CURSOS} placeholder="Seleccionar curso..." />
      </Campo>
    </>
  );
}

function StepDomicilio({ form, upd }) {
  return (
    <>
      <h2 style={S.stepTitle}>Domicilio</h2>
      <Campo label="Dirección"><Inp value={form.direccion} onChange={upd("direccion")} placeholder="Calle, número, depto..." /></Campo>
      <Campo label="Comuna"><Inp value={form.comuna} onChange={upd("comuna")} placeholder="Ej: Santiago, Providencia..." /></Campo>
    </>
  );
}

function StepAntecedentes({ form, upd }) {
  return (
    <>
      <h2 style={S.stepTitle}>Antecedentes Escolares</h2>
      <Campo label="Establecimiento de Procedencia">
        <Inp value={form.procedencia} onChange={upd("procedencia")} placeholder="Nombre del colegio anterior" />
      </Campo>
      <div style={S.grid2} className="grid-2">
        <Campo label="Fecha de Incorporación"><Inp type="date" value={form.fechaIncorp} onChange={upd("fechaIncorp")} /></Campo>
        <Campo label="Cursos que ha Repetido"><Inp value={form.cursosRep} onChange={upd("cursosRep")} placeholder="Ej: 3° Básico" /></Campo>
      </div>
      <div style={S.grid2} className="grid-2">
        <Campo label="Fecha de Retiro"><Inp type="date" value={form.fechaRetiro} onChange={upd("fechaRetiro")} /></Campo>
        <Campo label="Causal de Retiro"><Sel value={form.causalRetiro} onChange={upd("causalRetiro")} options={CAUSALES} /></Campo>
      </div>
      <Campo label="Fecha de Egreso"><Inp type="date" value={form.fechaEgreso} onChange={upd("fechaEgreso")} /></Campo>
    </>
  );
}

function StepFamilia({ form, upd }) {
  return (
    <>
      <h2 style={S.stepTitle}>Antecedentes Familiares</h2>
      <div style={S.grid2} className="grid-2">
        <Campo label="Nivel educacional del Padre"><Sel value={form.nivelPadre} onChange={upd("nivelPadre")} options={NIVEL_ED} /></Campo>
        <Campo label="Nivel educacional de la Madre"><Sel value={form.nivelMadre} onChange={upd("nivelMadre")} options={NIVEL_ED} /></Campo>
      </div>
      <Campo label="Persona(s) con quien vive (vínculo)">
        <Inp value={form.convivencia} onChange={upd("convivencia")} placeholder="Ej: Madre y padre, solo abuela..." />
      </Campo>
    </>
  );
}

function StepApoderado({ form, upd }) {
  return (
    <>
      <h2 style={S.stepTitle}>Apoderado / Tutor</h2>
      <Campo label="Nombre del Apoderado"><Inp value={form.apNombres} onChange={upd("apNombres")} placeholder="Nombres y apellidos completos" /></Campo>
      <Campo label="Dirección del Apoderado"><Inp value={form.apDireccion} onChange={upd("apDireccion")} placeholder="Dirección del apoderado" /></Campo>
      <div style={S.grid2} className="grid-2">
        <Campo label="Correo Electrónico"><Inp type="email" value={form.apEmail} onChange={upd("apEmail")} placeholder="correo@ejemplo.cl" /></Campo>
        <Campo label="Celular"><Inp type="tel" value={form.apCelular} onChange={upd("apCelular")} placeholder="+56 9 XXXX XXXX" /></Campo>
      </div>
      <Campo label="Avisar en Caso de Emergencia"><Inp value={form.apEmergencia} onChange={upd("apEmergencia")} placeholder="Nombre y teléfono de emergencia" /></Campo>
    </>
  );
}

function StepObservaciones({ form, upd }) {
  return (
    <>
      <h2 style={S.stepTitle}>Observaciones</h2>
      <Campo label="Observaciones">
        <textarea
          style={{ ...S.input, height: 140, resize: "vertical" }}
          value={form.observaciones}
          onChange={upd("observaciones")}
          placeholder="Notas adicionales, situaciones especiales, etc."
        />
      </Campo>
    </>
  );
}

function Stepper({ step, setStep }) {
  return (
    <div className="stepper">
      {STEPS.map((st, i) => {
        const done = step > st.id;
        const active = step === st.id;
        return (
          <div key={st.id} style={{ display: "flex", alignItems: "center" }}>
            <div
              style={{
                ...S.pill,
                background: active ? "#0D9488" : done ? "#d1fae5" : "#f1f5f9",
                color: active ? "#fff" : done ? "#059669" : "#94a3b8",
                cursor: done ? "pointer" : "default",
              }}
              onClick={() => done && setStep(st.id)}
            >
              {done ? "✓" : st.id}
            </div>
            <span style={{ fontSize: 12, fontWeight: 500, marginLeft: 5, color: active || done ? "#0D9488" : "#94a3b8", whiteSpace: "nowrap", marginRight: 4 }}>
              {st.label}
            </span>
            {i < STEPS.length - 1 && <div className="step-line" style={{ background: done ? "#0D9488" : "#e2e8f0" }} />}
          </div>
        );
      })}
    </div>
  );
}

function Lista({ admin, alumnos, allCount, search, setSearch, onNuevo, onVer, onEditar, onLogout, error }) {
  return (
    <div style={S.page}>
      <style>{CSS}</style>
      <div style={S.row}>
        <div>
          <h1 style={S.h1}>📚 Libro de Matrícula</h1>
          <p style={{ ...S.muted, margin: "4px 0 0" }}>
            {allCount} alumno{allCount !== 1 ? "s" : ""} matriculado{allCount !== 1 ? "s" : ""}
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <SessionBar admin={admin} onLogout={onLogout} />
          <button style={S.btnP} onClick={onNuevo}>+ Nuevo Alumno</button>
        </div>
      </div>

      {error && <div style={S.alert}>{error}</div>}

      <input
        style={S.search}
        placeholder="🔍  Buscar por nombre, RUN o curso..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {alumnos.length === 0 ? (
        <div style={S.empty}>
          {allCount === 0 ? (
            <>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🎓</div>
              <p style={{ color: "#475569", fontWeight: 600, margin: 0 }}>No hay alumnos registrados aún</p>
              <p style={{ ...S.muted, margin: "6px 0 18px" }}>Comienza agregando el primer alumno al libro.</p>
              <button style={S.btnP} onClick={onNuevo}>+ Agregar primer alumno</button>
            </>
          ) : (
            <p style={{ color: "#64748b" }}>No se encontraron resultados para "{search}".</p>
          )}
        </div>
      ) : (
        <div>
          {alumnos.map((a) => (
            <div key={a.id} style={{ ...S.card, display: "flex", alignItems: "center", gap: 14, cursor: "pointer" }} className="chover">
              <div style={{ display: "flex", alignItems: "center", gap: 14, flex: 1 }} onClick={() => onVer(a)}>
                <div style={{ ...S.avatar, background: colorAvatar(a.curso) }}>
                  {initials(a.apellidos, a.nombres)}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 600, color: "#1e3a5f" }}>
                    {a.apellidos && a.nombres ? `${a.apellidos}, ${a.nombres}` : a.apellidos || a.nombres || "Sin nombre"}
                  </div>
                  <div style={{ display: "flex", gap: 6, marginTop: 5, alignItems: "center", flexWrap: "wrap" }}>
                    {a.run && <span style={S.muted}>{a.run}</span>}
                    {a.curso && <span style={S.badge}>{a.curso}</span>}
                    {a.sexo && <span style={S.badgeBlue}>{a.sexo === "M" ? "Masculino" : "Femenino"}</span>}
                    {a.comuna && <span style={{ ...S.muted, fontSize: 12 }}>📍 {a.comuna}</span>}
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button style={S.btnS} onClick={() => onVer(a)}>Ver ficha</button>
                <button style={S.btnG} onClick={() => onEditar(a)} title="Editar">✏️</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Formulario({ admin, error, form, setForm, step, setStep, onGuardar, onCancelar, isEdit, onLogout, saving }) {
  const upd = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));

  return (
    <div style={S.page}>
      <style>{CSS}</style>
      <div style={{ ...S.row, marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button style={S.back} onClick={onCancelar}>← Volver</button>
          <h1 style={{ ...S.h1, margin: 0 }}>{isEdit ? "Editar Alumno" : "Nuevo Alumno"}</h1>
        </div>
        <SessionBar admin={admin} onLogout={onLogout} />
      </div>

      {error && <div style={S.alert}>{error}</div>}

      <Stepper step={step} setStep={setStep} />

      <div style={S.formCard}>
        {step === 1 && <StepIdentificacion form={form} upd={upd} />}
        {step === 2 && <StepDomicilio form={form} upd={upd} />}
        {step === 3 && <StepAntecedentes form={form} upd={upd} />}
        {step === 4 && <StepFamilia form={form} upd={upd} />}
        {step === 5 && <StepApoderado form={form} upd={upd} />}
        {step === 6 && <StepObservaciones form={form} upd={upd} />}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <button style={S.btnS} onClick={() => step > 1 ? setStep((p) => p - 1) : onCancelar()}>
          {step > 1 ? "← Anterior" : "Cancelar"}
        </button>
        {step < 6
          ? <button style={S.btnP} onClick={() => setStep((p) => p + 1)}>Siguiente →</button>
          : <button style={S.btnP} onClick={onGuardar} disabled={saving}>{saving ? "Guardando..." : "💾 Guardar Alumno"}</button>}
      </div>
    </div>
  );
}

function Detalle({ admin, alumno: a, onVolver, onEditar, onEliminar, onLogout, error, deleting }) {
  const Section = ({ title, fields }) => {
    const visible = fields.filter(([, v]) => v);
    if (!visible.length) return null;
    return (
      <div style={{ ...S.card, marginBottom: 12 }}>
        <div style={S.sectionHead}>{title}</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 24px" }} className="grid-2">
          {visible.map(([label, value]) => (
            <div key={label} style={{ borderBottom: "1px solid #f1f5f9", paddingBottom: 8 }}>
              {label && <div style={{ fontSize: 11, color: "#94a3b8", textTransform: "uppercase", letterSpacing: ".5px" }}>{label}</div>}
              <div style={{ fontSize: 14, color: "#1e3a5f", fontWeight: 500, marginTop: 2 }}>{value}</div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div style={S.page}>
      <style>{CSS}</style>
      <div style={{ ...S.row, marginBottom: 24, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button style={S.back} onClick={onVolver}>← Volver</button>
          <h1 style={{ ...S.h1, margin: 0 }}>Ficha del Alumno</h1>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <button style={S.btnS} onClick={onEditar}>✏️ Editar</button>
          <button style={S.btnD} onClick={onEliminar} disabled={deleting}>{deleting ? "Eliminando..." : "🗑️ Eliminar"}</button>
          <SessionBar admin={admin} onLogout={onLogout} />
        </div>
      </div>

      {error && <div style={S.alert}>{error}</div>}

      <div style={{ ...S.card, marginBottom: 16, display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{ ...S.avatar, width: 56, height: 56, fontSize: 20, background: colorAvatar(a.curso) }}>
          {initials(a.apellidos, a.nombres)}
        </div>
        <div>
          <div style={{ fontSize: 20, fontWeight: 700, color: "#1e3a5f" }}>
            {a.apellidos && a.nombres ? `${a.apellidos}, ${a.nombres}` : a.apellidos || a.nombres || "Sin nombre"}
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 6, flexWrap: "wrap" }}>
            {a.run && <span style={S.badge}>{a.run}</span>}
            {a.curso && <span style={S.badgeBlue}>{a.curso}</span>}
            {a.matricula && <span style={{ ...S.muted, fontSize: 12 }}>Matrícula N°{a.matricula}</span>}
          </div>
        </div>
      </div>

      <Section title="Identificación" fields={[
        ["Nombres", a.nombres], ["Apellidos", a.apellidos], ["RUN", a.run], ["Curso", a.curso],
        ["Sexo", a.sexo === "M" ? "Masculino" : a.sexo === "F" ? "Femenino" : ""],
        ["Fecha de Nacimiento", fmtDate(a.fechaNac)],
        ["Edad al 31 de Marzo", a.fechaNac ? `${edad31Marzo(a.fechaNac)} años` : ""],
      ]} />
      <Section title="Domicilio" fields={[
        ["Dirección", a.direccion], ["Comuna", a.comuna],
      ]} />
      <Section title="Antecedentes Escolares" fields={[
        ["Procedencia", a.procedencia],
        ["Fecha de Incorporación", fmtDate(a.fechaIncorp)],
        ["Cursos Repetidos", a.cursosRep],
        ["Fecha de Retiro", fmtDate(a.fechaRetiro)],
        ["Causal de Retiro", a.causalRetiro],
        ["Fecha de Egreso", fmtDate(a.fechaEgreso)],
      ]} />
      <Section title="Antecedentes Familiares" fields={[
        ["Nivel educacional Padre", a.nivelPadre],
        ["Nivel educacional Madre", a.nivelMadre],
        ["Convive con", a.convivencia],
      ]} />
      <Section title="Apoderado / Tutor" fields={[
        ["Nombre", a.apNombres], ["Dirección", a.apDireccion],
        ["Correo", a.apEmail], ["Celular", a.apCelular],
        ["Emergencia", a.apEmergencia],
      ]} />
      {a.observaciones && (
        <div style={{ ...S.card, marginBottom: 12 }}>
          <div style={S.sectionHead}>Observaciones</div>
          <p style={{ margin: 0, fontSize: 14, color: "#334155", lineHeight: 1.6 }}>{a.observaciones}</p>
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [booting, setBooting] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);
  const [admin, setAdmin] = useState(null);
  const [authError, setAuthError] = useState("");
  const [view, setView] = useState("lista");
  const [alumnos, setAlumnos] = useState([]);
  const [editId, setEditId] = useState(null);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [step, setStep] = useState(1);
  const [search, setSearch] = useState("");
  const [screenError, setScreenError] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    initialize();
  }, []);

  async function initialize() {
    setBooting(true);
    setScreenError("");
    try {
      const response = await api.me();
      setAdmin(response.admin);
      await refreshAlumnos();
    } catch (error) {
      if (error.status === 401) {
        setAdmin(null);
      } else {
        setScreenError(getErrorMessage(error, "No pudimos conectarnos con el servidor."));
      }
    } finally {
      setBooting(false);
    }
  }

  async function refreshAlumnos() {
    try {
      const response = await api.listAlumnos();
      setAlumnos(response.alumnos);
      return response.alumnos;
    } catch (error) {
      if (error.status === 401) {
        setAdmin(null);
        throw error;
      }
      throw error;
    }
  }

  async function handleLogin(credentials) {
    setAuthLoading(true);
    setAuthError("");
    setScreenError("");
    try {
      const response = await api.login(credentials);
      setAdmin(response.admin);
      const loadedAlumnos = await refreshAlumnos();
      setView("lista");
      setSelected(null);
      setEditId(null);
      setForm({ ...EMPTY, matricula: String(loadedAlumnos.length + 1).padStart(3, "0") });
    } catch (error) {
      setAuthError(getErrorMessage(error, "No fue posible iniciar sesión."));
    } finally {
      setAuthLoading(false);
    }
  }

  async function handleLogout() {
    try {
      await api.logout();
    } catch {
      // Ignore logout API errors and clear local session state anyway.
    }
    setAdmin(null);
    setAlumnos([]);
    setSelected(null);
    setEditId(null);
    setView("lista");
    setScreenError("");
  }

  function goNuevo() {
    setScreenError("");
    setForm({ ...EMPTY, matricula: String(alumnos.length + 1).padStart(3, "0") });
    setEditId(null);
    setStep(1);
    setView("form");
  }

  function goEditar(a) {
    setScreenError("");
    setForm({ ...EMPTY, ...a });
    setEditId(a.id);
    setStep(1);
    setView("form");
  }

  function goVer(a) {
    setScreenError("");
    setSelected(a);
    setView("detalle");
  }

  async function guardar() {
    setSaving(true);
    setScreenError("");
    try {
      const response = editId
        ? await api.updateAlumno(editId, form)
        : await api.createAlumno(form);

      const alumno = response.alumno;
      if (editId) {
        setAlumnos((prev) => prev.map((item) => (item.id === editId ? alumno : item)));
        setSelected((prev) => (prev?.id === editId ? alumno : prev));
      } else {
        setAlumnos((prev) => [...prev, alumno]);
      }
      setView("lista");
      setEditId(null);
    } catch (error) {
      if (error.status === 401) {
        await handleLogout();
        return;
      }
      setScreenError(getErrorMessage(error, "No pudimos guardar el alumno."));
    } finally {
      setSaving(false);
    }
  }

  async function eliminar(id) {
    if (!window.confirm("¿Confirmas que quieres eliminar este alumno?")) return;
    setDeleting(true);
    setScreenError("");
    try {
      await api.deleteAlumno(id);
      setAlumnos((prev) => prev.filter((a) => a.id !== id));
      setSelected(null);
      setView("lista");
    } catch (error) {
      if (error.status === 401) {
        await handleLogout();
        return;
      }
      setScreenError(getErrorMessage(error, "No pudimos eliminar el alumno."));
    } finally {
      setDeleting(false);
    }
  }

  const filtered = alumnos
    .filter((a) => {
      const q = search.toLowerCase();
      return !q
        || `${a.nombres} ${a.apellidos}`.toLowerCase().includes(q)
        || (a.run || "").toLowerCase().includes(q)
        || (a.curso || "").toLowerCase().includes(q)
        || (a.comuna || "").toLowerCase().includes(q)
        || (a.matricula || "").toLowerCase().includes(q);
    })
    .sort(compareMatricula);

  if (booting) {
    return (
      <div style={{ padding: 60, textAlign: "center", color: "#64748b", fontFamily: "system-ui, sans-serif" }}>
        Cargando aplicación...
      </div>
    );
  }

  if (!admin) {
    return <LoginView onLogin={handleLogin} error={authError || screenError} loading={authLoading} />;
  }

  if (view === "lista") {
    return (
      <Lista
        admin={admin}
        alumnos={filtered}
        allCount={alumnos.length}
        search={search}
        setSearch={setSearch}
        onNuevo={goNuevo}
        onVer={goVer}
        onEditar={goEditar}
        onLogout={handleLogout}
        error={screenError}
      />
    );
  }

  if (view === "form") {
    return (
      <Formulario
        admin={admin}
        error={screenError}
        form={form}
        setForm={setForm}
        step={step}
        setStep={setStep}
        onGuardar={guardar}
        onCancelar={() => setView("lista")}
        isEdit={!!editId}
        onLogout={handleLogout}
        saving={saving}
      />
    );
  }

  if (view === "detalle" && selected) {
    return (
      <Detalle
        admin={admin}
        alumno={selected}
        onVolver={() => setView("lista")}
        onEditar={() => goEditar(selected)}
        onEliminar={() => eliminar(selected.id)}
        onLogout={handleLogout}
        error={screenError}
        deleting={deleting}
      />
    );
  }

  return null;
}
