// src/controllers/historial.controller.ts
import { Request, Response } from "express";
import { AppDataSource } from "../config/data-source";
import { Historial } from "../entities/historial.entities";

export const getHistorial = async (req: Request, res: Response) => {
  const repo = AppDataSource.getRepository(Historial);

  const {
    entidad,
    entidadId,
    usuarioId,
    accion,
    desde,
    hasta,
    limit = "50",
    offset = "0",
  } = req.query as Record<string, string>;

  const qb = repo
    .createQueryBuilder("h")
    .orderBy("h.fecha", "DESC")
    .take(Number(limit))
    .skip(Number(offset));

  if (entidad) qb.andWhere("h.entidad = :entidad", { entidad });
  if (entidadId) qb.andWhere("h.entidadId = :entidadId", { entidadId: Number(entidadId) });
  if (usuarioId) qb.andWhere("h.usuarioId = :usuarioId", { usuarioId: Number(usuarioId) });
  if (accion) qb.andWhere("h.accion = :accion", { accion });
  if (desde) qb.andWhere("h.fecha >= :desde", { desde: new Date(desde) });
  if (hasta) qb.andWhere("h.fecha <= :hasta", { hasta: new Date(hasta) });

  const [items, total] = await qb.getManyAndCount();
  res.json({ total, items });
};
