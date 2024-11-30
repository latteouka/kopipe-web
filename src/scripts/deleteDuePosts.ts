import { PrismaClient } from "@prisma/client";
import fs from "fs/promises";
import path from "path";

export const prisma = new PrismaClient();

const main = async () => {
  // 3 hours
  const dueTime = new Date(Date.now() - 3 * 60 * 60 * 1000);
  // const dueTime = new Date(Date.now() - 20 * 1000);

  const folderPath = process.env.UPLOAD_DIR ?? "/srv/uploads";
  const files = await fs.readdir(folderPath);

  for (const file of files) {
    const filePath = path.join(folderPath, file);
    const stats = await fs.stat(filePath);

    // Check if the file is older than dueTime
    if (stats.mtime.getTime() < dueTime.getTime()) {
      await fs.unlink(filePath);
      console.log(`Deleted file: ${filePath}`);
    }
  }

  await prisma.post.deleteMany({
    where: {
      createdAt: {
        lt: dueTime,
      },
    },
  });
};

void main();
