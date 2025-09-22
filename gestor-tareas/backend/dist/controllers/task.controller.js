"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTask = exports.updateTask = exports.createTask = exports.getTasks = void 0;
const data_source_1 = require("../config/data-source");
const Task_1 = require("../entities/Task");
const User_1 = require("../entities/User");
const response_1 = require("../utils/response");
const taskRepo = data_source_1.AppDataSource.getRepository(Task_1.Task);
const userRepo = data_source_1.AppDataSource.getRepository(User_1.User);
// 📌 Listar tareas → propietario ve todas, miembro solo las suyas
const getTasks = async (req, res) => {
    try {
        const currentUser = req.user;
        let tasks;
        if (currentUser?.role === "propietario") {
            tasks = await taskRepo.find({ relations: ["user"] });
        }
        else {
            tasks = await taskRepo.find({
                where: { user: { id: currentUser?.id } },
                relations: ["user"],
            });
        }
        (0, response_1.prettyJson)(res, tasks);
    }
    catch (error) {
        (0, response_1.prettyJson)(res, { message: "Error al obtener tareas", error: error.message }, 500);
    }
};
exports.getTasks = getTasks;
// 📌 Crear tarea → propietario puede asignar, miembro solo a sí mismo
const createTask = async (req, res) => {
    try {
        const currentUser = req.user;
        if (!currentUser)
            return (0, response_1.prettyJson)(res, { message: "No autenticado" }, 401);
        // por defecto: el usuario logueado
        let assignedUserId = currentUser.id;
        // si es propietario y manda userId, puede asignar a otro
        if (currentUser.role === "propietario" && req.body.userId != null) {
            assignedUserId = Number(req.body.userId);
        }
        // ✅ Pre-cargar el usuario para evitar `as any` y ambigüedades
        const assignee = await userRepo.findOne({ where: { id: assignedUserId } });
        if (!assignee) {
            return (0, response_1.prettyJson)(res, { message: "Usuario asignado no existe" }, 404);
        }
        // ✅ Usar save() directo evita la sobrecarga Task | Task[]
        const saved = await taskRepo.save({
            ...req.body,
            user: assignee,
        });
        // Recuperar con relaciones
        const savedTask = await taskRepo.findOne({
            where: { id: saved.id },
            relations: ["user"],
        });
        if (!savedTask) {
            return (0, response_1.prettyJson)(res, { message: "Error al recuperar la tarea creada" }, 500);
        }
        (0, response_1.prettyJson)(res, savedTask, 201);
    }
    catch (error) {
        (0, response_1.prettyJson)(res, { message: "Error al crear la tarea", error: error.message }, 400);
    }
};
exports.createTask = createTask;
// 📌 Actualizar tarea → miembro solo sus tareas, propietario cualquiera
const updateTask = async (req, res) => {
    try {
        const currentUser = req.user;
        if (!currentUser)
            return (0, response_1.prettyJson)(res, { message: "No autenticado" }, 401);
        const taskId = Number(req.params.id);
        const task = await taskRepo.findOne({
            where: { id: taskId },
            relations: ["user"],
        });
        if (!task)
            return (0, response_1.prettyJson)(res, { message: "Tarea no encontrada" }, 404);
        // Verificar autorización
        if (currentUser.role !== "propietario" && task.user.id !== currentUser.id) {
            return (0, response_1.prettyJson)(res, { message: "No autorizado" }, 403);
        }
        // Actualizar la tarea
        taskRepo.merge(task, req.body);
        const updatedTask = await taskRepo.save(task);
        (0, response_1.prettyJson)(res, updatedTask);
    }
    catch (error) {
        (0, response_1.prettyJson)(res, { message: "Error al actualizar la tarea", error: error.message }, 400);
    }
};
exports.updateTask = updateTask;
// 📌 Eliminar tarea → miembro solo sus tareas, propietario cualquiera
const deleteTask = async (req, res) => {
    try {
        const currentUser = req.user;
        if (!currentUser)
            return (0, response_1.prettyJson)(res, { message: "No autenticado" }, 401);
        const taskId = Number(req.params.id);
        const task = await taskRepo.findOne({
            where: { id: taskId },
            relations: ["user"],
        });
        if (!task)
            return (0, response_1.prettyJson)(res, { message: "Tarea no encontrada" }, 404);
        // Verificar autorización
        if (currentUser.role !== "propietario" && task.user.id !== currentUser.id) {
            return (0, response_1.prettyJson)(res, { message: "No autorizado" }, 403);
        }
        await taskRepo.remove(task);
        (0, response_1.prettyJson)(res, { message: "Tarea eliminada" });
    }
    catch (error) {
        (0, response_1.prettyJson)(res, { message: "Error al eliminar la tarea", error: error.message }, 500);
    }
};
exports.deleteTask = deleteTask;
