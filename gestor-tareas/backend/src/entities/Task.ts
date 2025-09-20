import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { User } from "./User";
import { Team } from "./Team";

@Entity()
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

  // Relación: muchas tareas pertenecen a un usuario
  @ManyToOne(() => User, (user) => user.tasks, { onDelete: "CASCADE" })
  user!: User;

  // Relación: muchas tareas pertenecen a un equipo
  @ManyToOne(() => Team, (team) => team.tasks, { onDelete: "CASCADE" })
  team!: Team;
}
