import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
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

  @Column({ type: "date", nullable: false })
  fecha_limite!: string; // formato YYYY-MM-DD

  @CreateDateColumn({ type: "timestamp" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updatedAt!: Date;

  @ManyToOne(() => User, (user) => user.tasks, { onDelete: "CASCADE" })
  @JoinColumn({ name: "userId" })
  user!: User;

  @ManyToOne(() => User, (user) => user.assignedTasks, {
    nullable: true,
    onDelete: "SET NULL",
  })
  @JoinColumn({ name: "assigned_to_id" })
  assignedTo?: User | null;

  @ManyToOne(() => Team, (team) => team.tasks, { nullable: true, onDelete: "CASCADE" })
  @JoinColumn({ name: "teamId" })
  team?: Team | null;
}
