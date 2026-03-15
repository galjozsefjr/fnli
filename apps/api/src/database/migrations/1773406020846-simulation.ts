import { MigrationInterface, QueryRunner } from 'typeorm';

export class SimulationMigration1773406020846 implements MigrationInterface {
  name = 'SimulationMigration1773406020846';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."simulation_status_enum" AS ENUM('created', 'started', 'stop', 'finished')`,
    );
    await queryRunner.query(
      `CREATE TABLE "simulation" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "status" "public"."simulation_status_enum" NOT NULL DEFAULT 'created', "total_draws" smallint NOT NULL DEFAULT '0', "ticket_price" integer NOT NULL DEFAULT '300', "fixed_numbers" smallint array, "simulation_interval" smallint NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "owner_id" uuid, CONSTRAINT "CHK_07cb3d2cdf15107cf0e0de3e83" CHECK ("fixed_numbers" IS NULL OR array_length("fixed_numbers", 1) = 5), CONSTRAINT "PK_4b32674039366f76e42c51a2e9d" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "hits" ("id" SERIAL NOT NULL, "draws" smallint array NOT NULL, "hits" smallint array NOT NULL, "matches" smallint NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "simulation_id" uuid, CONSTRAINT "CHK_beaa7f249c992fc74223e0d8b8" CHECK (array_length("draws", 1) = 5), CONSTRAINT "CHK_d45c90d5dd8264f3f8fa1baef5" CHECK (array_length("hits", 1) = 5), CONSTRAINT "CHK_4f8e8541a10a07c1d47bb64aba" CHECK ("matches" BETWEEN 2 AND 5), CONSTRAINT "PK_035aa41badd42e65e058171f02e" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_9b92f93672fc7b4beac5c542b9" ON "hits" ("matches") `,
    );
    await queryRunner.query(
      `ALTER TABLE "simulation" ADD CONSTRAINT "FK_4bfcf60826913a72712f42708d0" FOREIGN KEY ("owner_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "hits" ADD CONSTRAINT "FK_d507b16910aa96d1632d535b94e" FOREIGN KEY ("simulation_id") REFERENCES "simulation"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "hits" DROP CONSTRAINT "FK_d507b16910aa96d1632d535b94e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "simulation" DROP CONSTRAINT "FK_4bfcf60826913a72712f42708d0"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_9b92f93672fc7b4beac5c542b9"`,
    );
    await queryRunner.query(`DROP TABLE "hits"`);
    await queryRunner.query(`DROP TABLE "simulation"`);
    await queryRunner.query(`DROP TYPE "public"."simulation_status_enum"`);
  }
}
