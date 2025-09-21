import { Request, Response } from "express";
import { AppDataSource } from "../config/data-source";
import { Team } from "../entities/Team";
import { User } from "../entities/User";

const teamRepo = AppDataSource.getRepository(Team);
const userRepo = AppDataSource.getRepository(User);

// Crear equipo
export const createTeam = async (req: Request, res: Response) => {
  try {
    const { name, description } = req.body;

    const owner = await userRepo.findOne({ where: { id: req.user!.id } });
    if (!owner) return res.status(404).json({ message: "Propietario no encontrado" });

    const team = teamRepo.create({ name, description, owner, members: [owner] });
    await teamRepo.save(team);

    res.status(201).json(team);
  } catch (error) {
    res.status(500).json({ message: "Error al crear equipo", error });
  }
};

// Agregar miembro a un equipo
export const addMember = async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;

    const team = await teamRepo.findOne({
      where: { id: Number(req.params.id) },
      relations: ["members", "owner"],
    });

    if (!team) return res.status(404).json({ message: "Equipo no encontrado" });

    if (team.owner.id !== req.user!.id) {
      return res.status(403).json({ message: "Solo el propietario puede agregar miembros" });
    }

    const user = await userRepo.findOne({ where: { id: userId } });
    if (!user) return res.status(404).json({ message: "Usuario no encontrado" });

    team.members.push(user);
    await teamRepo.save(team);

    res.json({ message: "Miembro agregado", team });
  } catch (error) {
    res.status(500).json({ message: "Error al agregar miembro", error });
  }
};

// Listar equipos del usuario autenticado
export const getMyTeams = async (req: Request, res: Response) => {
  try {
    const teams = await teamRepo.find({
      where: [{ owner: { id: req.user!.id } }, { members: { id: req.user!.id } }],
      relations: ["owner", "members", "tasks"],
    });

    res.json(teams);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener equipos", error });
  }
};

// Listar tareas de un equipo
export const getTeamTasks = async (req: Request, res: Response) => {
  try {
    const team = await teamRepo.findOne({
      where: { id: Number(req.params.id) },
      relations: ["tasks", "members"],
    });

    if (!team) return res.status(404).json({ message: "Equipo no encontrado" });

    // Verificar que el usuario sea miembro o propietario
    const isMember = team.members.some((m) => m.id === req.user!.id);
    if (!isMember && team.owner.id !== req.user!.id) {
      return res.status(403).json({ message: "No autorizado para ver este equipo" });
    }

    res.json(team.tasks);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener tareas del equipo", error });
  }
};
