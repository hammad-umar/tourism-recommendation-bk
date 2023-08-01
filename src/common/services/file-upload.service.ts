import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';

@Injectable()
export class FileUploadService {
  constructor(private configService: ConfigService) {
    cloudinary.config({
      cloud_name: this.configService.get<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get<string>('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get<string>('CLOUDINARY_API_SECRET'),
    });
  }

  async upload(
    picture: string,
  ): Promise<{ secureUrl: string; publicId: string }> {
    const { secure_url, public_id } = await cloudinary.uploader.upload(
      picture,
      { folder: '/profiles', format: 'png' },
    );

    return { secureUrl: secure_url, publicId: public_id };
  }

  async remove(publicId: string): Promise<void> {
    await cloudinary.uploader.destroy(publicId);
  }
}
