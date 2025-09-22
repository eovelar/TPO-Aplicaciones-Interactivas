"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUser = exports.deleteUser = exports.getUserById = exports.getUsers = void 0;
const data_source_1 = require("../config/data-source");
const User_1 = require("../entities/User");
const response_1 = require("../utils/response");
const userRepo = data_source_1.AppDataSource.getRepository(User_1.User);
// 📌 Listar todos los usuarios → solo propietario
const getUsers = async (req, res) => {
    try {
        if (req.user?.role !== "propietario") {
            return (0, response_1.prettyJson)(res, { message: "Solo propietarios pueden ver usuarios" }, 403);
        }
        const users = await userRepo.find();
        (0, response_1.prettyJson)(res, users);
    }
    catch (error) {
        (0, response_1.prettyJson)(res, { message: "Error al obtener usuarios", error: error.message }, 500);
    }
};
exports.getUsers = getUsers;
// 📌 Obtener un usuario por id → solo propietario
const getUserById = async (req, res) => {
    try {
        if (req.user?.role !== "propietario") {
            return (0, response_1.prettyJson)(res, { message: "Solo propietarios pueden ver usuarios" }, 403);
        }
        const { id } = req.params;
        const user = await userRepo.findOne({ where: { id: Number(id) } });
        if (!user)
            return (0, response_1.prettyJson)(res, { message: "Usuario no encontrado" }, 404);
        (0, response_1.prettyJson)(res, user);
    }
    catch (error) {
        (0, response_1.prettyJson)(res, { message: "Error al obtener usuario", error: error.message }, 500);
    }
};
exports.getUserById = getUserById;
// 📌 Eliminar un usuario → solo propietario
const deleteUser = async (req, res) => {
    try {
        if (req.user?.role !== "propietario") {
            return (0, response_1.prettyJson)(res, { message: "Solo propietarios pueden eliminar usuarios" }, 403);
        }
        const { id } = req.params;
        const user = await userRepo.findOne({ where: { id: Number(id) } });
        if (!user)
            return (0, response_1.prettyJson)(res, { message: "Usuario no encontrado" }, 404);
        await userRepo.remove(user);
        (0, response_1.prettyJson)(res, { message: "Usuario eliminado" });
    }
    catch (error) {
        (0, response_1.prettyJson)(res, { message: "Error al eliminar usuario", error: error.message }, 500);
    }
};
exports.deleteUser = deleteUser;
// 📌 Actualizar datos de un usuario → solo propietario
const updateUser = async (req, res) => {
    try {
        if (req.user?.role !== "propietario") {
            return (0, response_1.prettyJson)(res, { message: "Solo propietarios pueden actualizar usuarios" }, 403);
        }
        const { id } = req.params;
        const user = await userRepo.findOne({ where: { id: Number(id) } });
        if (!user)
            return (0, response_1.prettyJson)(res, { message: "Usuario no encontrado" }, 404);
        user.name = req.body.name ?? user.name;
        user.email = req.body.email ?? user.email;
        user.role = req.body.role ?? user.role;
        await userRepo.save(user);
        (0, response_1.prettyJson)(res, { message: "Usuario actualizado", user });
    }
    catch (error) {
        (0, response_1.prettyJson)(res, { message: "Error al actualizar usuario", error: error.message }, 500);
    }
};
exports.updateUser = updateUser;
