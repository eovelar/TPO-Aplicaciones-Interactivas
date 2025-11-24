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
  @Column({
    name: "entidad",
    type: "varchar",
    length: 50,
  })
  entidad!: string;

  @Index()
  @Column({
    name: "entidadId",
    type: "int",
    nullable: true,
  })
  entidadId!: number | null;

  @Index()
  @Column({
    name: "accion",
    type: "varchar",
    length: 30,
  })
  accion!: AccionHistorial;

  @Index()
  @Column({
    name: "usuarioId",
    type: "int",
    nullable: true,
  })
  usuarioId!: number | null;

  @Column({
    name: "usuarioNombre",
    type: "varchar",
    length: 120,
    nullable: true,
  })
  usuarioNombre!: string | null;

  @Column({
    name: "entidadNombre",
    type: "varchar",
    length: 120,
    nullable: true,
  })
  entidadNombre!: string | null;

  @CreateDateColumn({
    name: "fecha",
    type: "timestamp with time zone",
  })
  fecha!: Date;

  @Column({
    name: "detalles",
    type: "jsonb",
    nullable: true,
  })
  detalles?: Record<string, any>;
}
