import { Injectable } from '@nestjs/common';
// biome-ignore lint/style/useImportType: <throws an error if put type>
import { CloudflareConfig } from '~/config/cloudflare/cloudflare.config';

@Injectable()
export class FileService {
  constructor(private readonly cloudflareConfig: CloudflareConfig) {}

  async uploadFile(
    folder: string,
    key: string,
    fileBuffer: Buffer,
    mimetype: string,
  ): Promise<void> {
    await this.cloudflareConfig.uploadFile(folder, key, fileBuffer, mimetype);
  }

  async deleteFile(path: string): Promise<void> {
    await this.cloudflareConfig.deleteFile(path);
  }
}
