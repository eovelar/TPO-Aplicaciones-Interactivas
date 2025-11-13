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

  // Relación: un equipo tiene un propietario (usuario con rol "propietario")
  @ManyToOne(() => User, { onDelete: "CASCADE" })
  owner!: User;

  // Relación: un equipo tiene muchos miembros (usuarios)
  @ManyToMany(() => User)
  @JoinTable({
    name: "team_members", // tabla intermedia explícita
    joinColumn: { name: "team_id" },
    inverseJoinColumn: { name: "user_id" },
  })
  members!: User[];

  // Relación: un equipo tiene muchas tareas
  @OneToMany(() => Task, (task) => task.team)
  tasks!: Task[];
}
