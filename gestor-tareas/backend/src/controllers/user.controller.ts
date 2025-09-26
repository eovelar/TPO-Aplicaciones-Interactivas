import { AppDataSource } from "../config/data-source";
import { User } from "../entities/User";
import { Request, Response } from "express";
import { prettyJson } from "../utils/response";

const userRepo = AppDataSource.getRepository(User);

// Listar todos los usuarios → solo propietario
export const getUsers = async (req: Request, res: Response) => {
  try {
    if (req.user?.role !== "propietario") {
      return prettyJson(res, { message: "Solo propietarios pueden ver usuarios" }, 403);
    }

    const users = await userRepo.find();
    prettyJson(res, users);
  } catch (error) {
    prettyJson(res, { message: "Error al obtener usuarios", error: (error as Error).message }, 500);
  }
};

// Obtener un usuario por id → solo propietario
export const getUserById = async (req: Request, res: Response) => {
  try {
    if (req.user?.role !== "propietario") {
      return prettyJson(res, { message: "Solo propietarios pueden ver usuarios" }, 403);
    }

    const { id } = req.params;
    const user = await userRepo.findOne({ where: { id: Number(id) } });

    if (!user) return prettyJson(res, { message: "Usuario no encontrado" }, 404);

    prettyJson(res, user);
  } catch (error) {
    prettyJson(res, { message: "Error al obtener usuario", error: (error as Error).message }, 500);
  }
};

// Eliminar un usuario → solo propietario
export const deleteUser = async (req: Request, res: Response) => {
  try {
    if (req.user?.role !== "propietario") {
      return prettyJson(res, { message: "Solo propietarios pueden eliminar usuarios" }, 403);
    }

    const { id } = req.params;
    const user = await userRepo.findOne({ where: { id: Number(id) } });

    if (!user) return prettyJson(res, { message: "Usuario no encontrado" }, 404);

    await userRepo.remove(user);
    prettyJson(res, { message: "Usuario eliminado" });
  } catch (error) {
    prettyJson(res, { message: "Error al eliminar usuario", error: (error as Error).message }, 500);
  }
};

// Actualizar datos de un usuario → solo propietario
export const updateUser = async (req: Request, res: Response) => {
  try {
    if (req.user?.role !== "propietario") {
      return prettyJson(res, { message: "Solo propietarios pueden actualizar usuarios" }, 403);
    }

    const { id } = req.params;
    const user = await userRepo.findOne({ where: { id: Number(id) } });

    if (!user) return prettyJson(res, { message: "Usuario no encontrado" }, 404);

    user.name = req.body.name ?? user.name;
    user.email = req.body.email ?? user.email;
    user.role = req.body.role ?? user.role;

    await userRepo.save(user);
    prettyJson(res, { message: "Usuario actualizado", user });
  } catch (error) {
    prettyJson(res, { message: "Error al actualizar usuario", error: (error as Error).message }, 500);
  }
};
