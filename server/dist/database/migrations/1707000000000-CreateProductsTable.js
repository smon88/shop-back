"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateProductsTable1707000000000 = void 0;
class CreateProductsTable1707000000000 {
    name = 'CreateProductsTable1707000000000';
    async up(queryRunner) {
        await queryRunner.query(`
      CREATE TABLE "products" (
        "id" SERIAL PRIMARY KEY,
        "name" varchar NOT NULL,
        "price" numeric,
        "created_at" TIMESTAMP DEFAULT now()
      )
    `);
    }
    async down(queryRunner) {
        await queryRunner.query(`
      DROP TABLE "products"
    `);
    }
}
exports.CreateProductsTable1707000000000 = CreateProductsTable1707000000000;
//# sourceMappingURL=1707000000000-CreateProductsTable.js.map