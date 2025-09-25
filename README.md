# TPO-Aplicaciones-Interactivas
Trabajo Práctico Integrador - Gestión de Tareas Colaborativas.

# Gestor de Tareas – Backend

Proyecto desarrollado en **Node.js + Express + TypeScript**,que implementa un sistema de gestión de usuarios y tareas con conexión a **PostgreSQL** y autenticación mediante **JWT**.


## 🚀 Tecnologías usadas

- Node.js + Express
- TypeScript
- TypeORM
- PostgreSQL
- JWT (jsonwebtoken)
- dotenv
- bcrypt

## 📋 Prerrequisitos

Asegurate de tener instalado:

* **Node.js** >= 18 LTS (incluye `npm`).
* **PostgreSQL** >= 13 (con un usuario/password válidos y una base creada o permisos para crearla).
* **Git** (opcional, para clonar el repo).
* **OpenSSL** (opcional, para generar claves seguras si lo necesitás).

> Verificá versiones:
>
> ```bash
> node -v
> npm -v
> psql --version
> ```

---

## 🚀 Instalación

Cloná el repositorio y cargá dependencias:

```bash
# 1) Clonar
git clone <URL-del-repo>
cd <carpeta-del-repo>/gestor-tareas/backend

# 2) Instalar dependencias
npm install

# 3) Crear .env
cp .env.example .env  # si existe .env.example
# o crea el .env manualmente con el contenido de arriba
```

---

## ▶️ Modos de ejecución

### Desarrollo (hot reload)

Si el proyecto incluye `ts-node-dev`/`nodemon`, podés correr:

```bash
npm run dev
```

* Compila en memoria y reinicia al detectar cambios.
* Ideal para trabajar desde VS Code.

### Producción / Ejecución desde JavaScript compilado

Primero **compilá** TypeScript a JavaScript y luego ejecutá `dist/`:

```bash
npm run build   # compila a ./dist
npm start       # ejecuta: node dist/index.js
```

> Si al hacer `npm start` ves logs como `✅ Conectado a PostgreSQL` y `🚀 Server escuchando en puerto 4000`, la API está arriba.

---

> Si devuelve Error: listen EADDRINUSE: address already in use :::4000

```powershell
Stop-Process -Id (Get-NetTCPConnection -LocalPort 4000).OwningProcess -Force
```


## 🧩 Migraciones y Seeds (TypeORM)

> Si el proyecto usa **TypeORM** con DataSource (por ej. `src/data-source.ts`), podés trabajar migraciones así (nombres y paths a modo de ejemplo):

**Generar una migración**

```bash
npm run typeorm -- migration:generate -d src/data-source.ts src/migrations/InitSchema
```

**Crear una migración vacía**

```bash
npm run typeorm -- migration:create src/migrations/AddSomeTable
```

**Aplicar migraciones**

```bash
npm run typeorm -- migration:run -d src/data-source.ts
```

**Revertir la última**

```bash
npm run typeorm -- migration:revert -d src/data-source.ts
```

**Seeds (si existen)**

```bash
# ejemplo, si tenés un script dedicado
npm run seed
```

> Asegurate de que la configuración de TypeORM lea tu `.env` y apunte a la misma base.

---

## 🧭 Estructura del proyecto (real)

```txt
backend/
├─ src/
│  ├─ controllers/          # controladores Express
│  ├─ entities/             # entidades TypeORM (Task, Team, User, comment.entities, historial.entities)
│  ├─ middleware/           # auth, role, error, validate, request-context
│  ├─ migrations/           # migraciones TypeORM
│  ├─ routes/               # admin.routes, auth.routes, comment.routes, historial.routes, task.routes, team.routes, user.routes
│  ├─ schemas/              # (si usás Joi/Zod para validaciones)
│  ├─ subscribers/          # (listeners de TypeORM si aplica)
│  ├─ types/                # tipos globales/augmentations
│  ├─ utils/                # helpers
│  ├─ validations/          # validaciones específicas
│  ├─ index.ts              # punto de entrada del servidor
│  ├─ seed.ts               # script de seeds
│  └─ swagger.ts            # definición/servidor de Swagger
├─ .env
├─ tsconfig.json
├─ package.json
└─ README.md
```

---

## 📡 Endpoints y pruebas rápidas (cURL)

