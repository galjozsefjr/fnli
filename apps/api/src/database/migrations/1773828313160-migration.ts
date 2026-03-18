import { MigrationInterface, QueryRunner } from 'typeorm';

export class LastDrawMigration1773828313160 implements MigrationInterface {
  name = 'LastDrawMigration1773828313160';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "simulation" ADD "last_draw" smallint array`,
    );
    await queryRunner.query(
      `ALTER TABLE "simulation" ADD "last_play" smallint array`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "simulation" DROP COLUMN "last_play"`);
    await queryRunner.query(`ALTER TABLE "simulation" DROP COLUMN "last_draw"`);
  }
}
