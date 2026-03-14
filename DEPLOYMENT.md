# Producción: GitHub Actions + EC2 + Amplify

Este repositorio usa dos rutas de despliegue:

1. **Backend Laravel**: `.github/workflows/deploy.yml` (GitHub Actions -> EC2 por SSH)
2. **Frontend Vue**: `amplify.yml` (AWS Amplify Git-connected)

## 1) Secrets requeridos en GitHub (Actions)

Configura estos secrets a nivel repo:

- `EC2_HOST`: IP o DNS público de la instancia EC2
- `EC2_USER`: usuario SSH de deploy (ej. `ec2-user`, `ubuntu`)
- `EC2_SSH_PRIVATE_KEY`: clave privada SSH en formato PEM
- `EC2_PORT`: puerto SSH (opcional, default `22`)
- `DEPLOY_PATH`: ruta base de releases (opcional, default `/var/www/gaslighting`)
- `BACKEND_HEALTHCHECK_URL`: URL de health check del backend (opcional)
- `VITE_API_BASE_URL`: valor de build para validación del frontend en CI
- `VITE_GASOLINERAS_URL`: valor de build opcional para frontend

## 2) Estructura esperada en EC2

El workflow usa este layout:

- `${DEPLOY_PATH}/releases/<timestamp>`
- `${DEPLOY_PATH}/current` (symlink al release activo)
- `${DEPLOY_PATH}/shared/.env`
- `${DEPLOY_PATH}/shared/storage`
- `${DEPLOY_PATH}/shared/bootstrap-cache`

Asegura que `${DEPLOY_PATH}/shared/.env` exista antes del primer deploy.

### Variables mínimas de backend para PostgreSQL (`shared/.env`)

```env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://api.tudominio.com

DB_CONNECTION=pgsql
DB_HOST=<host-postgres>
DB_PORT=5432
DB_DATABASE=<database>
DB_USERNAME=<username>
DB_PASSWORD=<password>

QUEUE_CONNECTION=database
CACHE_STORE=database
SESSION_DRIVER=database
```

## 3) Cómo funciona el deploy

Cuando hay push a `main`:

1. `validate-backend`: instala dependencias y ejecuta tests del backend
2. `validate-frontend`: instala dependencias y compila frontend
3. `deploy-backend-ec2`: sube backend a release nuevo, instala composer, migra, optimiza, activa symlink y recarga servicios

Si se define `BACKEND_HEALTHCHECK_URL` y falla, intenta rollback al symlink previo.

## 4) Amplify (frontend)

Amplify usa `amplify.yml` en raíz y despliega `frontend` automáticamente por push.

En Amplify Console:

- Configura branch de producción: `main`
- Define variables de entorno, mínimo: `VITE_API_BASE_URL`
- Agrega rewrite SPA: `/*` -> `/index.html` (200)

## 5) Primer despliegue recomendado

1. Crear secrets de GitHub
2. Preparar `${DEPLOY_PATH}/shared/.env` en EC2
3. Verificar permisos de escritura para el usuario de deploy en `${DEPLOY_PATH}`
4. Hacer push a `main`
5. Revisar logs del workflow y el estado de deploy en Amplify
