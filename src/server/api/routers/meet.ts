import { z } from "zod";
import axios from "axios";
import { TRPCError } from "@trpc/server";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const meetRouter = createTRPCRouter({
  getLink: publicProcedure.mutation(async ({ input }) => {
    const meetLinkResult = await axios.get(
      "https://api.chundev.com/social/meetLink",
    );

    try {
      const result = meetLinkResult.data as {
        url: string;
        message: string;
        statusCode: number;
      };
      return {
        url: result.url,
      };
    } catch (error) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "不要一直按！",
      });
    }
  }),
});
