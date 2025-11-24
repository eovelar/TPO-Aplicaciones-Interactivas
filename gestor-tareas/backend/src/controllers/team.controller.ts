import { AppDataSource } from "../config/data-source";
import { Team } from "../entities/Team";
import { User } from "../entities/User";
import { Request, Response } from "express";
import { In } from "typeorm";
import { prettyJson } from "../utils/response";
import { getPagination } from "../utils/pagination";

const teamRepo = AppDataSource.getRepository(Team);
const userRepo = AppDataSource.getRepository(User);

/* Crear equipo */
export const createTeam = async (req: Request, res: Response) => {
  try {
    if (req.user?.role !== "propietario") {
      return prettyJson(res, { message: "Solo propietarios pueden crear equipos" }, 403);
    }

    const { name, description, members } = req.body;

    const owner = await userRepo.findOne({ where: { id: req.user.id } });
    if (!owner) return prettyJson(res, { message: "Propietario no encontrado" }, 404);

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
    return prettyJson(res, team, 201);
  } catch (error) {
    return prettyJson(res, { message: "Error al crear equipo", error: (error as Error).message }, 500);
  }
};

/* Listar equipos */
export const getTeams = async (req: Request, res: Response) => {
  try {
    const { page, limit, skip } = getPagination(req.query);

    let teams;
    let total;

    if (req.user?.role === "propietario") {
      [teams, total] = await teamRepo.findAndCount({
        relations: ["owner", "members", "tasks"],
        order: { id: "DESC" },
        skip,
        take: limit,
      });
    } else {
      const qb = teamRepo
        .createQueryBuilder("team")
        .leftJoinAndSelect("team.owner", "owner")
        .leftJoinAndSelect("team.members", "members")
        .leftJoinAndSelect("team.tasks", "tasks")
        .where("members.id = :id", { id: req.user?.id })
        .orderBy("team.id", "DESC")
        .skip(skip)
        .take(limit);

      teams = await qb.getMany();
      total = await qb.getCount();
    }

    return prettyJson(res, {
      data: teams,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return prettyJson(res, { message: "Error al obtener equipos", error: (error as Error).message }, 500);
  }
};

/* Obtener equipo por ID */
export const getTeamById = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    const team = await teamRepo.findOne({
      where: { id },
      relations: ["owner", "members", "tasks"],
    });

    if (!team) return prettyJson(res, { message: "Equipo no encontrado" }, 404);

    return prettyJson(res, { data: team });
  } catch (error) {
    return prettyJson(res, { message: "Error al obtener equipo", error: (error as Error).message }, 500);
  }
};

/* Actualizar equipo */
export const updateTeam = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const team = await teamRepo.findOne({
      where: { id: Number(id) },
      relations: ["owner"],
    });

    if (!team) return prettyJson(res, { message: "Equipo no encontrado" }, 404);
    if (req.user?.id !== team.owner.id) {
      return prettyJson(res, { message: "Solo el propietario puede actualizar" }, 403);
    }

    team.name = req.body.name ?? team.name;
    team.description = req.body.description ?? team.description;

    await teamRepo.save(team);
    return prettyJson(res, team);
  } catch (error) {
    return prettyJson(res, { message: "Error al actualizar equipo", error: (error as Error).message }, 500);
  }
};

/* Añadir miembro */
export const addMember = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    const team = await teamRepo.findOne({
      where: { id: Number(id) },
      relations: ["owner", "members"],
    });

    if (!team) return prettyJson(res, { message: "Equipo no encontrado" }, 404);
    if (req.user?.id !== team.owner.id) {
      return prettyJson(res, { message: "Solo el propietario puede añadir miembros" }, 403);
    }

    team.members = team.members ?? [];

    const user = await userRepo.findOne({ where: { id: Number(userId) } });
    if (!user) return prettyJson(res, { message: "Usuario no encontrado" }, 404);

    if (team.members.some((m) => m.id === user.id)) {
      return prettyJson(res, { message: "El usuario ya es miembro" }, 400);
    }

    team.members.push(user);
    await teamRepo.save(team);

    return prettyJson(res, { message: "Miembro añadido correctamente", team });
  } catch (error) {
    return prettyJson(res, { message: "Error al añadir miembro", error: (error as Error).message }, 500);
  }
};

/* Quitar miembro */
export const removeMember = async (req: Request, res: Response) => {
  try {
    const { id, userId } = req.params;

    const team = await teamRepo.findOne({
      where: { id: Number(id) },
      relations: ["owner", "members"],
    });

    if (!team) return prettyJson(res, { message: "Equipo no encontrado" }, 404);
    if (req.user?.id !== team.owner.id) {
      return prettyJson(res, { message: "Solo el propietario puede quitar miembros" }, 403);
    }

    team.members = team.members ?? [];

    if (!team.members.some((m) => m.id === Number(userId))) {
      return prettyJson(res, { message: "El usuario no pertenece al equipo" }, 404);
    }

    team.members = team.members.filter((m) => m.id !== Number(userId));
    await teamRepo.save(team);

    return prettyJson(res, { message: "Miembro eliminado correctamente", team });
  } catch (error) {
    return prettyJson(res, { message: "Error al quitar miembro", error: (error as Error).message }, 500);
  }
};

/* Invitar usuario por email — CON LOG DE DEBUG */
export const inviteToTeam = async (req: Request, res: Response) => {
  try {
    const teamId = Number(req.params.id);
    const { email } = req.body;

    if (!email) return prettyJson(res, { message: "El email es obligatorio" }, 400);

    const team = await teamRepo.findOne({
      where: { id: teamId },
      relations: ["owner", "members"],
    });

    if (!team) return prettyJson(res, { message: "Equipo no encontrado" }, 404);

    team.members = team.members ?? [];

    if (req.user?.id !== team.owner.id) {
      return prettyJson(res, { message: "Solo el propietario puede invitar" }, 403);
    }

    const user = await userRepo.findOne({ where: { email } });
    if (!user) return prettyJson(res, { message: "Usuario no encontrado" }, 404);

    if (team.members.some((m) => m.id === user.id)) {
      return prettyJson(res, { message: "El usuario ya pertenece al equipo" }, 400);
    }

    team.members.push(user);

    console.log("DEBUG INVITE → team.members FINAL:", team.members);

    await teamRepo.save(team);

    return prettyJson(res, {
      message: `Usuario ${user.email} agregado correctamente`,
      team,
    });
  } catch (error) {
    console.error("ERROR inviteToTeam:", error);
    return prettyJson(
      res,
      { message: "Error al invitar usuario", error: (error as Error).message },
      500
    );
  }
};

/* Eliminar equipo */
export const deleteTeam = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const team = await teamRepo.findOne({
      where: { id: Number(id) },
      relations: ["owner"],
    });

    if (!team) return prettyJson(res, { message: "Equipo no encontrado" }, 404);

    if (req.user?.id !== team.owner.id) {
      return prettyJson(res, { message: "Solo el propietario puede eliminar" }, 403);
    }

    await teamRepo.remove(team);

    return prettyJson(res, { message: "Equipo eliminado correctamente" });
  } catch (error) {
    return prettyJson(res, { message: "Error al eliminar equipo", error: (error as Error).message }, 500);
  }
};
