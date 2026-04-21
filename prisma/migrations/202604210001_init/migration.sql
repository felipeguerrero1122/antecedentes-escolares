CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE "Admin" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "email" TEXT NOT NULL,
  "passwordHash" TEXT NOT NULL,
  "nombre" TEXT NOT NULL,
  "activo" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Admin_email_key" ON "Admin"("email");

CREATE TABLE "Alumno" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "matricula" TEXT NOT NULL,
  "apellidos" TEXT NOT NULL,
  "nombres" TEXT NOT NULL,
  "sexo" TEXT,
  "fechaNac" TIMESTAMP(3),
  "run" TEXT NOT NULL,
  "curso" TEXT,
  "direccion" TEXT,
  "comuna" TEXT,
  "procedencia" TEXT,
  "fechaIncorp" TIMESTAMP(3),
  "cursosRep" TEXT,
  "fechaRetiro" TIMESTAMP(3),
  "causalRetiro" TEXT,
  "fechaEgreso" TIMESTAMP(3),
  "nivelPadre" TEXT,
  "nivelMadre" TEXT,
  "convivencia" TEXT,
  "apNombres" TEXT,
  "apDireccion" TEXT,
  "apEmail" TEXT,
  "apCelular" TEXT,
  "apEmergencia" TEXT,
  "observaciones" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "Alumno_pkey" PRIMARY KEY ("id")
);
