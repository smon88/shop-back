import type { Response } from 'express';
export declare class UploadsController {
    uploadImage(file: Express.Multer.File): {
        filename: string;
        url: string;
        size: number;
        mimetype: string;
    };
    getImage(filename: string, res: Response): void;
}
