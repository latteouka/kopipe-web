import { PrismaClient } from "@prisma/client";
import axios from "axios";

export const prisma = new PrismaClient();

const main = async () => {
  console.log("start checking");
  // 3 hours
  // const dueTime = new Date(Date.now() - 3 * 60 * 60 * 1000);
  const dueTime = new Date(Date.now() - 20 * 1000);

  const shouldDeletePosts = await prisma.post.findMany({
    where: {
      createdAt: {
        lt: dueTime,
      },
    },
  });

  console.log("Should delete posts: ", shouldDeletePosts.length);

  for (const post of shouldDeletePosts) {
    await axios.post<{ success: boolean; message: string }>(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/delete`,
      {
        filename: post.filename,
      },
    );
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
