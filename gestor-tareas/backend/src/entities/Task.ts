import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { User } from "./User";

@Entity()
export class Task {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ nullable: true })
  description: string;

  @Column({ default: "pendiente" })
  status: string;

  @Column({ default: "media" })
  priority: string;

  @ManyToOne(() => User, (user) => user.id, { onDelete: "CASCADE" })
  user: User;
}
