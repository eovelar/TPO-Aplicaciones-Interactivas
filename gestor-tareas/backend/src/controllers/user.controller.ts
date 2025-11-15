import { AppDataSource } from "../config/data-source";
import { Like } from "typeorm";
import { User } from "../entities/User";
import { Request, Response } from "express";
import { prettyJson } from "../utils/response";
import { getPagination } from "../utils/pagination"; 

const userRepo = AppDataSource.getRepository(User);

// Listar todos los usuarios → solo propietario (con paginación + filtros)
export const getUsers = async (req: Request, res: Response) => {
  try {
    if (req.user?.role !== "propietario") {
      return prettyJson(res, { message: "Solo propietarios pueden ver usuarios" }, 403);
    }

    const { page, limit, skip } = getPagination(req.query);

    // Filtros opcionales
    const { role, search } = req.query;

    const where: any = {};

    if (role && role !== "todos") {
      where.role = role;
    }

    if (search) {
      where.name = Like(`%${search}%`);
    }

    const [users, total] = await userRepo.findAndCount({
      where,
      select: ["id", "name", "email", "role"],
      order: { id: "ASC" },
      skip,
      take: limit,
    });

    return prettyJson(res, {
      data: users,
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
      { message: "Error al obtener usuarios", error: (error as Error).message },
      500
    );
  }
};

// Obtener un usuario por ID → solo propietario
export const getUserById = async (req: Request, res: Response) => {
  try {
    if (req.user?.role !== "propietario") {
      return prettyJson(res, { message: "Solo propietarios pueden ver usuarios" }, 403);
    }

    const { id } = req.params;
    const user = await userRepo.findOne({
      where: { id: Number(id) },
      select: ["id", "name", "email", "role"],
    });

    if (!user) return prettyJson(res, { message: "Usuario no encontrado" }, 404);

    return prettyJson(res, user);
  } catch (error) {
    return prettyJson(
      res,
      { message: "Error al obtener usuario", error: (error as Error).message },
      500
    );
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
    return prettyJson(res, { message: "Usuario eliminado correctamente ✅" });
  } catch (error) {
    return prettyJson(
      res,
      { message: "Error al eliminar usuario", error: (error as Error).message },
      500
    );
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
    return prettyJson(res, { message: "Usuario actualizado correctamente ✅", user });
  } catch (error) {
    return prettyJson(
      res,
      { message: "Error al actualizar usuario", error: (error as Error).message },
      500
    );
  }
};
