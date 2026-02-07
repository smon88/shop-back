import { Module, OnModuleInit } from '@nestjs/common';
import { UploadsController } from './uploads.controller';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';

@Module({
  controllers: [UploadsController],
})
export class UploadsModule implements OnModuleInit {
  onModuleInit() {
    // Crear la carpeta de uploads si no existe
    const uploadsPath = join(__dirname, '..', '..', 'uploads', 'products');
    if (!existsSync(uploadsPath)) {
      mkdirSync(uploadsPath, { recursive: true });
      console.log('📁 Carpeta de uploads creada:', uploadsPath);
    }
  }
}
