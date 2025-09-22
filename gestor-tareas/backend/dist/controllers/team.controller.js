"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTeam = exports.removeMember = exports.addMember = exports.updateTeam = exports.getTeams = exports.createTeam = void 0;
const data_source_1 = require("../config/data-source");
const Team_1 = require("../entities/Team");
const User_1 = require("../entities/User");
const typeorm_1 = require("typeorm");
const response_1 = require("../utils/response");
const teamRepo = data_source_1.AppDataSource.getRepository(Team_1.Team);
const userRepo = data_source_1.AppDataSource.getRepository(User_1.User);
// 📌 Crear un equipo → solo propietario
const createTeam = async (req, res) => {
    try {
        if (req.user?.role !== "propietario") {
            return (0, response_1.prettyJson)(res, { message: "Solo propietarios pueden crear equipos" }, 403);
        }
        const { name, description, members } = req.body;
        const owner = await userRepo.findOne({ where: { id: req.user.id } });
        if (!owner) {
            return (0, response_1.prettyJson)(res, { message: "Propietario no encontrado" }, 404);
        }
        const memberEntities = members?.length
            ? await userRepo.findBy({ id: (0, typeorm_1.In)(members) })
            : [];
        const team = teamRepo.create({
            name,
            description,
            owner,
            members: memberEntities,
        });
        await teamRepo.save(team);
        (0, response_1.prettyJson)(res, team, 201);
    }
    catch (error) {
        (0, response_1.prettyJson)(res, { message: "Error al crear equipo", error: error.message }, 500);
    }
};
exports.createTeam = createTeam;
// 📌 Listar equipos → propietario ve todos, miembro solo los suyos
const getTeams = async (req, res) => {
    try {
        let teams;
        if (req.user?.role === "propietario") {
            teams = await teamRepo.find({ relations: ["owner", "members", "tasks"] });
        }
        else {
            teams = await teamRepo.find({
                where: { members: { id: req.user?.id } },
                relations: ["owner", "members", "tasks"],
            });
        }
        (0, response_1.prettyJson)(res, teams);
    }
    catch (error) {
        (0, response_1.prettyJson)(res, { message: "Error al obtener equipos", error: error.message }, 500);
    }
};
exports.getTeams = getTeams;
// 📌 Actualizar equipo → solo propietario del equipo
const updateTeam = async (req, res) => {
    try {
        const { id } = req.params;
        const team = await teamRepo.findOne({ where: { id: Number(id) }, relations: ["owner"] });
        if (!team)
            return (0, response_1.prettyJson)(res, { message: "Equipo no encontrado" }, 404);
        if (req.user?.id !== team.owner.id) {
            return (0, response_1.prettyJson)(res, { message: "Solo el propietario puede actualizar el equipo" }, 403);
        }
        team.name = req.body.name ?? team.name;
        team.description = req.body.description ?? team.description;
        await teamRepo.save(team);
        (0, response_1.prettyJson)(res, team);
    }
    catch (error) {
        (0, response_1.prettyJson)(res, { message: "Error al actualizar equipo", error: error.message }, 500);
    }
};
exports.updateTeam = updateTeam;
// 📌 Añadir miembro → solo propietario del equipo
const addMember = async (req, res) => {
    try {
        const { id } = req.params; // id del equipo
        const { userId } = req.body; // id del usuario a añadir
        const team = await teamRepo.findOne({ where: { id: Number(id) }, relations: ["owner", "members"] });
        if (!team)
            return (0, response_1.prettyJson)(res, { message: "Equipo no encontrado" }, 404);
        if (req.user?.id !== team.owner.id) {
            return (0, response_1.prettyJson)(res, { message: "Solo el propietario del equipo puede añadir miembros" }, 403);
        }
        const user = await userRepo.findOne({ where: { id: Number(userId) } });
        if (!user)
            return (0, response_1.prettyJson)(res, { message: "Usuario no encontrado" }, 404);
        if (team.members.some((m) => m.id === user.id)) {
            return (0, response_1.prettyJson)(res, { message: "El usuario ya es miembro del equipo" }, 400);
        }
        team.members.push(user);
        await teamRepo.save(team);
        (0, response_1.prettyJson)(res, { message: "Miembro añadido", team });
    }
    catch (error) {
        (0, response_1.prettyJson)(res, { message: "Error al añadir miembro", error: error.message }, 500);
    }
};
exports.addMember = addMember;
// 📌 Quitar miembro → solo propietario del equipo
const removeMember = async (req, res) => {
    try {
        const { id, userId } = req.params; // ambos desde la URL
        const team = await teamRepo.findOne({ where: { id: Number(id) }, relations: ["owner", "members"] });
        if (!team)
            return (0, response_1.prettyJson)(res, { message: "Equipo no encontrado" }, 404);
        if (req.user?.id !== team.owner.id) {
            return (0, response_1.prettyJson)(res, { message: "Solo el propietario del equipo puede quitar miembros" }, 403);
        }
        if (!team.members.some((m) => m.id === Number(userId))) {
            return (0, response_1.prettyJson)(res, { message: "El usuario no pertenece a este equipo" }, 404);
        }
        team.members = team.members.filter((m) => m.id !== Number(userId));
        await teamRepo.save(team);
        (0, response_1.prettyJson)(res, { message: "Miembro quitado", team });
    }
    catch (error) {
        (0, response_1.prettyJson)(res, { message: "Error al quitar miembro", error: error.message }, 500);
    }
};
exports.removeMember = removeMember;
// 📌 Eliminar equipo → solo propietario
const deleteTeam = async (req, res) => {
    try {
        const { id } = req.params;
        const team = await teamRepo.findOne({ where: { id: Number(id) }, relations: ["owner"] });
        if (!team)
            return (0, response_1.prettyJson)(res, { message: "Equipo no encontrado" }, 404);
        if (req.user?.id !== team.owner.id) {
            return (0, response_1.prettyJson)(res, { message: "Solo el propietario puede eliminar el equipo" }, 403);
        }
        await teamRepo.remove(team);
        (0, response_1.prettyJson)(res, { message: "Equipo eliminado" });
    }
    catch (error) {
        (0, response_1.prettyJson)(res, { message: "Error al eliminar equipo", error: error.message }, 500);
    }
};
exports.deleteTeam = deleteTeam;
