# Gaslighting

> Encuentra las gasolineras más baratas cerca de ti en España.

Gaslighting es una aplicación web progresiva (PWA) que muestra en tiempo real los precios de los carburantes en las gasolineras de España, con datos directamente del Ministerio de Energía. Visualiza estaciones en un mapa interactivo, filtra por tipo de combustible, guarda tus favoritas y estima el coste de repostaje según tu vehículo.

---

## Características

- **Mapa interactivo** — Visualiza las gasolineras cercanas sobre un mapa con marcadores de precio en tiempo real
- **Datos oficiales** — Precios actualizados desde la API del Ministerio de Energía (MINETUR)
- **Filtros por combustible** — Gasolina 95, Gasolina 98 y Diésel
- **Ordenación** — Por distancia o por precio
- **Búsqueda por ubicación** — Geocodificación con Nominatim (OpenStreetMap) para buscar por ciudad, provincia o código postal
- **Favoritas** — Guarda tus gasolineras habituales con nombre personalizado y notas
- **Estimación de coste** — Calcula cuánto te cuesta llenar el depósito según la capacidad y consumo de tu vehículo
- **Modo oscuro / claro** — Tema adaptable
- **PWA** — Instalable en móvil desde el navegador (Android e iOS)
- **Responsive** — Diseñada mobile-first con navegación inferior en móvil

---

## Stack tecnológico

### Frontend
| Tecnología | Uso |
|---|---|
| [Vue 3](https://vuejs.org/) | Framework principal |
| [Vite](https://vitejs.dev/) | Bundler y servidor de desarrollo |
| [Pinia](https://pinia.vuejs.org/) | Gestión de estado |
| [Vue Router](https://router.vuejs.org/) | Enrutamiento SPA |
| [Leaflet](https://leafletjs.com/) | Mapas interactivos |

### Backend
| Tecnología | Uso |
|---|---|
| [Laravel 12](https://laravel.com/) | Framework PHP |
| [PHP 8.2+](https://www.php.net/) | Lenguaje servidor |
| [PostgreSQL 15](https://www.postgresql.org/) | Base de datos |
| [Docker](https://www.docker.com/) | Contenedores para desarrollo local |

### Infraestructura
| Servicio | Uso |
|---|---|
| AWS Amplify | Hosting del frontend (CD automático desde `main`) |
| AWS EC2 | Servidor del backend (Laravel + Nginx + PHP-FPM) |
| GitHub Actions | CI/CD — tests + deploy automático |

---

## Arquitectura

```
┌─────────────────────────────────────────────────────────┐
│                        Cliente                          │
│   Vue 3 SPA (Amplify CDN)                               │
│   ┌──────────┐  ┌──────────┐  ┌──────────────────────┐ │
│   │ MapView  │  │Favoritos │  │      Ajustes         │ │
│   └──────────┘  └──────────┘  └──────────────────────┘ │
│   ┌─────────────────────────────────────────────────┐   │
│   │           Pinia Stores (estado global)          │   │
│   │  gasStations · favorites · settings             │   │
│   └─────────────────────────────────────────────────┘   │
└───────────────────┬─────────────────────┬───────────────┘
                    │ REST API            │ REST API
                    ▼                     ▼
          ┌─────────────────┐   ┌────────────────────────┐
          │  Backend API    │   │  MINETUR API (externo) │
          │  Laravel (EC2)  │   │  Precios carburantes   │
          └────────┬────────┘   └────────────────────────┘
                   │
                   ▼
          ┌─────────────────┐
          │   PostgreSQL    │
          │  users          │
          │  gas_stations   │
          │  favorites      │
          └─────────────────┘
```

### Estructura de directorios

```
gaslighting/
├── frontend/                  # SPA Vue 3
│   ├── src/
│   │   ├── views/             # MapView, FavoritosView, AjustesView
│   │   ├── components/        # AppBottomNav, StationCard, FuelFilterBar...
│   │   ├── stores/            # Pinia: gasStations, favorites, settings
│   │   ├── composables/       # useMapView, useFavoritosView...
│   │   ├── services/          # api.js (backend), gasolineras.js (MINETUR)
│   │   ├── router/            # Rutas Vue Router
│   │   └── styles/            # CSS global (variables, layout, map...)
│   └── public/                # favicon, manifest.json, iconos PWA
├── backend/                   # API Laravel
│   ├── app/
│   │   ├── Http/Controllers/  # UserController, FavoriteController
│   │   └── Models/            # User, GasStation, FavoriteGasStation
│   ├── routes/api.php         # Definición de endpoints REST
│   └── database/              # Migraciones y seeders
├── .github/workflows/         # GitHub Actions CI/CD
├── docker-compose.yml         # Entorno de desarrollo local
└── amplify.yml                # Configuración build Amplify
```

---

## API REST

Base URL: `https://gasapi.ddelacortep.tech/api`

### Usuarios
| Método | Endpoint | Descripción |
|---|---|---|
| `POST` | `/users/init` | Registra una instancia de usuario (anónima, UUID) |
| `PUT` | `/users/{id}/activity` | Actualiza timestamp de última actividad |

### Favoritas
| Método | Endpoint | Descripción |
|---|---|---|
| `POST` | `/favorites` | Añade una gasolinera a favoritas |
| `GET` | `/favorites/{userId}` | Obtiene las favoritas de un usuario |
| `PUT` | `/favorites/{favoriteId}` | Actualiza nombre o notas de una favorita |
| `DELETE` | `/favorites/{favoriteId}` | Elimina una favorita |

---

## Instalación y desarrollo local

### Requisitos
- Node.js 22+
- PHP 8.2+
- Composer
- Docker & Docker Compose

### Frontend

```bash
cd frontend
npm install
cp .env.example .env        # Configura VITE_APP_URL_BASE y VITE_GASOLINERAS_URL
npm run dev
```

### Backend

```bash
cd backend
composer install
cp .env.example .env        # Configura DB_* y APP_KEY
php artisan key:generate
php artisan migrate

# O con Docker (PostgreSQL incluido):
docker-compose up -d
```

### Variables de entorno

**Frontend (`.env`):**
```env
VITE_APP_URL_BASE=http://localhost:8000
VITE_GASOLINERAS_URL=https://sedeaplicaciones.minetur.gob.es/ServiciosRESTCarburantes/PreciosCarburantes/EstacionesTerrestres/
```

**Backend (`.env`):**
```env
APP_NAME=Gaslighting
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=gaslighting
DB_USERNAME=postgres
DB_PASSWORD=secret
```

---

## Despliegue

El pipeline de CI/CD se ejecuta automáticamente al hacer push a `main`:

1. **Tests backend** — Pest sobre SQLite en GitHub Actions
2. **Build frontend** — `npm run build` con Vite
3. **Deploy backend** — SSH a EC2 con releases versionados y rollback automático en caso de fallo en el healthcheck
4. **Deploy frontend** — AWS Amplify detecta el push y hace el build/deploy automáticamente

---

## Datos de carburantes

Los precios se obtienen en tiempo real desde la API pública del Ministerio para la Transición Ecológica y el Reto Demográfico (MITERD):

```
https://sedeaplicaciones.minetur.gob.es/ServiciosRESTCarburantes/PreciosCarburantes/EstacionesTerrestres/
```

No requiere autenticación. Los datos incluyen precio, dirección, horario, coordenadas y marca de cada estación de servicio en España.
