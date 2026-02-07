"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddImagesToProducts1707100000000 = void 0;
class AddImagesToProducts1707100000000 {
    name = 'AddImagesToProducts1707100000000';
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "products" ADD "images" text`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "images"`);
    }
}
exports.AddImagesToProducts1707100000000 = AddImagesToProducts1707100000000;
//# sourceMappingURL=1707100000000-AddImagesToProducts.js.map