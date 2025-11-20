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

@Entity({ name: "historial" })
export class Historial {
  @PrimaryGeneratedColumn()
  id!: number;

  @Index()
  @Column({ name: "entidad", type: "varchar", length: 50 })
  entidad!: string;

  @Index()
  @Column({ name: "entidad_id", type: "int" })
  entidadId!: number;

  @Index()
  @Column({ name: "accion", type: "varchar", length: 30 })
  accion!: AccionHistorial;

  @Index()
  @Column({ name: "usuario_id", type: "int" })
  usuarioId!: number;

  @CreateDateColumn({ name: "fecha", type: "timestamp with time zone" })
  fecha!: Date;

  @Column({ name: "detalles", type: "jsonb", nullable: true })
  detalles?: Record<string, any>;
}
