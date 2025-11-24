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

  @Column({ nullable: true })
  color!: string;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  owner!: User;

  @ManyToMany(() => User, (user) => user.teams, { cascade: true })
  @JoinTable({
    name: "team_members",
    joinColumn: { name: "team_id" },
    inverseJoinColumn: { name: "user_id" },
  })
  members!: User[];

  @OneToMany(() => Task, (task) => task.team)
  tasks!: Task[];
}
