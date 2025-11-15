import { AppDataSource } from "../config/data-source";
import { Team } from "../entities/Team";
import { User } from "../entities/User";
import { Request, Response } from "express";
import { In } from "typeorm";
import { prettyJson } from "../utils/response";
import { getPagination } from "../utils/pagination"; 

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
    return prettyJson(res, team, 201);
  } catch (error) {
    return prettyJson(
      res,
      {
        message: "Error al crear equipo",
        error: (error as Error).message,
      },
      500
    );
  }
};

// Listar equipos → ahora con paginación incluida
export const getTeams = async (req: Request, res: Response) => {
  try {
    const { page, limit, skip } = getPagination(req.query);

    let teams;
    let total;

    if (req.user?.role === "propietario") {
      // Propietario ve todos sus equipos
      [teams, total] = await teamRepo.findAndCount({
        relations: ["owner", "members", "tasks"],
        order: { id: "DESC" },
        skip,
        take: limit,
      });
    } else {
      // Miembro: solo equipos donde participa
      const qb = teamRepo
        .createQueryBuilder("team")
        .leftJoinAndSelect("team.owner", "owner")
        .leftJoinAndSelect("team.members", "members")
        .leftJoinAndSelect("team.tasks", "tasks")
        .where("members.id = :id", { id: req.user?.id })
        .orderBy("team.createdAt", "DESC")
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
    return prettyJson(
      res,
      {
        message: "Error al obtener equipos",
        error: (error as Error).message,
      },
      500
    );
  }
};

// Actualizar equipo → solo propietario
export const updateTeam = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const team = await teamRepo.findOne({
      where: { id: Number(id) },
      relations: ["owner"],
    });
    if (!team) return prettyJson(res, { message: "Equipo no encontrado" }, 404);

    if (req.user?.id !== team.owner.id) {
      return prettyJson(res, { message: "Solo el propietario puede actualizar el equipo" }, 403);
    }

    team.name = req.body.name ?? team.name;
    team.description = req.body.description ?? team.description;

    await teamRepo.save(team);
    return prettyJson(res, team);
  } catch (error) {
    return prettyJson(
      res,
      {
        message: "Error al actualizar equipo",
        error: (error as Error).message,
      },
      500
    );
  }
};

// Añadir miembro
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
      return prettyJson(res, { message: "Solo el propietario del equipo puede añadir miembros" }, 403);
    }

    const user = await userRepo.findOne({ where: { id: Number(userId) } });
    if (!user) return prettyJson(res, { message: "Usuario no encontrado" }, 404);

    if (team.members.some((m: User) => m.id === user.id)) {
      return prettyJson(res, { message: "El usuario ya es miembro del equipo" }, 400);
    }

    team.members.push(user);
    await teamRepo.save(team);

    return prettyJson(res, { message: "Miembro añadido correctamente ✅", team });
  } catch (error) {
    return prettyJson(
      res,
      {
        message: "Error al añadir miembro",
        error: (error as Error).message,
      },
      500
    );
  }
};

// Quitar miembro
export const removeMember = async (req: Request, res: Response) => {
  try {
    const { id, userId } = req.params;

    const team = await teamRepo.findOne({
      where: { id: Number(id) },
      relations: ["owner", "members"],
    });
    if (!team) return prettyJson(res, { message: "Equipo no encontrado" }, 404);

    if (req.user?.id !== team.owner.id) {
      return prettyJson(res, { message: "Solo el propietario del equipo puede quitar miembros" }, 403);
    }

    if (!team.members.some((m: User) => m.id === Number(userId))) {
      return prettyJson(res, { message: "El usuario no pertenece a este equipo" }, 404);
    }

    team.members = team.members.filter((m: User) => m.id !== Number(userId));
    await teamRepo.save(team);

    return prettyJson(res, { message: "Miembro quitado correctamente ✅", team });
  } catch (error) {
    return prettyJson(
      res,
      {
        message: "Error al quitar miembro",
        error: (error as Error).message,
      },
      500
    );
  }
};

// Eliminar equipo
export const deleteTeam = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const team = await teamRepo.findOne({
      where: { id: Number(id) },
      relations: ["owner"],
    });
    if (!team) return prettyJson(res, { message: "Equipo no encontrado" }, 404);

    if (req.user?.id !== team.owner.id) {
      return prettyJson(res, { message: "Solo el propietario puede eliminar el equipo" }, 403);
    }

    await teamRepo.remove(team);
    return prettyJson(res, { message: "Equipo eliminado correctamente ✅" });
  } catch (error) {
    return prettyJson(
      res,
      {
        message: "Error al eliminar equipo",
        error: (error as Error).message,
      },
      500
    );
  }
};

// Invitar usuario a un equipo → solo propietario
export const inviteToTeam = async (req: Request, res: Response) => {
  try {
    const teamId = Number(req.params.id);
    const { email } = req.body;

    console.log("EMAIL RECIBIDO EN BACKEND:", email);

    if (!email) {
      return prettyJson(res, { message: "El email es obligatorio" }, 400);
    }

    const team = await teamRepo.findOne({
      where: { id: teamId },
      relations: ["owner", "members"],
    });
    if (!team) return prettyJson(res, { message: "Equipo no encontrado" }, 404);

    if (req.user?.id !== team.owner.id) {
      return prettyJson(
        res,
        { message: "Solo el propietario del equipo puede invitar usuarios" },
        403
      );
    }

    const user = await userRepo.findOne({ where: { email } });
    if (!user) return prettyJson(res, { message: "Usuario no encontrado" }, 404);

    const yaMiembro = team.members.some((m: User) => m.id === user.id);
    if (yaMiembro) {
      return prettyJson(res, { message: "El usuario ya pertenece al equipo" }, 400);
    }

    team.members.push(user);
    await teamRepo.save(team);

    return prettyJson(res, {
      message: `Usuario ${user.email} agregado correctamente al equipo ${team.name}`,
      team,
    });
  } catch (error) {
    return prettyJson(
      res,
      {
        message: "Error al invitar usuario al equipo",
        error: (error as Error).message,
      },
      500
    );
  }
};
