import { AppDataSource } from "../config/data-source";
import { Team } from "../entities/Team";
import { User } from "../entities/User";
import { Request, Response } from "express";
import { In } from "typeorm";

const teamRepo = AppDataSource.getRepository(Team);
const userRepo = AppDataSource.getRepository(User);

// Crear un equipo → solo propietario
export const createTeam = async (req: Request, res: Response) => {
  try {
    if (req.user?.role !== "propietario") {
      return res
        .status(403)
        .json({ message: "Solo propietarios pueden crear equipos" });
    }

    const { name, description, members } = req.body;

    const owner = await userRepo.findOne({ where: { id: req.user.id } });
    if (!owner) {
      return res.status(404).json({ message: "Propietario no encontrado" });
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

    res.status(201).json(team);
  } catch (error) {
    res.status(500).json({ message: "Error al crear equipo", error });
  }
};

// Listar equipos → propietario ve todos, miembro solo los suyos
export const getTeams = async (req: Request, res: Response) => {
  try {
    let teams;

    if (req.user?.role === "propietario") {
      teams = await teamRepo.find({
        relations: ["owner", "members", "tasks"],
      });
    } else {
      teams = await teamRepo.find({
        where: { members: { id: req.user?.id } },
        relations: ["owner", "members", "tasks"],
      });
    }

    res.json(teams);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener equipos", error });
  }
};

// Actualizar equipo → solo propietario del equipo
export const updateTeam = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const team = await teamRepo.findOne({
      where: { id: Number(id) },
      relations: ["owner"],
    });

    if (!team) return res.status(404).json({ message: "Equipo no encontrado" });

    if (req.user?.id !== team.owner.id) {
      return res
        .status(403)
        .json({ message: "Solo el propietario puede actualizar el equipo" });
    }

    team.name = req.body.name ?? team.name;
    team.description = req.body.description ?? team.description;

    await teamRepo.save(team);
    res.json(team);
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar equipo", error });
  }
};

// Añadir miembro → solo propietario del equipo
export const addMember = async (req: Request, res: Response) => {
  try {
    const { teamId, userId } = req.body;

    const team = await teamRepo.findOne({
      where: { id: Number(teamId) },
      relations: ["owner", "members"],
    });
    if (!team) return res.status(404).json({ message: "Equipo no encontrado" });

    if (req.user?.id !== team.owner.id) {
      return res
        .status(403)
        .json({ message: "Solo el propietario del equipo puede añadir miembros" });
    }

    const user = await userRepo.findOne({ where: { id: Number(userId) } });
    if (!user) return res.status(404).json({ message: "Usuario no encontrado" });

    team.members.push(user);
    await teamRepo.save(team);

    res.json({ message: "Miembro añadido", team });
  } catch (error) {
    res.status(500).json({ message: "Error al añadir miembro", error });
  }
};

// Quitar miembro → solo propietario del equipo
export const removeMember = async (req: Request, res: Response) => {
  try {
    const { teamId, userId } = req.body;

    const team = await teamRepo.findOne({
      where: { id: Number(teamId) },
      relations: ["owner", "members"],
    });
    if (!team) return res.status(404).json({ message: "Equipo no encontrado" });

    if (req.user?.id !== team.owner.id) {
      return res
        .status(403)
        .json({ message: "Solo el propietario del equipo puede quitar miembros" });
    }

    team.members = team.members.filter((m) => m.id !== Number(userId));
    await teamRepo.save(team);

    res.json({ message: "Miembro quitado", team });
  } catch (error) {
    res.status(500).json({ message: "Error al quitar miembro", error });
  }
};

// Eliminar equipo → solo propietario
export const deleteTeam = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const team = await teamRepo.findOne({
      where: { id: Number(id) },
      relations: ["owner"],
    });
    if (!team) return res.status(404).json({ message: "Equipo no encontrado" });

    if (req.user?.id !== team.owner.id) {
      return res
        .status(403)
        .json({ message: "Solo el propietario puede eliminar el equipo" });
    }

    await teamRepo.remove(team);
    res.json({ message: "Equipo eliminado" });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar equipo", error });
  }
};
