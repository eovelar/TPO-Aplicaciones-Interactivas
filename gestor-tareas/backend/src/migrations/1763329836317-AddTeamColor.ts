import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTeamColor1763329836317 implements MigrationInterface {
    name = 'AddTeamColor1763329836317'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "team" ADD "color" character varying`);
        await queryRunner.query(`ALTER TABLE "task" ALTER COLUMN "fecha_limite" DROP DEFAULT`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "task" ALTER COLUMN "fecha_limite" SET DEFAULT '2099-12-31'`);
        await queryRunner.query(`ALTER TABLE "team" DROP COLUMN "color"`);
    }

}
