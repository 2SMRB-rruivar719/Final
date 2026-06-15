<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://raw.githubusercontent.com/2SMRB-rruivar719/travelmatch/refs/heads/main/logo.PNG" />
</div>

# StudyMatch

Aplicación para matching de estudiantes + planificador de estudio con IA + backend Express/MongoDB.

## Requisitos

- Node.js 22+
- MongoDB en `localhost:27017`

## Configuración

Crear `.env.local` en la raíz:

```bash
# opcional: sobreescribir API base
# VITE_API_BASE_URL=http://localhost:4000/api
# opcional: sobreescribir URI Mongo
# MONGODB_URI=mongodb://127.0.0.1:27017/studymatch
```

## Instalación

```bash
npm install
cd server && npm install
```

## Scripts principales (raíz)

- `npm run dev`: frontend Vite
- `npm run dev:server`: backend API
- `npm run dev:full`: frontend + backend
- `npm run typecheck`: verificación TypeScript
- `npm run build`: build de producción
- `npm run test:register`: prueba de registro contra API local

## API de diagnóstico

- `GET http://localhost:4000/api/health`
  - devuelve estado de API y conexión de MongoDB (`mongoStateLabel`)

## Despliegue con Docker

Archivos incluidos:

- `Dockerfile.frontend`: build de Vite + servido estático con Nginx (contenedor)
- `server/Dockerfile`: API Express
- `compose.yml`: stack `frontend` + `api` + `mongo`

### Levantar servicios

```bash
docker compose -f compose.yml up -d --build
```

Servicios publicados en loopback para usar detrás de Nginx del host:

- Frontend: `127.0.0.1:3000`
- API: `127.0.0.1:4000`

### Nginx del host (HTTPS ya configurado)

Ejemplo de bloques `location` dentro de tu `server` HTTPS:

```nginx
location / {
  proxy_pass http://127.0.0.1:3000;
  proxy_http_version 1.1;
  proxy_set_header Host $host;
  proxy_set_header X-Real-IP $remote_addr;
  proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
  proxy_set_header X-Forwarded-Proto $scheme;
}

location /api/ {
  proxy_pass http://127.0.0.1:4000/api/;
  proxy_http_version 1.1;
  proxy_set_header Host $host;
  proxy_set_header X-Real-IP $remote_addr;
  proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
  proxy_set_header X-Forwarded-Proto $scheme;
}
```

### Comandos útiles

```bash
docker compose -f compose.yml ps
docker compose -f compose.yml logs -f api
docker compose -f compose.yml down
```
