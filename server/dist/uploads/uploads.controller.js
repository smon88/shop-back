"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadsController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const path_1 = require("path");
const fs_1 = require("fs");
const crypto_1 = require("crypto");
const UPLOADS_FOLDER = (0, path_1.join)(__dirname, '..', '..', 'uploads', 'products');
const imageFileFilter = (req, file, callback) => {
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
        return callback(new common_1.BadRequestException('Solo se permiten archivos de imagen (jpg, jpeg, png, gif, webp)'), false);
    }
    callback(null, true);
};
const storage = (0, multer_1.diskStorage)({
    destination: (req, file, callback) => {
        callback(null, UPLOADS_FOLDER);
    },
    filename: (req, file, callback) => {
        const uniqueSuffix = (0, crypto_1.randomUUID)();
        const ext = (0, path_1.extname)(file.originalname).toLowerCase();
        callback(null, `product-${uniqueSuffix}${ext}`);
    },
});
let UploadsController = class UploadsController {
    uploadImage(file) {
        if (!file) {
            throw new common_1.BadRequestException('No se proporcionó ninguna imagen');
        }
        return {
            filename: file.filename,
            url: `/api/uploads/products/${file.filename}`,
            size: file.size,
            mimetype: file.mimetype,
        };
    }
    getImage(filename, res) {
        const filePath = (0, path_1.join)(UPLOADS_FOLDER, filename);
        if (!(0, fs_1.existsSync)(filePath)) {
            throw new common_1.NotFoundException('Imagen no encontrada');
        }
        return res.sendFile(filePath);
    }
};
exports.UploadsController = UploadsController;
__decorate([
    (0, common_1.Post)('image'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('image', {
        storage,
        fileFilter: imageFileFilter,
        limits: {
            fileSize: 5 * 1024 * 1024,
        },
    })),
    __param(0, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], UploadsController.prototype, "uploadImage", null);
__decorate([
    (0, common_1.Get)('products/:filename'),
    __param(0, (0, common_1.Param)('filename')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], UploadsController.prototype, "getImage", null);
exports.UploadsController = UploadsController = __decorate([
    (0, common_1.Controller)('api/uploads')
], UploadsController);
//# sourceMappingURL=uploads.controller.js.map