// src/subscribers/audit.subscriber.ts
import {
  DataSource,
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
  UpdateEvent,
  RemoveEvent,
} from "typeorm";
import { Historial } from "../entities/historial.entities";
import { RequestContext } from "../utils/request-context";

function entityNameFromTarget(target: any): string {
  return typeof target === "function" ? target.name : String(target);
}

function computeDiff(before: any, after: any) {
  const ignore = new Set(["updatedAt", "createdAt", "password"]);
  const changed: Record<string, { antes: any; despues: any }> = {};
  const keys = new Set([...Object.keys(before ?? {}), ...Object.keys(after ?? {})]);
  for (const k of keys) {
    if (ignore.has(k)) continue;
    const prev = before?.[k];
    const next = after?.[k];
    if (JSON.stringify(prev) !== JSON.stringify(next)) {
      changed[k] = { antes: prev, despues: next };
    }
  }
  return changed;
}

@EventSubscriber()
export class AuditSubscriber implements EntitySubscriberInterface {
  constructor(ds: DataSource) {
    ds.subscribers.push(this);
  }

  private beforeStates = new WeakMap<object, any>();

  async afterInsert(event: InsertEvent<any>) {
    const repo = event.manager.getRepository(Historial);
    const entidad = entityNameFromTarget(event.metadata.target);
    const entidadId = event.entity?.id ?? 0;
    const usuarioId = RequestContext.getUserId() ?? 0;
    if (!entidadId) return;
    await repo.save(
      repo.create({
        entidad,
        entidadId,
        accion: "CREAR",
        usuarioId,
        detalles: { nuevo: event.entity },
      })
    );
  }

  beforeUpdate(event: UpdateEvent<any>) {
    if (event.databaseEntity) {
      this.beforeStates.set(event.entity ?? {}, { ...event.databaseEntity });
    }
  }

  async afterUpdate(event: UpdateEvent<any>) {
    const repo = event.manager.getRepository(Historial);
    const entidad = entityNameFromTarget(event.metadata.target);
    const entidadId = (event.entity as any)?.id ?? 0;
    const usuarioId = RequestContext.getUserId() ?? 0;
    if (!entidadId) return;

    const before = this.beforeStates.get(event.entity ?? {}) ?? event.databaseEntity;
    const after = event.entity;
    const diff = computeDiff(before, after);
    if (!Object.keys(diff).length) return;

    await repo.save(
      repo.create({
        entidad,
        entidadId,
        accion: "ACTUALIZAR",
        usuarioId,
        detalles: { cambios: diff },
      })
    );
  }

  async afterRemove(event: RemoveEvent<any>) {
    const repo = event.manager.getRepository(Historial);
    const entidad = entityNameFromTarget(event.metadata.target);
    const entidadId =
      (event.databaseEntity as any)?.id ?? (event.entity as any)?.id ?? 0;
    const usuarioId = RequestContext.getUserId() ?? 0;
    if (!entidadId) return;

    await repo.save(
      repo.create({
        entidad,
        entidadId,
        accion: "ELIMINAR",
        usuarioId,
        detalles: { previo: event.databaseEntity ?? null },
      })
    );
  }
}
