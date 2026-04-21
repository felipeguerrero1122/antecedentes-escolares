# Deploy con Neon

## Arquitectura recomendada
- Base de datos: Neon PostgreSQL
- Backend: Render
- Frontend: Vercel

## 1. Crear la base en Neon
- Crea un proyecto en Neon.
- Copia la connection string principal.
- Pégala como `DATABASE_URL` en Render.

## 2. Publicar el backend en Render
- Sube este proyecto a GitHub.
- En Render, crea un servicio desde el repositorio usando `render.yaml`.
- Configura estas variables:
  - `DATABASE_URL`: la URL de Neon
  - `FRONTEND_ORIGINS`: la URL final del frontend en Vercel
  - `ADMIN_EMAIL`
  - `ADMIN_PASSWORD`
  - `ADMIN_NAME`
- El backend quedará con una URL tipo `https://tu-api.onrender.com`.

## 3. Publicar el frontend en Vercel
- Importa el mismo repositorio en Vercel.
- Configura:
  - `VITE_API_URL`: la URL pública del backend en Render
- El frontend quedará con una URL tipo `https://tu-app.vercel.app`.

## 4. Primer acceso
- Entra al frontend desplegado.
- Inicia sesión con el admin definido en Render.

## Notas
- El login usa cookie segura; por eso `FRONTEND_ORIGINS` debe coincidir con la URL real del frontend.
- Si cambias el dominio del frontend, actualiza `FRONTEND_ORIGINS` en Render.
