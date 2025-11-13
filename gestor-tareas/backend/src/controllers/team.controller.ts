import { AppDataSource } from "../config/data-source";
import { Team } from "../entities/Team";
import { User } from "../entities/User";
import { Request, Response } from "express";
import { In } from "typeorm";
import { prettyJson } from "../utils/response";

const teamRepo = AppDataSource.getRepository(Team);
const userRepo = AppDataSource.getRepository(User);

// 🔹 Crear un equipo → solo propietario
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
    return prettyJson(res, {
      message: "Error al crear equipo",
      error: (error as Error).message,
    }, 500);
  }
};

// 🔹 Listar equipos
export const getTeams = async (req: Request, res: Response) => {
  try {
    let teams;

    if (req.user?.role === "propietario") {
      teams = await teamRepo.find({ relations: ["owner", "members", "tasks"] });
    } else {
      teams = await teamRepo
        .createQueryBuilder("team")
        .leftJoinAndSelect("team.owner", "owner")
        .leftJoinAndSelect("team.members", "members")
        .leftJoinAndSelect("team.tasks", "tasks")
        .where("members.id = :id", { id: req.user?.id })
        .getMany();
    }

    return prettyJson(res, teams);
  } catch (error) {
    return prettyJson(res, {
      message: "Error al obtener equipos",
      error: (error as Error).message,
    }, 500);
  }
};

// 🔹 Actualizar equipo → solo propietario
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
    return prettyJson(res, {
      message: "Error al actualizar equipo",
      error: (error as Error).message,
    }, 500);
  }
};

// 🔹 Añadir miembro
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
    return prettyJson(res, {
      message: "Error al añadir miembro",
      error: (error as Error).message,
    }, 500);
  }
};

// 🔹 Quitar miembro
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
    return prettyJson(res, {
      message: "Error al quitar miembro",
      error: (error as Error).message,
    }, 500);
  }
};

// 🔹 Eliminar equipo
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
    return prettyJson(res, {
      message: "Error al eliminar equipo",
      error: (error as Error).message,
    }, 500);
  }
};

// 🔹 Invitar usuario a un equipo → solo propietario
export const inviteToTeam = async (req: Request, res: Response) => {
  try {
    const teamId = Number(req.params.id);
    const { email } = req.body;

    // 👇 AGREGADO PARA VER QUÉ LLEGA DEL FRONT
    console.log("🔍 EMAIL RECIBIDO EN BACKEND:", email);

    if (!email) {
      return prettyJson(res, { message: "El email es obligatorio" }, 400);
    }

    const team = await teamRepo.findOne({
      where: { id: teamId },
      relations: ["owner", "members"],
    });
    if (!team) return prettyJson(res, { message: "Equipo no encontrado" }, 404);

    // Validar propietario
    if (req.user?.id !== team.owner.id) {
      return prettyJson(
        res,
        { message: "Solo el propietario del equipo puede invitar usuarios" },
        403
      );
    }

    const user = await userRepo.findOne({ where: { email } });
    if (!user) return prettyJson(res, { message: "Usuario no encontrado" }, 404);

    // Evitar duplicados
    const yaMiembro = team.members.some((m: User) => m.id === user.id);
    if (yaMiembro) {
      return prettyJson(res, { message: "El usuario ya pertenece al equipo" }, 400);
    }

    // Agregar usuario al equipo
    team.members.push(user);
    await teamRepo.save(team);

    return prettyJson(res, {
      message: `✅ Usuario ${user.email} agregado correctamente al equipo ${team.name}`,
      team,
    });
  } catch (error) {
    return prettyJson(res, {
      message: "Error al invitar usuario al equipo",
      error: (error as Error).message,
    }, 500);
  }
};
