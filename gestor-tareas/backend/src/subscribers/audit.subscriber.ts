import {
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
  UpdateEvent,
  RemoveEvent,
} from "typeorm";
import { Historial } from "../entities/Historial.entities";
import { RequestContext } from "../utils/request-context";

function entityNameFromTarget(target: any): string {
  return typeof target === "function" ? target.name : String(target);
}

function snapshotColumns(event: any, source: any) {
  if (!source) return null;
  const cols = event.metadata.columns.map((c: any) => c.propertyName);
  const snap: Record<string, any> = {};
  for (const k of cols) snap[k] = source[k];
  return snap;
}

function computeDiff(before: any, after: any) {
  const ignore = new Set(["updatedAt", "createdAt", "password"]);
  const changed: Record<string, any> = {};
  const keys = new Set([
    ...(before ? Object.keys(before) : []),
    ...(after ? Object.keys(after) : []),
  ]);

  const norm = (v: any) => (v instanceof Date ? v.toISOString() : v);

  for (const k of keys) {
    if (ignore.has(k)) continue;
    if (norm(before?.[k]) !== norm(after?.[k])) {
      changed[k] = { antes: norm(before?.[k]), despues: norm(after?.[k]) };
    }
  }
  return changed;
}

@EventSubscriber()
export class AuditSubscriber implements EntitySubscriberInterface {
  private beforeStates = new WeakMap<object, any>();

  /** INSERT */
  async afterInsert(event: InsertEvent<any>) {
    if (event.metadata.target === Historial) return;

    const repo = event.manager.getRepository(Historial);

    await repo.save(
      repo.create({
        entidad: entityNameFromTarget(event.metadata.target),
        entidadId: event.entity?.id, // <-- FIX CORRECTO
        accion: "CREAR",
        usuarioId: RequestContext.getUserId() ?? 0,
        detalles: { nuevo: snapshotColumns(event, event.entity) },
      })
    );
  }

  /** BEFORE UPDATE */
  beforeUpdate(event: UpdateEvent<any>) {
    if (event.databaseEntity) {
      this.beforeStates.set(
        event.entity ?? {},
        snapshotColumns(event, event.databaseEntity)
      );
    }
  }

  /** AFTER UPDATE */
  async afterUpdate(event: UpdateEvent<any>) {
    if (event.metadata.target === Historial) return;

    const before =
      this.beforeStates.get(event.entity ?? {}) ??
      snapshotColumns(event, event.databaseEntity);

    const after = snapshotColumns(event, event.entity);
    const diff = computeDiff(before, after);

    if (!diff || Object.keys(diff).length === 0) return;

    const repo = event.manager.getRepository(Historial);

    await repo.save(
      repo.create({
        entidad: entityNameFromTarget(event.metadata.target),
        entidadId: (event.entity as any)?.id, // <-- FIX
        accion: "ACTUALIZAR",
        usuarioId: RequestContext.getUserId() ?? 0,
        detalles: { cambios: diff },
      })
    );
  }

  /** REMOVE */
  async afterRemove(event: RemoveEvent<any>) {
    if (event.metadata.target === Historial) return;

    const repo = event.manager.getRepository(Historial);

    await repo.save(
      repo.create({
        entidad: entityNameFromTarget(event.metadata.target),
        entidadId:
          (event.databaseEntity as any)?.id ??
          (event.entity as any)?.id ??
          0, // <-- FIX
        accion: "ELIMINAR",
        usuarioId: RequestContext.getUserId() ?? 0,
        detalles: {
          previo: snapshotColumns(
            event,
            event.databaseEntity ?? event.entity
          ),
        },
      })
    );
  }
}
