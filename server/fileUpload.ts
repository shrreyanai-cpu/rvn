import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";

const UPLOADS_DIR = path.resolve(process.cwd(), "uploads");

// Ensure uploads directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

export class FileUploadService {
  async saveFile(fileData: Buffer, originalName: string, contentType: string): Promise<{ url: string; objectPath: string }> {
    const objectId = randomUUID();
    const extension = path.extname(originalName) || this.getExtensionFromContentType(contentType);
    const fileName = `${objectId}${extension}`;
    const filePath = path.join(UPLOADS_DIR, fileName);

    fs.writeFileSync(filePath, fileData);

    const objectPath = `/objects/${fileName}`;
    return {
      url: objectPath,
      objectPath,
    };
  }

  private getExtensionFromContentType(contentType: string): string {
    const map: Record<string, string> = {
      "image/jpeg": ".jpg",
      "image/png": ".png",
      "image/gif": ".gif",
      "image/webp": ".webp",
      "video/mp4": ".mp4",
      "video/quicktime": ".mov",
    };
    return map[contentType] || "";
  }
}

export const localFileUploadService = new FileUploadService();
