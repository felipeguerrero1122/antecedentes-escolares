import "dotenv/config";
import bcrypt from "bcrypt";
import connectPgSimple from "connect-pg-simple";
import cors from "cors";
import express from "express";
import session from "express-session";
import pg from "pg";
import { prisma } from "./prisma.js";
import {
  normalizeAlumnoPayload,
  serializeAlumno,
  validateAlumnoPayload,
} from "./alumnos.js";

const app = express();
const port = Number(process.env.PORT || 3001);
const isProduction = process.env.NODE_ENV === "production";
const PgSession = connectPgSimple(session);
const sessionTtlSeconds = 60 * 60 * 12;
const pgPool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isProduction ? { rejectUnauthorized: false } : undefined,
});
const configuredOrigins = (process.env.FRONTEND_ORIGINS || "")
  .split(",")
  .map((value) => value.trim())
  .filter(Boolean);

function isAllowedOrigin(origin) {
  if (!origin) return true;
  if (configuredOrigins.includes(origin)) return true;

  return /^(https?:\/\/)(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2\d|3[0-1])\.\d+\.\d+)(:\d+)?$/.test(origin);
}

app.set("trust proxy", 1);
app.use(
  cors({
    origin(origin, callback) {
      if (isAllowedOrigin(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error("Origin not allowed by CORS"));
    },
    credentials: true,
  }),
);

app.use(express.json());
app.use(
  session({
    name: "antecedentes.sid",
    secret: process.env.SESSION_SECRET || "cambia-este-secreto",
    resave: false,
    saveUninitialized: false,
    store: new PgSession({
      pool: pgPool,
      tableName: "user_sessions",
      createTableIfMissing: true,
      ttl: sessionTtlSeconds,
    }),
    cookie: {
      httpOnly: true,
      sameSite: isProduction ? "none" : "lax",
      secure: isProduction,
      maxAge: sessionTtlSeconds * 1000,
    },
  }),
);

function requireAuth(req, res, next) {
  if (!req.session.adminId) {
    return res.status(401).json({ error: "No autenticado." });
  }
  return next();
}

function serializeAdmin(admin) {
  return {
    id: admin.id,
    email: admin.email,
    nombre: admin.nombre,
  };
}

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.get("/api/auth/me", async (req, res) => {
  if (!req.session.adminId) {
    return res.status(401).json({ error: "No autenticado." });
  }

  const admin = await prisma.admin.findUnique({
    where: { id: req.session.adminId },
  });

  if (!admin || !admin.activo) {
    req.session.destroy(() => {});
    return res.status(401).json({ error: "Sesión inválida." });
  }

  return res.json({ admin: serializeAdmin(admin) });
});

app.post("/api/auth/login", async (req, res) => {
  const email = typeof req.body.email === "string" ? req.body.email.trim().toLowerCase() : "";
  const password = typeof req.body.password === "string" ? req.body.password : "";

  if (!email || !password) {
    return res.status(400).json({ error: "Email y contraseña son obligatorios." });
  }

  const admin = await prisma.admin.findUnique({
    where: { email },
  });

  if (!admin || !admin.activo) {
    return res.status(401).json({ error: "Credenciales inválidas." });
  }

  const matches = await bcrypt.compare(password, admin.passwordHash);
  if (!matches) {
    return res.status(401).json({ error: "Credenciales inválidas." });
  }

  req.session.adminId = admin.id;
  return res.json({ admin: serializeAdmin(admin) });
});

app.post("/api/auth/logout", (req, res) => {
  req.session.destroy(() => {
    res.clearCookie("antecedentes.sid", {
      httpOnly: true,
      sameSite: isProduction ? "none" : "lax",
      secure: isProduction,
    });
    res.json({ ok: true });
  });
});

app.get("/api/alumnos", requireAuth, async (_req, res) => {
  const alumnos = await prisma.alumno.findMany({
    orderBy: [{ matricula: "asc" }, { apellidos: "asc" }, { nombres: "asc" }],
  });

  res.json({ alumnos: alumnos.map(serializeAlumno) });
});

app.get("/api/alumnos/:id", requireAuth, async (req, res) => {
  const alumno = await prisma.alumno.findUnique({
    where: { id: req.params.id },
  });

  if (!alumno) {
    return res.status(404).json({ error: "Alumno no encontrado." });
  }

  return res.json({ alumno: serializeAlumno(alumno) });
});

app.post("/api/alumnos", requireAuth, async (req, res) => {
  const data = normalizeAlumnoPayload(req.body);
  const errors = validateAlumnoPayload(data);

  if (errors.length > 0) {
    return res.status(400).json({ error: errors[0], errors });
  }

  const alumno = await prisma.alumno.create({ data });
  return res.status(201).json({ alumno: serializeAlumno(alumno) });
});

app.put("/api/alumnos/:id", requireAuth, async (req, res) => {
  const existing = await prisma.alumno.findUnique({
    where: { id: req.params.id },
  });

  if (!existing) {
    return res.status(404).json({ error: "Alumno no encontrado." });
  }

  const data = normalizeAlumnoPayload(req.body);
  const errors = validateAlumnoPayload(data);

  if (errors.length > 0) {
    return res.status(400).json({ error: errors[0], errors });
  }

  const alumno = await prisma.alumno.update({
    where: { id: req.params.id },
    data,
  });

  return res.json({ alumno: serializeAlumno(alumno) });
});

app.delete("/api/alumnos/:id", requireAuth, async (req, res) => {
  const existing = await prisma.alumno.findUnique({
    where: { id: req.params.id },
  });

  if (!existing) {
    return res.status(404).json({ error: "Alumno no encontrado." });
  }

  await prisma.alumno.delete({
    where: { id: req.params.id },
  });

  return res.json({ ok: true });
});

app.use((err, _req, res, _next) => {
  console.error(err);
  const status = err?.status || 500;
  const message = status === 500 ? "Error interno del servidor." : err.message;
  res.status(status).json({ error: message });
});

app.listen(port, () => {
  console.log(`API escuchando en http://localhost:${port}`);
});
