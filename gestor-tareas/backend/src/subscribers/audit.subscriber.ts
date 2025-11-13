import {
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
  UpdateEvent,
  RemoveEvent,
} from "typeorm";
import { Historial } from "../entities/Historial.entities";
import { RequestContext } from "../utils/request-context";

/** Nombre de entidad desde el target */
function entityNameFromTarget(target: any): string {
  return typeof target === "function" ? target.name : String(target);
}

/** Toma un snapshot plano (solo columnas mapeadas por TypeORM, sin relaciones) */
function snapshotColumns(
  event: InsertEvent<any> | UpdateEvent<any> | RemoveEvent<any>,
  source: any
) {
  if (!source) return null;
  const cols = event.metadata.columns.map((c) => c.propertyName);
  const snap: Record<string, any> = {};
  for (const k of cols) snap[k] = source[k];
  return snap;
}

/** Diff entre dos snapshots planos (ignora campos “ruidosos”) */
function computeDiff(before: any, after: any) {
  const ignore = new Set(["updatedAt", "createdAt", "password"]);
  const changed: Record<string, { antes: any; despues: any }> = {};
  const keys = new Set([
    ...(before ? Object.keys(before) : []),
    ...(after ? Object.keys(after) : []),
  ]);
  for (const k of keys) {
    if (ignore.has(k)) continue;
    const prev = before?.[k];
    const next = after?.[k];
    // comparación segura (primitivos y Date → ISO)
    const norm = (v: any) => (v instanceof Date ? v.toISOString() : v);
    if (norm(prev) !== norm(next))
      changed[k] = { antes: norm(prev), despues: norm(next) };
  }
  return changed;
}

@EventSubscriber()
export class AuditSubscriber implements EntitySubscriberInterface {
  // Importante: NO registrar manualmente en constructor.
  // Se carga desde data-source.ts con `subscribers: [AuditSubscriber]`.

  private beforeStates = new WeakMap<object, any>();

  async afterInsert(event: InsertEvent<any>) {
    // Evitar auditar la tabla de historial
    if (event.metadata.target === Historial) return;

    const repo = event.manager.getRepository(Historial);
    const entidad = entityNameFromTarget(event.metadata.target);
    const entidadId = event.entity?.id ?? 0;
    const usuarioId = RequestContext.getUserId() ?? 0;
    if (!entidadId) return;

    const nuevo = snapshotColumns(event, event.entity);
    await repo.save(
      repo.create({
        entidad,
        entidadId,
        accion: "CREAR",
        usuarioId,
        detalles: { nuevo },
      })
    );
  }

  beforeUpdate(event: UpdateEvent<any>) {
    if (event.databaseEntity) {
      const before = snapshotColumns(event, event.databaseEntity);
      this.beforeStates.set(event.entity ?? {}, before);
    }
  }

  async afterUpdate(event: UpdateEvent<any>) {
    if (event.metadata.target === Historial) return;

    const repo = event.manager.getRepository(Historial);
    const entidad = entityNameFromTarget(event.metadata.target);
    const entidadId = (event.entity as any)?.id ?? 0;
    const usuarioId = RequestContext.getUserId() ?? 0;
    if (!entidadId) return;

    const before =
      this.beforeStates.get(event.entity ?? {}) ??
      snapshotColumns(event, event.databaseEntity);
    const after = snapshotColumns(event, event.entity);
    const diff = computeDiff(before, after);
    if (!diff || !Object.keys(diff).length) return;

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
    if (event.metadata.target === Historial) return;

    const repo = event.manager.getRepository(Historial);
    const entidad = entityNameFromTarget(event.metadata.target);
    const entidadId =
      (event.databaseEntity as any)?.id ?? (event.entity as any)?.id ?? 0;
    const usuarioId = RequestContext.getUserId() ?? 0;
    if (!entidadId) return;

    const previo = snapshotColumns(
      event,
      event.databaseEntity ?? event.entity
    );
    await repo.save(
      repo.create({
        entidad,
        entidadId,
        accion: "ELIMINAR",
        usuarioId,
        detalles: { previo },
      })
    );
  }
}
