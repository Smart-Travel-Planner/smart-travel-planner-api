# Smart Travel Planner API

API REST para la gestión de viajes, ubicaciones y actividades. Permite a los usuarios crear y gestionar itinerarios personalizados, añadir colaboradores a sus viajes y organizar actividades con fechas, costes y categorías.

---

## Índice

1. [Tecnologías utilizadas](#tecnologías-utilizadas)
2. [Requisitos previos](#requisitos-previos)
3. [Instalación](#instalación)
4. [Variables de entorno](#variables-de-entorno)
5. [Ejecución](#ejecución)
6. [Documentación de la API](#documentación-de-la-api)
7. [Módulos](#módulos)
8. [Autenticación](#autenticación)
9. [Roles y permisos](#roles-y-permisos)
10. [Base de datos](#base-de-datos)
11. [Tests](#tests)
12. [Estado del Proyecto e Invitación a Colaborar](#estado-del-proyecto-e-invitación-a-colaborar)

---

## Tecnologías utilizadas

| Tecnología | Versión | Uso |
|---|---|---|
| [NestJS](https://nestjs.com/) | 11.x | Framework principal |
| [TypeScript](https://www.typescriptlang.org/) | 5.x | Lenguaje de programación |
| [Supabase](https://supabase.com/) | 2.x | Base de datos (PostgreSQL) |
| [Passport.js](https://www.passportjs.org/) | - | Middleware de autenticación |
| [JWT](https://jwt.io/) | - | Tokens de autenticación propios |
| [bcrypt](https://github.com/kelektiv/node.bcrypt.js) | - | Hashing de contraseñas |
| [class-validator](https://github.com/typestack/class-validator) | - | Validación de DTOs |
| [class-transformer](https://github.com/typestack/class-transformer) | - | Transformación de datos |
| [Swagger](https://swagger.io/) | - | Documentación de la API |

---

## Requisitos previos

- Node.js v18 o superior
- npm v9 o superior
- Cuenta y proyecto activo en [Supabase](https://supabase.com/)

---

## Instalación

```bash
# Clonar el repositorio
git clone https://github.com/JEspinosa1770/smart-travel-planner-api
cd smart-travel-planner-api

# Instalar dependencias
npm install
```

---

## Variables de entorno

Copia el archivo .env.example incluido en el repositorio y renómbralo a .env:
```bash
cp .env.example .env
```
Rellena las variables con tus propios valores:
```env
PORT=3000
SUPABASE_URL=https://tu-project-id.supabase.co
SUPABASE_ANON_KEY=tu_anon_key
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
JWT_SECRET=tu_jwt_secret_largo_y_aleatorio
JWT_EXPIRATION_TIME=3600s
```

> ⚠️ Nunca subas el archivo `.env` al repositorio. Está incluido en `.gitignore`.

Las claves de Supabase se encuentran en **Settings → API** del panel de tu proyecto.

---

## Ejecución

```bash
# Desarrollo (con hot reload)
npm run start:dev

# Producción
npm run build
npm run start:prod
```

---

## Documentación de la API

Con el servidor en marcha, la documentación Swagger está disponible en:

```
http://localhost:3000/api-docs
```

Para probar los endpoints protegidos:
1. Ejecuta `POST /auth/login` y copia el `access_token`.
2. Haz clic en el botón **Authorize** (arriba a la derecha en Swagger).
3. Pega el token y confirma.

---

## Módulos

### Auth
Gestión de registro e inicio de sesión. Genera tokens JWT propios, independientes de Supabase Auth.

| Método | Endpoint | Descripción | Protegido |
|---|---|---|---|
| POST | `/auth/register` | Registra un nuevo usuario | No |
| POST | `/auth/login` | Inicia sesión y obtiene un JWT | No |

### Users
Gestión de perfiles de usuario. Los usuarios pueden ver y editar su propio perfil. Los administradores pueden gestionar todos los usuarios.

| Método | Endpoint | Descripción | Rol requerido |
|---|---|---|---|
| GET | `/users` | Lista todos los usuarios | admin |
| GET | `/users/me` | Obtiene el perfil propio | user |
| GET | `/users/:id` | Obtiene un usuario por id | admin |
| PUT | `/users/me` | Actualiza el perfil propio | user |
| PUT | `/users/:id` | Actualiza un usuario por id | admin |
| DELETE | `/users/:id` | Elimina un usuario | admin |

### Trips
CRUD de viajes. Cada viaje pertenece a un usuario creador y puede ser público o privado.

| Método | Endpoint | Descripción |
|---|---|---|
| POST | `/trips` | Crea un nuevo viaje |
| GET | `/trips/public` | Lista todos los viajes públicos |
| GET | `/trips/my-trips` | Lista los viajes propios |
| GET | `/trips/:id` | Obtiene un viaje por id |
| PUT | `/trips/:id` | Actualiza un viaje |
| DELETE | `/trips/:id` | Elimina un viaje |

### Trip Members
Gestión de colaboradores en un viaje. Solo el owner del viaje puede gestionar miembros.

| Método | Endpoint | Descripción |
|---|---|---|
| POST | `/trips/:tripId/members` | Añade un colaborador al viaje |
| GET | `/trips/:tripId/members` | Lista los miembros del viaje |
| PUT | `/trips/:tripId/members/:memberId/role` | Actualiza el rol de un miembro |
| DELETE | `/trips/:tripId/members/:memberId` | Elimina un miembro del viaje |

### Locations
CRUD de ubicaciones. Son entidades reutilizables que pueden asociarse a actividades de cualquier viaje.

| Método | Endpoint | Descripción |
|---|---|---|
| POST | `/locations` | Crea una nueva ubicación |
| GET | `/locations` | Lista todas las ubicaciones |
| GET | `/locations/:id` | Obtiene una ubicación por id |
| PUT | `/locations/:id` | Actualiza una ubicación |
| DELETE | `/locations/:id` | Elimina una ubicación |

### Activities
CRUD de actividades. Cada actividad pertenece a un viaje y opcionalmente a una ubicación. Tanto el owner como los colaboradores del viaje pueden gestionar actividades.

| Método | Endpoint | Descripción |
|---|---|---|
| POST | `/activities` | Crea una nueva actividad |
| GET | `/activities/trip/:tripId` | Lista las actividades de un viaje |
| GET | `/activities/:id` | Obtiene una actividad por id |
| PUT | `/activities/:id` | Actualiza una actividad |
| DELETE | `/activities/:id` | Elimina una actividad |

### Travel Requirements
Gestión de requisitos de viaje (documentación, salud, moneda). Cada viaje puede tener un único registro de requisitos.

| Método | Endpoint | Descripción |
|---|---|---|
| POST | `/travel-requirements` | Crea los requisitos de un viaje |
| GET | `/travel-requirements/trip/:tripId` | Obtiene los requisitos de un viaje |
| PUT | `/travel-requirements/trip/:tripId` | Actualiza los requisitos de un viaje |
| DELETE | `/travel-requirements/trip/:tripId` | Elimina los requisitos de un viaje |

---

## Autenticación

El backend utiliza **JWT propio**, independiente de Supabase Auth. Esto garantiza que el sistema es agnóstico respecto a la base de datos utilizada.

El flujo de autenticación es:
1. El usuario se registra o inicia sesión.
2. El backend valida las credenciales contra la tabla `profiles` de Supabase.
3. El backend genera y firma un JWT con su propio `JWT_SECRET`.
4. El cliente incluye el token en cada request en la cabecera `Authorization: Bearer <token>`.

Todos los endpoints están protegidos por defecto excepto `POST /auth/register` y `POST /auth/login`, que están marcados como públicos con el decorador `@Public()`.

---

## Roles y permisos

El sistema cuenta con dos roles:

- **user** — rol por defecto. Puede gestionar sus propios viajes, ubicaciones y actividades.
- **admin** — puede gestionar todos los usuarios del sistema.

Los roles se gestionan mediante el decorador `@Roles('admin')` y el guard global `RolesGuard`.

---

## Base de datos

El proyecto utiliza **Supabase (PostgreSQL)** como base de datos. Las tablas principales son:

| Tabla | Descripción |
|---|---|
| `profiles` | Usuarios de la aplicación |
| `trips` | Viajes creados por los usuarios |
| `trip_members` | Colaboradores de cada viaje |
| `locations` | Ubicaciones reutilizables |
| `activities` | Actividades dentro de un viaje |
| `travel_requirements` | Requisitos de documentación, salud y moneda por viaje |

La capa de acceso a datos está completamente desacoplada mediante el patrón de inyección de dependencias de NestJS. Si en el futuro se cambia de base de datos, solo es necesario reemplazar los servicios, sin tocar controladores ni lógica de negocio.

## Tests

El proyecto incluye tests unitarios de los módulos más críticos: Auth, Guards, Trips, Activities y Users.

Para ejecutarlos:
```bash
# Ejecutar todos los tests
npm test

# Ejecutar con informe de cobertura
npm run test:cov
```

## Estado del Proyecto e Invitación a Colaborar

Este proyecto nació como el trabajo final del bootcamp de desarrollo Frontend con **Angular**. Actualmente se encuentra en una fase de **desarrollo activo** y mejora continua.

### ¿Quieres contribuir?
¡Cualquier sugerencia o mejora es bienvenida! Si encuentras un bug o tienes una idea para una nueva funcionalidad:
1. Haz un **Fork** del repositorio.
2. Crea una rama para tu mejora (`git checkout -b feature/MejoraIncreible`).
3. Envía un **Pull Request** detallando los cambios.

También puedes abrir un [Issue](https://github.com) para discutir ideas nuevas.

### Licencia
Este proyecto está bajo la **Licencia Apache 2.0**. Para más detalles, consulta el archivo [LICENSE](./LICENSE) en este repositorio.
