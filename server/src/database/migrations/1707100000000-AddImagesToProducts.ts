import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateProductsTable1707000000000 implements MigrationInterface {
  name = 'CreateProductsTable1707000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "products" (
        "id" SERIAL PRIMARY KEY,
        "name" varchar NOT NULL,
        "price" numeric,
        "created_at" TIMESTAMP DEFAULT now()
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TABLE "products"
    `);
  }
}
