"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const configService = app.get(config_1.ConfigService);
    const isDevelopment = process.env.NODE_ENV !== 'production';
    app.enableCors({
        origin: isDevelopment
            ? '*'
            : configService.get('FRONTEND_URL', 'http://localhost:4200'),
        credentials: true,
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
            enableImplicitConversion: true,
        },
    }));
    const port = configService.get('PORT', 3000);
    const host = configService.get('HOST', '0.0.0.0');
    await app.listen(port, host);
    console.log(`🚀 Server running on http://${host}:${port}`);
    console.log(`📦 API available at http://${host}:${port}/api`);
}
void bootstrap();
//# sourceMappingURL=main.js.map