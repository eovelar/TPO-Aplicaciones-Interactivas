import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from "typeorm";

export type AccionHistorial =
  | "CREAR"
  | "ACTUALIZAR"
  | "ELIMINAR"
  | "CAMBIAR_ESTADO"
  | "ASIGNAR"
  | "DESASIGNAR"
  | "LOGIN"
  | "LOGOUT";

@Entity({ name: "Historial" })
export class Historial {
  @PrimaryGeneratedColumn()
  id!: number;

  @Index()
  @Column({ type: "varchar", length: 50 })
  entidad!: string; // p.ej. "Task", "User"

  @Index()
  @Column({ type: "int" })
  entidadId!: number; // id de la entidad afectada

  @Index()
  @Column({ type: "varchar", length: 30 })
  accion!: AccionHistorial;

  @Index()
  @Column({ type: "int" })
  usuarioId!: number; // quién hizo la acción

  @CreateDateColumn({ type: "timestamp with time zone" })
  fecha!: Date;

  @Column({ type: "jsonb", nullable: true })
  detalles?: Record<string, any>; // cambios prev/pos, comentarios, etc.
}
