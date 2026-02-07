"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = void 0;
const typeorm_1 = require("typeorm");
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)({ path: '.env' });
exports.AppDataSource = new typeorm_1.DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5433', 10),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_DATABASE || 'zentra_shop',
    entities: [
        process.env.NODE_ENV === 'production'
            ? 'dist/**/*.entity.js'
            : 'src/**/*.entity.ts',
    ],
    migrations: [
        process.env.NODE_ENV === 'production'
            ? 'dist/database/migrations/*.js'
            : 'src/database/migrations/*.ts',
    ],
    synchronize: false,
    logging: true,
});
//# sourceMappingURL=data-source.js.map