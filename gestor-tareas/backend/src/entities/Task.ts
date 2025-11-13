import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { User } from "./User";
import { Team } from "./Team";

@Entity("task")
export class Task {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  title!: string;

  @Column({ nullable: true })
  description!: string;

  @Column({ default: "pendiente" })
  status!: string;

  @Column({ default: "media" })
  priority!: string;

  // 🔹 Usuario que creó la tarea
  @ManyToOne(() => User, (user) => user.tasks, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn({ name: "userId" })
  user!: User;

  // 🔹 Usuario asignado (responsable de realizarla)
  @ManyToOne(() => User, (user) => user.assignedTasks, {
    nullable: true,
    onDelete: "SET NULL",
    onUpdate: "CASCADE",
  })
  @JoinColumn({ name: "assigned_to_id" })
  assignedTo?: User | null;

  // 🔹 Equipo al que pertenece la tarea (opcional)
  @ManyToOne(() => Team, (team) => team.tasks, {
    nullable: true,
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn({ name: "teamId" })
  team?: Team | null;
}
