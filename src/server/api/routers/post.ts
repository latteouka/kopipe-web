import axios from "axios";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const postRouter = createTRPCRouter({
  hello: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.text}`,
      };
    }),

  create: publicProcedure
    .input(
      z.object({
        content: z.string(),
        filename: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const post = await ctx.db.post.create({
        data: {
          content: input.content,
          filename: input.filename,
        },
      });
      return {
        post,
      };
    }),

  findMany: publicProcedure.query(async ({ ctx }) => {
    // 每次進來就順便刪除超過時間
    const twentyFourHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000);

    try {
      const shouldDeletePosts = await ctx.db.post.findMany({
        where: {
          createdAt: {
            lt: twentyFourHoursAgo,
          },
        },
      });

      for (const post of shouldDeletePosts) {
        await axios.post<{ success: boolean; message: string }>("/api/delete", {
          filename: post.filename,
        });
      }
    } catch (error) {
      console.log(error);
    }

    await ctx.db.post.deleteMany({
      where: {
        createdAt: {
          lt: twentyFourHoursAgo,
        },
      },
    });

    const posts = await ctx.db.post.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });
    return {
      posts,
    };
  }),

  deletePost: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const post = await ctx.db.post.delete({
        where: {
          id: input.id,
        },
      });
      return {
        post,
      };
    }),
});
