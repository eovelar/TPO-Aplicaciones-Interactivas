import { Request, Response } from "express";
import { AppDataSource } from "../config/data-source";
import { Historial } from "../entities/Historial.entities";

export const getHistorial = async (req: Request, res: Response) => {
  try {
    const repo = AppDataSource.getRepository(Historial);

    const {
      entidad,
      entidadId,
      usuarioId,
      accion,
      desde,
      hasta,
      limit = "10",
      page = "1",
    } = req.query as Record<string, string>;

    const take = Number(limit);
    const currentPage = Number(page);
    const skip = (currentPage - 1) * take;

    const qb = repo
      .createQueryBuilder("h")
      .orderBy("h.fecha", "DESC")
      .take(take)
      .skip(skip);

    if (entidad)
      qb.andWhere("h.entidad = :entidad", { entidad });

    if (entidadId)
      qb.andWhere("h.entidadId = :entidadId", { entidadId: Number(entidadId) });

    if (usuarioId)
      qb.andWhere("h.usuarioId = :usuarioId", { usuarioId: Number(usuarioId) });

    if (accion)
      qb.andWhere("h.accion = :accion", { accion });

    if (desde)
      qb.andWhere("h.fecha >= :desde", { desde: new Date(desde) });

    if (hasta)
      qb.andWhere("h.fecha <= :hasta", { hasta: new Date(hasta) });

    const [items, total] = await qb.getManyAndCount();

    return res.json({
      data: items,  // ← el frontend espera esto
      meta: {
        page: currentPage,
        limit: take,
        total,
        totalPages: Math.ceil(total / take),
      }
    });

  } catch (error) {
    console.error("❌ Error en getHistorial:", error);
    return res.status(500).json({ message: "Error al obtener historial" });
  }
};
