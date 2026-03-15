# Pokemon TCG Center (Frontend)

Frontend de la aplicacion **Pokemon TCG Center**: compra y venta de cartas Pokemon TCG con autenticacion, perfil de usuario, listados y busqueda. Desarrollado con Vue 3, Vite, Pinia y Vue Router.

## Caracteristicas

- **Autenticacion**: registro e inicio de sesion con JWT
- **Inicio**: carrusel de cartas destacadas y acceso rapido a comprar/vender
- **Comprar**: busqueda y compra de cartas
- **Vender**: publicar anuncios de venta con detalles de carta y rareza
- **Mis anuncios**: gestion de tus listados activos
- **Perfil**: datos de usuario y sesion

## Stack

| Tecnologia | Uso |
|------------|-----|
| [Vue 3](https://vuejs.org/) | Framework UI |
| [Vite 8](https://vitejs.dev/) | Build y dev server |
| [Vue Router 4](https://router.vuejs.org/) | Rutas y guards |
| [Pinia](https://pinia.vuejs.org/) | Estado global (auth) |
| [Axios](https://axios-http.com/) | Cliente HTTP hacia el API |

## Requisitos

- **Node.js** 18+ (recomendado 20+)
- **Backend Laravel** corriendo y accesible (por defecto `http://127.0.0.1:8000/api`)

## Instalacion

```bash
git clone https://github.com/jose22uwu/FrontEnd-TCG-Center.git
cd FrontEnd-TCG-Center
npm install
```

## Configuracion

Copia el ejemplo de variables de entorno y ajusta la URL del API si no usas el valor por defecto:

```bash
cp .env.example .env
```

Edita `.env`:

```env
# URL del backend Laravel (debe estar corriendo, ej: php artisan serve)
VITE_API_URL=http://127.0.0.1:8000/api
```

## Despliegue con Docker

Desde la **raíz del proyecto** (carpeta que contiene `FrontPKMNTCG` y el backend):

```bash
docker compose up -d --build
```

O usa el script: `./scripts/deploy-docker.sh` (bash) o `.\scripts\deploy-docker.ps1` (PowerShell).

- **Frontend:** http://localhost:8080 (imagen construida desde `FrontPKMNTCG/Dockerfile`, sirve el build con nginx).
- **Backend API:** http://localhost:8000 (el front se construye con `VITE_API_URL=http://localhost:8000/api` por defecto).

Para otro dominio de la API (p. ej. producción), define `VITE_API_URL` en un `.env` en la raíz antes de construir: `VITE_API_URL=https://api.ejemplo.com/api docker compose build frontend`.

## Scripts

| Comando | Descripcion |
|---------|-------------|
| `npm run dev` | Servidor de desarrollo en http://localhost:5173 |
| `npm run build` | Build de produccion en `dist/` |
| `npm run preview` | Vista previa del build de produccion |

## Estructura del proyecto

```
src/
  components/     # Componentes reutilizables (ej. HoloModalLowPolyBg)
  composables/    # useClickOutside, useScreenDust
  constants/      # Estilos y constantes (rarityModalStyles)
  layouts/        # MainLayout (nav + outlet)
  router/         # Rutas y guards de autenticacion
  services/       # api.js (axios + interceptors JWT)
  stores/         # auth (Pinia)
  styles/         # CSS por vista y componentes
  utils/          # cardImage, apiResponse
  views/          # Login, Register, Home, Buy, Sell, Profile, MyListings
```

## Rutas

| Ruta | Requiere auth | Descripcion |
|------|----------------|-------------|
| `/login` | No (redirige si ya autenticado) | Iniciar sesion |
| `/register` | No | Registro |
| `/` | Si | Inicio (carrusel y enlaces) |
| `/buy` | Si | Comprar cartas |
| `/sell` | Si | Vender cartas |
| `/listings` | Si | Mis anuncios |
| `/profile` | Si | Mi perfil |

## Backend

Este frontend espera un API REST Laravel que exponga al menos:

- Autenticacion: registro, login, respuestas con token JWT
- Recursos de cartas y listados segun las vistas (Buy, Sell, MyListings)
- Cabecera `Authorization: Bearer <token>` en peticiones autenticadas

Las respuestas 401 provocan limpieza de token y redireccion a `/login`.

## Licencia

Proyecto privado. Uso segun acuerdo del equipo.
