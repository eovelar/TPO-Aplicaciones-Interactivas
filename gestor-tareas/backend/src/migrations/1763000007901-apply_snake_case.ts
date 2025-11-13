import { MigrationInterface, QueryRunner } from "typeorm";

export class ApplySnakeCase1763000007901 implements MigrationInterface {
    name = 'ApplySnakeCase1763000007901'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "team" DROP CONSTRAINT "FK_49a22109d0b97611c07768e37f1"`);
        await queryRunner.query(`ALTER TABLE "task" DROP CONSTRAINT "task_assigned_to_id_fkey"`);
        await queryRunner.query(`ALTER TABLE "team" RENAME COLUMN "ownerId" TO "owner_id"`);
        await queryRunner.query(`CREATE TABLE "Historial" ("id" SERIAL NOT NULL, "entidad" character varying(50) NOT NULL, "entidad_id" integer NOT NULL, "accion" character varying(30) NOT NULL, "usuario_id" integer NOT NULL, "fecha" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "detalles" jsonb, CONSTRAINT "PK_36927b1cac59091cb54a16a567b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_a5b863aa457cab6f3aeca7887f" ON "Historial" ("entidad") `);
        await queryRunner.query(`CREATE INDEX "IDX_f4eaf24f50986741b21cc23d68" ON "Historial" ("entidad_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_f21d8ef2aa8f52c3411de8f205" ON "Historial" ("accion") `);
        await queryRunner.query(`CREATE INDEX "IDX_7a2835e54772e074d66fb2e913" ON "Historial" ("usuario_id") `);
        await queryRunner.query(`CREATE TABLE "comment" ("id" SERIAL NOT NULL, "task_id" integer NOT NULL, "user_id" integer NOT NULL, "contenido" text NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_0b0e4bbc8415ec426f87f3a88e2" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_91256732111f039be6b212d96c" ON "comment" ("task_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_bbfe153fa60aa06483ed35ff4a" ON "comment" ("user_id") `);
        await queryRunner.query(`CREATE TABLE "team_members" ("team_id" integer NOT NULL, "user_id" integer NOT NULL, CONSTRAINT "PK_1d3c06a8217a8785e2af0ec4ab8" PRIMARY KEY ("team_id", "user_id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_fdad7d5768277e60c40e01cdce" ON "team_members" ("team_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_c2bf4967c8c2a6b845dadfbf3d" ON "team_members" ("user_id") `);
        await queryRunner.query(`ALTER TABLE "team" ADD CONSTRAINT "FK_a5111ebcad0cc858f6527f1f60a" FOREIGN KEY ("owner_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "task" ADD CONSTRAINT "FK_56caed544250017dfb635ac4374" FOREIGN KEY ("assigned_to_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "comment" ADD CONSTRAINT "FK_91256732111f039be6b212d96cd" FOREIGN KEY ("task_id") REFERENCES "task"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "comment" ADD CONSTRAINT "FK_bbfe153fa60aa06483ed35ff4a7" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "team_members" ADD CONSTRAINT "FK_fdad7d5768277e60c40e01cdcea" FOREIGN KEY ("team_id") REFERENCES "team"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "team_members" ADD CONSTRAINT "FK_c2bf4967c8c2a6b845dadfbf3d4" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "team_members" DROP CONSTRAINT "FK_c2bf4967c8c2a6b845dadfbf3d4"`);
        await queryRunner.query(`ALTER TABLE "team_members" DROP CONSTRAINT "FK_fdad7d5768277e60c40e01cdcea"`);
        await queryRunner.query(`ALTER TABLE "comment" DROP CONSTRAINT "FK_bbfe153fa60aa06483ed35ff4a7"`);
        await queryRunner.query(`ALTER TABLE "comment" DROP CONSTRAINT "FK_91256732111f039be6b212d96cd"`);
        await queryRunner.query(`ALTER TABLE "task" DROP CONSTRAINT "FK_56caed544250017dfb635ac4374"`);
        await queryRunner.query(`ALTER TABLE "team" DROP CONSTRAINT "FK_a5111ebcad0cc858f6527f1f60a"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_c2bf4967c8c2a6b845dadfbf3d"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_fdad7d5768277e60c40e01cdce"`);
        await queryRunner.query(`DROP TABLE "team_members"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_bbfe153fa60aa06483ed35ff4a"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_91256732111f039be6b212d96c"`);
        await queryRunner.query(`DROP TABLE "comment"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_7a2835e54772e074d66fb2e913"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_f21d8ef2aa8f52c3411de8f205"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_f4eaf24f50986741b21cc23d68"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_a5b863aa457cab6f3aeca7887f"`);
        await queryRunner.query(`DROP TABLE "Historial"`);
        await queryRunner.query(`ALTER TABLE "team" RENAME COLUMN "owner_id" TO "ownerId"`);
        await queryRunner.query(`ALTER TABLE "task" ADD CONSTRAINT "task_assigned_to_id_fkey" FOREIGN KEY ("assigned_to_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "team" ADD CONSTRAINT "FK_49a22109d0b97611c07768e37f1" FOREIGN KEY ("ownerId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
