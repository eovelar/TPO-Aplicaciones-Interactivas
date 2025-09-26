import { AppDataSource } from "../config/data-source";
import { Team } from "../entities/Team";
import { User } from "../entities/User";
import { Request, Response } from "express";
import { In } from "typeorm";
import { prettyJson } from "../utils/response";

const teamRepo = AppDataSource.getRepository(Team);
const userRepo = AppDataSource.getRepository(User);

// Crear un equipo → solo propietario
export const createTeam = async (req: Request, res: Response) => {
  try {
    if (req.user?.role !== "propietario") {
      return prettyJson(res, { message: "Solo propietarios pueden crear equipos" }, 403);
    }

    const { name, description, members } = req.body;

    const owner = await userRepo.findOne({ where: { id: req.user.id } });
    if (!owner) {
      return prettyJson(res, { message: "Propietario no encontrado" }, 404);
    }

    const memberEntities = members?.length
      ? await userRepo.findBy({ id: In(members) })
      : [];

    const team = teamRepo.create({
      name,
      description,
      owner,
      members: memberEntities,
    });

    await teamRepo.save(team);
    prettyJson(res, team, 201);
  } catch (error) {
    prettyJson(res, { message: "Error al crear equipo", error: (error as Error).message }, 500);
  }
};

// Listar equipos → propietario ve todos, miembro solo los suyos
export const getTeams = async (req: Request, res: Response) => {
  try {
    let teams;

    if (req.user?.role === "propietario") {
      teams = await teamRepo.find({ relations: ["owner", "members", "tasks"] });
    } else {
      teams = await teamRepo.find({
        where: { members: { id: req.user?.id } },
        relations: ["owner", "members", "tasks"],
      });
    }

    prettyJson(res, teams);
  } catch (error) {
    prettyJson(res, { message: "Error al obtener equipos", error: (error as Error).message }, 500);
  }
};

// Actualizar equipo → solo propietario del equipo
export const updateTeam = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const team = await teamRepo.findOne({ where: { id: Number(id) }, relations: ["owner"] });
    if (!team) return prettyJson(res, { message: "Equipo no encontrado" }, 404);

    if (req.user?.id !== team.owner.id) {
      return prettyJson(res, { message: "Solo el propietario puede actualizar el equipo" }, 403);
    }

    team.name = req.body.name ?? team.name;
    team.description = req.body.description ?? team.description;

    await teamRepo.save(team);
    prettyJson(res, team);
  } catch (error) {
    prettyJson(res, { message: "Error al actualizar equipo", error: (error as Error).message }, 500);
  }
};

// Añadir miembro → solo propietario del equipo
export const addMember = async (req: Request, res: Response) => {
  try {
    const { id } = req.params; // id del equipo
    const { userId } = req.body; // id del usuario a añadir

    const team = await teamRepo.findOne({ where: { id: Number(id) }, relations: ["owner", "members"] });
    if (!team) return prettyJson(res, { message: "Equipo no encontrado" }, 404);

    if (req.user?.id !== team.owner.id) {
      return prettyJson(res, { message: "Solo el propietario del equipo puede añadir miembros" }, 403);
    }

    const user = await userRepo.findOne({ where: { id: Number(userId) } });
    if (!user) return prettyJson(res, { message: "Usuario no encontrado" }, 404);

    if (team.members.some((m) => m.id === user.id)) {
      return prettyJson(res, { message: "El usuario ya es miembro del equipo" }, 400);
    }

    team.members.push(user);
    await teamRepo.save(team);

    prettyJson(res, { message: "Miembro añadido", team });
  } catch (error) {
    prettyJson(res, { message: "Error al añadir miembro", error: (error as Error).message }, 500);
  }
};

// Quitar miembro → solo propietario del equipo
export const removeMember = async (req: Request, res: Response) => {
  try {
    const { id, userId } = req.params; // ambos desde la URL

    const team = await teamRepo.findOne({ where: { id: Number(id) }, relations: ["owner", "members"] });
    if (!team) return prettyJson(res, { message: "Equipo no encontrado" }, 404);

    if (req.user?.id !== team.owner.id) {
      return prettyJson(res, { message: "Solo el propietario del equipo puede quitar miembros" }, 403);
    }

    if (!team.members.some((m) => m.id === Number(userId))) {
      return prettyJson(res, { message: "El usuario no pertenece a este equipo" }, 404);
    }

    team.members = team.members.filter((m) => m.id !== Number(userId));
    await teamRepo.save(team);

    prettyJson(res, { message: "Miembro quitado", team });
  } catch (error) {
    prettyJson(res, { message: "Error al quitar miembro", error: (error as Error).message }, 500);
  }
};

// Eliminar equipo → solo propietario
export const deleteTeam = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const team = await teamRepo.findOne({ where: { id: Number(id) }, relations: ["owner"] });
    if (!team) return prettyJson(res, { message: "Equipo no encontrado" }, 404);

    if (req.user?.id !== team.owner.id) {
      return prettyJson(res, { message: "Solo el propietario puede eliminar el equipo" }, 403);
    }

    await teamRepo.remove(team);
    prettyJson(res, { message: "Equipo eliminado" });
  } catch (error) {
    prettyJson(res, { message: "Error al eliminar equipo", error: (error as Error).message }, 500);
  }
};
