import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1773245985154 implements MigrationInterface {
    name = 'Migration1773245985154'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "user" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying(160) NOT NULL, "first_name" character varying(120) NOT NULL, "last_name" character varying(120) NOT NULL, "password" character varying(64) NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "user"`);
    }

}
