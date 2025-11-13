# Focusin – Gestor de Tareas

Sistema completo de gestión de tareas y equipos, desarrollado con **React + TypeScript + Tailwind**, **Node.js + Express**, **TypeORM**, y **PostgreSQL**.  
Incluye asignación de tareas, roles de usuario, gestión de equipos, historial de cambios y una interfaz moderna y responsiva.

---

## 🚀 Descripción del Proyecto

**Focusin** es una aplicación web diseñada para organizar tareas dentro de equipos de trabajo.  
Permite crear, editar, asignar y completar tareas, además de administrar equipos con miembros y ver todas las tareas relacionadas.  
El sistema está dividido en un **backend REST** y un **frontend interactivo**, formando una arquitectura completa y escalable.

---

## 🛠️ Tecnologías Utilizadas

### **Frontend**
- React + Vite  
- TypeScript  
- TailwindCSS  
- React Router DOM  
- Axios  

### **Backend**
- Node.js + Express  
- TypeORM  
- PostgreSQL  
- Middlewares personalizados  
- Controladores por módulo

### **Base de Datos**
- PostgreSQL  
- Relaciones Many-to-One / Many-to-Many  
- Tablas:
  - `users`
  - `tasks`
  - `teams`
  - `team_members`
  - `historial` (auditoría)

---

## 📌 Funcionalidades Principales

### 🔐 Autenticación simple
- Login por email y contraseña  
- Autorización mediante headers:
  - `x-user-id`
  - `x-user-role`
  - `x-user-email`  
- Roles disponibles:
  - **Propietario (Admin)**
  - **Miembro**

---

### 📝 Gestión de Tareas
- Crear, editar, completar y eliminar tareas  
- Asignar tareas a miembros  
- Filtros avanzados:
  - Estado  
  - Prioridad  
  - Búsqueda  
- Opción **Mis tareas / Todas**  
- Fecha límite obligatoria  
- Validación de fechas pasadas  
- Etiquetas de prioridad y estado con colores  
- Historial detallado de acciones

---

### 👥 Gestión de Equipos
- Crear equipos  
- Agregar descripción  
- Ver detalles completos del equipo  
- Invitar miembros por email  
- Quitar miembros  
- Ver tareas asignadas al equipo  
- Vista individual `/teams/:id`

---

### 📊 Auditoría (Historial)
Cada modificación genera un registro con:
- Datos previos y nuevos  
- Fecha y hora  
- Usuario que realizó el cambio  
- Acción (CREAR, ACTUALIZAR, ELIMINAR)

---

## 📂 Estructura del Proyecto

### **Backend**

## 📦 Instalación de dependencias
```bash
cd backend
npm install

## 🔧 Archivo `.env`
DB_USER=postgres DB_PASSWORD=1234 DB_NAME=gestor_tareas DB_HOST=localhost DB_PORT=5432
## 🛠 Ejecutar migraciones
bash npm run migration:run
## 🚀 Iniciar servidor
bash npm run dev
Backend disponible en: **[http://localhost:4000](http://localhost:4000)**

---

# 💻 Frontend

## 📦 Instalación
bash cd frontend npm install
## 🚀 Ejecutar aplicación
bash npm run dev
Frontend disponible en: **[http://localhost:5173](http://localhost:5173)**

---

# 🔌 Endpoints Principales

## 🔐 Auth

| Método | Ruta             | Descripción       |
| ------ | ---------------- | ----------------- |
| POST   | `/auth/register` | Registrar usuario |
| POST   | `/auth/login`    | Iniciar sesión    |
| DELETE | `/auth/user/:id` | Eliminar usuario  |

---

## 📝 Tasks

| Método | Ruta         | Descripción    |
| ------ | ------------ | -------------- |
| GET    | `/tasks`     | Listar tareas  |
| POST   | `/tasks`     | Crear tarea    |
| PUT    | `/tasks/:id` | Editar tarea   |
| DELETE | `/tasks/:id` | Eliminar tarea |

---

## 👥 Teams

| Método | Ruta                         | Descripción     |
| ------ | ---------------------------- | --------------- |
| GET    | `/teams`                     | Listar equipos  |
| POST   | `/teams`                     | Crear equipo    |
| PUT    | `/teams/:id`                 | Editar equipo   |
| DELETE | `/teams/:id`                 | Eliminar equipo |
| POST   | `/teams/:id/invite`          | Invitar miembro |
| DELETE | `/teams/:id/members/:userId` | Quitar miembro  |

---

# 🧱 Modelos (Entities)

## 👤 User

* id
* name
* email
* password
* role (`propietario` | `miembro`)
* tasks creadas
* assignedTasks
* teams (many-to-many)

---

## 📝 Task

* id
* title
* description
* priority (`alta`, `media`, `baja`)
* status
* fecha_limite
* user (creador)
* assignedTo (destinatario)

---

## 👥 Team

* id
* name
* description
* owner
* members (many-to-many)

---

## 📊 Historial

* id
* entidad
* entidadId
* accion
* usuarioId
* detalles (JSON antes/después)

---

# 🖼 Vista del Sistema

Incluye:

* Login
* Registro
* Dashboard de tareas
* Crear/editar tarea
* Filtros avanzados
* Vista “Mis tareas / Todas”
* Equipos en tarjetas
* Vista detallada del equipo con:

  * descripción
  * miembros
  * tareas asignadas

---

# Roadmap

* CRUD de tareas
* CRUD de equipos
* Filtros y búsqueda
* Roles
* Auditoría
* Mis tareas
* Vista detallada de equipo
* Invitación y remoción de miembros

