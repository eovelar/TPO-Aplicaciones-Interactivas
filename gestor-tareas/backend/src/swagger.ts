// src/swagger.ts
export const openapi = {
  openapi: "3.0.3",
  info: {
    title: "Gestor de Tareas - API",
    description: "API del TPO (solo Backend): autenticación JWT, usuarios, equipos, tareas, comentarios, historial y estadísticas.",
    version: "1.0.0",
  },
  servers: [
    { url: "http://localhost:4000", description: "Desarrollo local" }
  ],
  components: {
    securitySchemes: {
      bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" }
    },
    schemas: {
      // ==== Tipos base ====
      IdParam: {
        type: "integer",
        minimum: 1,
        example: 1,
      },
      Role: {
        type: "string",
        enum: ["propietario", "miembro"],
        example: "propietario",
      },
      TaskStatus: {
        type: "string",
        enum: ["TODO", "IN_PROGRESS", "DONE", "CANCELLED"],
        example: "TODO",
      },
      SortDir: {
        type: "string",
        enum: ["ASC", "DESC"],
        example: "DESC",
      },
      ErrorResponse: {
        type: "object",
        properties: {
          message: { type: "string" },
          errors: { type: "array", items: { type: "string" } }
        }
      },

      // ==== Auth ====
      AuthLoginRequest: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: { type: "string", format: "email", example: "admin@example.com" },
          password: { type: "string", example: "admin123" }
        }
      },
      AuthLoginResponse: {
        type: "object",
        properties: {
          token: { type: "string", example: "eyJhbGciOi..." },
          user: {
            type: "object",
            properties: {
              id: { $ref: "#/components/schemas/IdParam" },
              email: { type: "string", example: "admin@example.com" },
              role: { $ref: "#/components/schemas/Role" }
            }
          }
        }
      },

      // ==== Entidades ====
      User: {
        type: "object",
        properties: {
          id: { $ref: "#/components/schemas/IdParam" },
          email: { type: "string", format: "email" },
          role: { $ref: "#/components/schemas/Role" },
          createdAt: { type: "string", format: "date-time" }
        }
      },
      Team: {
        type: "object",
        properties: {
          id: { $ref: "#/components/schemas/IdParam" },
          nombre: { type: "string" },
          createdAt: { type: "string", format: "date-time" }
        }
      },
      Task: {
        type: "object",
        properties: {
          id: { $ref: "#/components/schemas/IdParam" },
          titulo: { type: "string" },
          descripcion: { type: "string" },
          estado: { $ref: "#/components/schemas/TaskStatus" },
          prioridad: { type: "string", example: "ALTA" },
          fechaLimite: { type: "string", format: "date-time", nullable: true },
          teamId: { type: "integer", nullable: true },
          assignedToId: { type: "integer", nullable: true },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" }
        }
      },
      Comment: {
        type: "object",
        properties: {
          id: { $ref: "#/components/schemas/IdParam" },
          taskId: { type: "integer" },
          userId: { type: "integer" },
          contenido: { type: "string" },
          createdAt: { type: "string", format: "date-time" }
        }
      },
      Historial: {
        type: "object",
        properties: {
          id: { $ref: "#/components/schemas/IdParam" },
          entidad: { type: "string", example: "Task" },
          entidadId: { type: "integer", example: 12 },
          accion: { type: "string", example: "ACTUALIZAR" },
          usuarioId: { type: "integer", example: 1 },
          fecha: { type: "string", format: "date-time" },
          detalles: { type: "object", additionalProperties: true }
        }
      },

      // ==== Requests ====
      CreateUserRequest: {
        type: "object",
        required: ["email", "password", "role"],
        properties: {
          email: { type: "string", format: "email" },
          password: { type: "string", minLength: 6 },
          role: { $ref: "#/components/schemas/Role" }
        }
      },
      CreateTeamRequest: {
        type: "object",
        required: ["nombre"],
        properties: { nombre: { type: "string" } }
      },
      CreateTaskRequest: {
        type: "object",
        required: ["titulo"],
        properties: {
          titulo: { type: "string" },
          descripcion: { type: "string" },
          estado: { $ref: "#/components/schemas/TaskStatus" },
          prioridad: { type: "string" },
          fechaLimite: { type: "string", format: "date-time", nullable: true },
          teamId: { type: "integer", nullable: true },
          assignedToId: { type: "integer", nullable: true }
        }
      },
      UpdateTaskRequest: {
        type: "object",
        properties: {
          titulo: { type: "string" },
          descripcion: { type: "string" },
          estado: { $ref: "#/components/schemas/TaskStatus" },
          prioridad: { type: "string" },
          fechaLimite: { type: "string", format: "date-time", nullable: true },
          teamId: { type: "integer", nullable: true },
          assignedToId: { type: "integer", nullable: true }
        }
      },
      CreateCommentRequest: {
        type: "object",
        required: ["contenido"],
        properties: { contenido: { type: "string", minLength: 1, maxLength: 2000 } }
      },

      // ==== Respuestas paginadas ====
      ListTasksResponse: {
        type: "object",
        properties: {
          total: { type: "integer" },
          limit: { type: "integer" },
          offset: { type: "integer" },
          items: { type: "array", items: { $ref: "#/components/schemas/Task" } }
        }
      },
      ListUsersResponse: {
        type: "object",
        properties: {
          total: { type: "integer" },
          limit: { type: "integer" },
          offset: { type: "integer" },
          items: { type: "array", items: { $ref: "#/components/schemas/User" } }
        }
      },
      ListTeamsResponse: {
        type: "object",
        properties: {
          total: { type: "integer" },
          limit: { type: "integer" },
          offset: { type: "integer" },
          items: { type: "array", items: { $ref: "#/components/schemas/Team" } }
        }
      },
      ListCommentsResponse: {
        type: "object",
        properties: {
          total: { type: "integer" },
          limit: { type: "integer" },
          offset: { type: "integer" },
          items: { type: "array", items: { $ref: "#/components/schemas/Comment" } }
        }
      },
      ListHistorialResponse: {
        type: "object",
        properties: {
          total: { type: "integer" },
          limit: { type: "integer" },
          offset: { type: "integer" },
          items: { type: "array", items: { $ref: "#/components/schemas/Historial" } }
        }
      },

      // ==== Stats ====
      StatsResponse: {
        type: "object",
        properties: {
          porEstado: {
            type: "array",
            items: {
              type: "object",
              properties: { estado: { type: "string" }, total: { type: "integer" } }
            }
          },
          porEquipo: {
            type: "array",
            items: {
              type: "object",
              properties: { teamId: { type: "integer", nullable: true }, total: { type: "integer" } }
            }
          },
          porDia: {
            type: "array",
            items: {
              type: "object",
              properties: { dia: { type: "string", format: "date" }, total: { type: "integer" } }
            }
          }
        }
      }
    }
  },

  security: [{ bearerAuth: [] }],

  paths: {
    // ==== Auth ====
    "/api/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Login",
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/AuthLoginRequest" } } }
        },
        responses: {
          "200": { description: "OK", content: { "application/json": { schema: { $ref: "#/components/schemas/AuthLoginResponse" } } } },
          "401": { description: "Credenciales inválidas", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } }
        },
        security: [] // público
      }
    },

    // ==== Users ====
    "/api/users": {
      get: {
        tags: ["Users"],
        summary: "Listar usuarios",
        parameters: [
          { name: "limit", in: "query", schema: { type: "integer", minimum: 1, maximum: 100 }, required: false },
          { name: "offset", in: "query", schema: { type: "integer", minimum: 0 }, required: false },
          { name: "q", in: "query", schema: { type: "string" }, required: false }
        ],
        responses: {
          "200": { description: "OK", content: { "application/json": { schema: { $ref: "#/components/schemas/ListUsersResponse" } } } }
        }
      },
      post: {
        tags: ["Users"],
        summary: "Crear usuario (solo propietario)",
        requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/CreateUserRequest" } } } },
        responses: {
          "201": { description: "Creado", content: { "application/json": { schema: { $ref: "#/components/schemas/User" } } } },
          "403": { description: "No autorizado", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } }
        }
      }
    },

    // ==== Teams ====
    "/api/teams": {
      get: {
        tags: ["Teams"],
        summary: "Listar equipos",
        parameters: [
          { name: "limit", in: "query", schema: { type: "integer", minimum: 1, maximum: 100 } },
          { name: "offset", in: "query", schema: { type: "integer", minimum: 0 } }
        ],
        responses: {
          "200": { description: "OK", content: { "application/json": { schema: { $ref: "#/components/schemas/ListTeamsResponse" } } } }
        }
      },
      post: {
        tags: ["Teams"],
        summary: "Crear equipo (solo propietario)",
        requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/CreateTeamRequest" } } } },
        responses: {
          "201": { description: "Creado", content: { "application/json": { schema: { $ref: "#/components/schemas/Team" } } } },
          "403": { description: "No autorizado", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } }
        }
      }
    },

    // ==== Tasks ====
    "/api/tasks": {
      get: {
        tags: ["Tasks"],
        summary: "Listar tareas (con filtros, orden y paginación)",
        parameters: [
          { name: "estado", in: "query", schema: { $ref: "#/components/schemas/TaskStatus" } },
          { name: "prioridad", in: "query", schema: { type: "string" } },
          { name: "fechaLimiteDesde", in: "query", schema: { type: "string", format: "date-time" } },
          { name: "fechaLimiteHasta", in: "query", schema: { type: "string", format: "date-time" } },
          { name: "q", in: "query", schema: { type: "string", description: "búsqueda por título/descr." } },
          { name: "asignadoA", in: "query", schema: { type: "integer" } },
          { name: "teamId", in: "query", schema: { type: "integer" } },
          { name: "sortBy", in: "query", schema: { type: "string", example: "createdAt" } },
          { name: "sortDir", in: "query", schema: { $ref: "#/components/schemas/SortDir" } },
          { name: "limit", in: "query", schema: { type: "integer", minimum: 1, maximum: 100 } },
          { name: "offset", in: "query", schema: { type: "integer", minimum: 0 } }
        ],
        responses: {
          "200": { description: "OK", content: { "application/json": { schema: { $ref: "#/components/schemas/ListTasksResponse" } } } }
        }
      },
      post: {
        tags: ["Tasks"],
        summary: "Crear tarea",
        requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/CreateTaskRequest" } } } },
        responses: {
          "201": { description: "Creada", content: { "application/json": { schema: { $ref: "#/components/schemas/Task" } } } },
          "422": { description: "Validación", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } }
        }
      }
    },
    "/api/tasks/{id}": {
      put: {
        tags: ["Tasks"],
        summary: "Actualizar tarea",
        parameters: [{ name: "id", in: "path", required: true, schema: { $ref: "#/components/schemas/IdParam" } }],
        requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/UpdateTaskRequest" } } } },
        responses: {
          "200": { description: "OK", content: { "application/json": { schema: { $ref: "#/components/schemas/Task" } } } },
          "404": { description: "No encontrada" }
        }
      },
      delete: {
        tags: ["Tasks"],
        summary: "Eliminar tarea",
        parameters: [{ name: "id", in: "path", required: true, schema: { $ref: "#/components/schemas/IdParam" } }],
        responses: { "204": { description: "Sin contenido" }, "404": { description: "No encontrada" } }
      }
    },

    // ==== Comments ====
    "/api/tasks/{taskId}/comments": {
      get: {
        tags: ["Comments"],
        summary: "Listar comentarios de una tarea",
        parameters: [
          { name: "taskId", in: "path", required: true, schema: { $ref: "#/components/schemas/IdParam" } },
          { name: "limit", in: "query", schema: { type: "integer", minimum: 1, maximum: 100 } },
          { name: "offset", in: "query", schema: { type: "integer", minimum: 0 } }
        ],
        responses: {
          "200": { description: "OK", content: { "application/json": { schema: { $ref: "#/components/schemas/ListCommentsResponse" } } } },
          "404": { description: "Tarea no encontrada" }
        }
      },
      post: {
        tags: ["Comments"],
        summary: "Crear comentario en una tarea",
        parameters: [
          { name: "taskId", in: "path", required: true, schema: { $ref: "#/components/schemas/IdParam" } }
        ],
        requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/CreateCommentRequest" } } } },
        responses: {
          "201": { description: "Creado", content: { "application/json": { schema: { $ref: "#/components/schemas/Comment" } } } },
          "404": { description: "Tarea no encontrada" },
          "422": { description: "Validación" }
        }
      }
    },
    "/api/comments/{id}": {
      delete: {
        tags: ["Comments"],
        summary: "Eliminar comentario (autor o propietario)",
        parameters: [{ name: "id", in: "path", required: true, schema: { $ref: "#/components/schemas/IdParam" } }],
        responses: { "204": { description: "Sin contenido" }, "403": { description: "No autorizado" }, "404": { description: "No encontrado" } }
      }
    },

    // ==== Historial ====
    "/api/historial": {
      get: {
        tags: ["Historial"],
        summary: "Listar historial",
        parameters: [
          { name: "entidad", in: "query", schema: { type: "string", example: "Task" } },
          { name: "entidadId", in: "query", schema: { type: "integer" } },
          { name: "usuarioId", in: "query", schema: { type: "integer" } },
          { name: "accion", in: "query", schema: { type: "string", example: "ACTUALIZAR" } },
          { name: "desde", in: "query", schema: { type: "string", format: "date-time" } },
          { name: "hasta", in: "query", schema: { type: "string", format: "date-time" } },
          { name: "limit", in: "query", schema: { type: "integer", minimum: 1, maximum: 100 } },
          { name: "offset", in: "query", schema: { type: "integer", minimum: 0 } }
        ],
        responses: {
          "200": { description: "OK", content: { "application/json": { schema: { $ref: "#/components/schemas/ListHistorialResponse" } } } }
        }
      }
    },

    // ==== Stats ====
    "/api/stats": {
      get: {
        tags: ["Stats"],
        summary: "Estadísticas (solo propietario)",
        parameters: [
          { name: "desde", in: "query", schema: { type: "string", format: "date-time" } },
          { name: "hasta", in: "query", schema: { type: "string", format: "date-time" } }
        ],
        responses: {
          "200": { description: "OK", content: { "application/json": { schema: { $ref: "#/components/schemas/StatsResponse" } } } },
          "403": { description: "No autorizado" }
        }
      }
    }
  },

  tags: [
    { name: "Auth" },
    { name: "Users" },
    { name: "Teams" },
    { name: "Tasks" },
    { name: "Comments" },
    { name: "Historial" },
    { name: "Stats" }
  ]
} as const;
