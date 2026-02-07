import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Get,
  Param,
  Res,
  NotFoundException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync } from 'fs';
import { randomUUID } from 'crypto';
import type { Response } from 'express';

const UPLOADS_FOLDER = join(__dirname, '..', '..', 'uploads', 'products');

const imageFileFilter = (
  req: any,
  file: Express.Multer.File,
  callback: (error: Error | null, acceptFile: boolean) => void,
) => {
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
    return callback(
      new BadRequestException(
        'Solo se permiten archivos de imagen (jpg, jpeg, png, gif, webp)',
      ),
      false,
    );
  }
  callback(null, true);
};

const storage = diskStorage({
  destination: (req, file, callback) => {
    callback(null, UPLOADS_FOLDER);
  },
  filename: (req, file, callback) => {
    const uniqueSuffix = randomUUID();
    const ext = extname(file.originalname).toLowerCase();
    callback(null, `product-${uniqueSuffix}${ext}`);
  },
});

@Controller('api/uploads')
export class UploadsController {
  @Post('image')
  @UseInterceptors(
    FileInterceptor('image', {
      storage,
      fileFilter: imageFileFilter,
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB max
      },
    }),
  )
  uploadImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No se proporcionó ninguna imagen');
    }

    return {
      filename: file.filename,
      url: `/api/uploads/products/${file.filename}`,
      size: file.size,
      mimetype: file.mimetype,
    };
  }

  @Get('products/:filename')
  getImage(@Param('filename') filename: string, @Res() res: Response) {
    const filePath = join(UPLOADS_FOLDER, filename);

    if (!existsSync(filePath)) {
      throw new NotFoundException('Imagen no encontrada');
    }

    return res.sendFile(filePath);
  }
}
