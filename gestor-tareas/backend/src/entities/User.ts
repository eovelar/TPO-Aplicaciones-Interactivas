import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BeforeInsert,
  OneToMany,
  ManyToMany,
} from "typeorm";
import * as bcrypt from "bcrypt";
import { Task } from "./Task";
import { Team } from "./Team";

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  password!: string;

  @Column({ default: "miembro" })
  role!: string;

  // Un usuario puede tener muchas tareas
  @OneToMany(() => Task, (task) => task.user)
  tasks!: Task[];

  // Un usuario puede ser propietario de varios equipos
  @OneToMany(() => Team, (team) => team.owner)
  ownedTeams!: Team[];

  // Un usuario puede ser miembro de varios equipos
  @ManyToMany(() => Team, (team) => team.members)
  teams!: Team[];

  @BeforeInsert()
  async hashPassword() {
    this.password = await bcrypt.hash(this.password, 10);
  }

  async checkPassword(password: string) {
    return bcrypt.compare(password, this.password);
  }
}
