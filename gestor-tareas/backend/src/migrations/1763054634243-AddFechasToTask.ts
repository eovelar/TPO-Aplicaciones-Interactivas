import { MigrationInterface, QueryRunner } from "typeorm";

export class AddFechasToTask1763054634243 implements MigrationInterface {
    name = "AddFechasToTask1763054634243";

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Permite aplicar la migración incluso si ya existen tareas
        await queryRunner.query(`
            ALTER TABLE "task"
            ADD COLUMN "fecha_limite" date NOT NULL DEFAULT '2099-12-31'
        `);
        await queryRunner.query(`
            ALTER TABLE "task"
            ADD COLUMN "created_at" TIMESTAMP NOT NULL DEFAULT now()
        `);
        await queryRunner.query(`
            ALTER TABLE "task"
            ADD COLUMN "updated_at" TIMESTAMP NOT NULL DEFAULT now()
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "task" DROP COLUMN "updated_at"`);
        await queryRunner.query(`ALTER TABLE "task" DROP COLUMN "created_at"`);
        await queryRunner.query(`ALTER TABLE "task" DROP COLUMN "fecha_limite"`);
    }
}