> Base por defecto (ajustá el puerto si cambia):

```bash
URL_BASE=http://localhost:4000
```

### Auth

* `POST /api/auth/register`
* `POST /api/auth/login`

**Registrar un nuevo usuario** (ejemplo):

```bash
curl -s -X POST "http://localhost:4000/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "New User",
    "email": "new.user@example.com",
    "password": "123456",
    "role": "miembro"
  }'
```


**Login** (ejemplo):

```bash
curl -s -X POST "http://localhost:4000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"admin123"}'
```

Guarda el token:

```bash
TOKEN="eyJhbGciOi..."  # reemplazar por el devuelto
```

### Users

```bash
curl -s -X GET "http://localhost:4000/api/users" \
  -H "Authorization: Bearer $TOKEN" \
```

* `GET /api/users` (según roles)
* `GET /api/users/:id`
* `POST /api/users`
* `PUT /api/users/:id`
* `DELETE /api/users/:id`

### Teams

**Ver listado de grupos**

```bash
curl -s -X GET "http://localhost:4000/api/groups" \
  -H "Authorization: Bearer $TOKEN"
```
**Crear grupo**

```bash
curl -s -X POST "http://localhost:4000/api/groups" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Backend Team",
    "description": "All backend developers"
  }'
```

* `GET /api/teams`
* `POST /api/teams`
* `PUT /api/teams/:id`
* `DELETE /api/teams/:id`

### Tasks

* `GET /api/tasks`
* `POST /api/tasks`
* `PUT /api/tasks/:id`
* `DELETE /api/tasks/:id`

**Crear tarea (ejemplo)**

```bash
curl -s -X POST "http://localhost:4000/api/tasks" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"titulo":"Primera tarea","descripcion":"Ejemplo","estado":"pendiente"}'
```
**Ver el listado de tareas**

```bash
curl -s -X GET "http://localhost:4000/api/tasks" \
  -H "Authorization: Bearer $TOKEN"
```

### Comments

* `GET /api/comments`
* `POST /api/comments`
* `PUT /api/comments/:id`
* `DELETE /api/comments/:id`

### Historial

* `GET /api/historial`

### Admin

* Endpoints bajo `/api/admin` si corresponde (gestión avanzada, sólo `propietario`).

> Los middlewares **auth** y **role** ya existen (`auth.middleware.ts`, `role.middleware.ts`). Recordá enviar `Authorization: Bearer <token>` y setear los roles requeridos en cada ruta.

---

## 🧪 Documentación Swagger / Colecciones

* Tenés `src/swagger.ts`. Si lo estás exponiendo, suele montarse en `GET /api/docs` o `/docs`. Probá:

  * `http://localhost:4000/api/docs`
  * `http://localhost:4000/docs`
* Si preferís Postman/Insomnia, exportá la colección y linkeala aquí.

---

## 🧰 Integración con VS Code

**Extensiones recomendadas**

* ESLint / Prettier (formato y calidad de código)
* EditorConfig (consistencia)
* DotENV
* REST Client (para testear APIs desde VS Code)

**Depurar en VS Code (launch.json ejemplo)**

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Dev: ts-node",
      "runtimeExecutable": "node",
      "runtimeArgs": ["-r", "ts-node/register", "src/index.ts"],
      "envFile": "${workspaceFolder}/.env",
      "cwd": "${workspaceFolder}",
      "skipFiles": ["<node_internals>/**", "**/node_modules/**"]
    }
  ]
}
```

## 🛠️ Solución de problemas

* **`npm: command not found`**: instalá Node.js (incluye npm) y reabrí la terminal.
* **`ECONNREFUSED`/`connect ENOENT` a PostgreSQL**: verifica `DB_HOST`, `DB_PORT`, credenciales y que el servicio esté arriba (`pg_isready`).
* **`role "postgres" does not exist`**: crea el usuario o ajustá `DB_USER`.
* **No compila TypeScript**: corré `npm run build` y revisá errores del `tsc`. Confirmá rutas en `tsconfig.json`.
* **`Error: listen EADDRINUSE :4000`**: el puerto está en uso. Cerrá el proceso o cambiá `PORT` en `.env`.
* **Variables de entorno no cargan**: confirmá que `dotenv` se ejecute antes que el resto en tu `index.ts`.