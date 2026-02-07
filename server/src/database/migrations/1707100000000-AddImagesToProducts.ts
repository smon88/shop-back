import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddImagesToProducts1707100000000 implements MigrationInterface {
  name = 'AddImagesToProducts1707100000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "products" ADD "images" text`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "products" DROP COLUMN "images"`,
    );
  }
}
