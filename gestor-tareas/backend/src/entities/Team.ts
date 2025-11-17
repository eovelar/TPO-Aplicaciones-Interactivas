import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  ManyToMany,
  OneToMany,
  JoinTable,
} from "typeorm";
import { User } from "./User";
import { Task } from "./Task";

@Entity("team")
export class Team {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column({ nullable: true })
  description!: string;

  // 🎨 Color personalizado estilo Discord
  @Column({ nullable: true })
  color!: string;

  // Un equipo tiene un propietario
  @ManyToOne(() => User, { onDelete: "CASCADE" })
  owner!: User;

  // Un equipo tiene muchos miembros
  @ManyToMany(() => User)
  @JoinTable({
    name: "team_members",
    joinColumn: { name: "team_id" },
    inverseJoinColumn: { name: "user_id" },
  })
  members!: User[];

  // Un equipo tiene muchas tareas
  @OneToMany(() => Task, (task) => task.team)
  tasks!: Task[];
}
