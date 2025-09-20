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


## Instalar dependencias:
- npm install 

## ✅ Estado actual

- Configuración de proyecto con **Express** y **TypeORM**  
- Conexión a **PostgreSQL** (ok, usando variables de entorno)  
- Registro y **login de usuarios** con hash de contraseñas (**bcrypt**)  
- Generación y validación de **token JWT**  
- Endpoint protegido: `/profile` con middleware `authRequired`  
- **CRUD de tareas** implementado (con validación de permisos según rol)  
- Middleware de **validación de datos** usando Joi  
- Tipado de `req.user` extendido en Express  
- Entidad **Team** creada con relaciones a usuarios y tareas *(pendiente implementar controladores y rutas)*  
- Uso de `.env` para configuración sensible  

## ⚠️ Pendiente

- Implementar controladores y rutas para **Team** (crear equipos, agregar miembros, listar tareas de un equipo).  
- Evaluar uso de **migraciones TypeORM** en lugar de `synchronize: true`.  
- Validaciones adicionales en `Task` (status y priority como enums).  
- Tests de endpoints con **Postman/Thunder Client**.  


