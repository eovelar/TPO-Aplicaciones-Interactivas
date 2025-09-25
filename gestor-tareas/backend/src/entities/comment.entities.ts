import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  Index,
} from "typeorm";
import { Task } from "./Task";
import { User } from "./User";

@Entity({ name: "comments" })
export class Comment {
  @PrimaryGeneratedColumn()
  id!: number;

  @Index()
  @Column()
  taskId!: number;

  @ManyToOne(() => Task, (t) => t.id, { onDelete: "CASCADE" })
  task!: Task;

  @Index()
  @Column()
  userId!: number;

  @ManyToOne(() => User, (u) => u.id, { onDelete: "SET NULL" })
  user!: User;

  @Column({ type: "text" })
  contenido!: string;

  @CreateDateColumn({ type: "timestamp with time zone" })
  createdAt!: Date;
}
