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

  // ⬅ AHORA PERMITE NULL
  @Index()
  @Column({ name: "entidadId", type: "int", nullable: true })
  entidadId!: number | null;

  @Index()
  @Column({ name: "accion", type: "varchar", length: 30 })
  accion!: AccionHistorial;

  @Index()
  @Column({ name: "usuarioId", type: "int" })
  usuarioId!: number;

  @CreateDateColumn({ name: "fecha", type: "timestamp with time zone" })
  fecha!: Date;

  @Column({ name: "detalles", type: "jsonb", nullable: true })
  detalles?: Record<string, any>;
}
