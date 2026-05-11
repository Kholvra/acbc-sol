import { TRPCError } from "@trpc/server";
import {
  campaignIdSchema,
  createCampaignSchema,
  updateCampaignSchema,
} from "~/server/api/schemas/campaign.schema";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

async function getUserByAddress(db: typeof import("~/server/db").db, address: string) {
  const user = await db.user.findUnique({ where: { address }, select: { id: true, role: true } });
  if (!user) return null;
  return user;
}

const campaignerProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  const user = await getUserByAddress(ctx.db, ctx.session.address);
  if (!user || user.role !== "CAMPAIGNER") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Campaigner role required to create campaigns",
    });
  }
  return next({ ctx: { userId: user.id } });
});

export const campaignRouter = createTRPCRouter({
  createCampaign: campaignerProcedure
    .input(createCampaignSchema)
    .mutation(async ({ ctx, input }) => {
      const user = await getUserByAddress(ctx.db, ctx.session.address);
      const userId = user!.id;
      const { items, onChainAddress, campaignId, ...campaignData } = input;

      const campaign = await ctx.db.$transaction(async (tx) => {
        const campaign = await tx.campaign.create({
          data: {
            creatorId: userId,
            title: campaignData.title,
            pitchVideoUrl: campaignData.pitchVideoUrl,
            category: campaignData.category,
            province: campaignData.province,
            targetAmount: campaignData.targetAmount,
            endDate: new Date(campaignData.endDate),
            description: campaignData.description,
            onChainAddress,
            campaignId: campaignId ? BigInt(campaignId) : undefined,
          },
        });

        await tx.campaignItem.createMany({
          data: items.map((item) => ({
            campaignId: campaign.id,
            itemName: item.itemName,
            quantity: item.quantity,
            estimatedPrice: item.estimatedPrice,
            totalPrice: item.quantity * item.estimatedPrice,
          })),
        });

        return campaign;
      });

      return { id: campaign.id };
    }),

  getCampaignById: publicProcedure
    .input(campaignIdSchema)
    .query(async ({ ctx, input }) => {
      const campaign = await ctx.db.campaign.findUnique({
        where: { id: input.campaignId },
        select: {
          id: true,
          title: true,
          pitchVideoUrl: true,
          category: true,
          province: true,
          targetAmount: true,
          raisedAmount: true,
          endDate: true,
          description: true,
          createdAt: true,
          onChainAddress: true,
          campaignId: true,
          creator: {
            select: {
              name: true,
              address: true,
            },
          },
          items: {
            select: {
              itemName: true,
              quantity: true,
              estimatedPrice: true,
              totalPrice: true,
            },
          },
        },
      });

      if (!campaign) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Campaign not found",
        });
      }

      return campaign;
    }),

  getAllCampaigns: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.campaign.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        targetAmount: true,
        raisedAmount: true,
        endDate: true,
        createdAt: true,
        onChainAddress: true,
        campaignId: true,
        category: true,
        province: true,
        description: true,
        pitchVideoUrl: true,
        creator: {
          select: {
            name: true,
            address: true,
          },
        },
      },
    });
  }),

  getMyCampaigns: protectedProcedure.query(async ({ ctx }) => {
    const user = await getUserByAddress(ctx.db, ctx.session.address);
    if (!user) return [];
    return ctx.db.campaign.findMany({
      where: { creatorId: user.id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        targetAmount: true,
        raisedAmount: true,
        endDate: true,
        createdAt: true,
        onChainAddress: true,
        campaignId: true,
      },
    });
  }),

  updateCampaign: protectedProcedure
    .input(updateCampaignSchema)
    .mutation(async ({ ctx, input }) => {
      const user = await getUserByAddress(ctx.db, ctx.session.address);
      if (!user) throw new TRPCError({ code: "UNAUTHORIZED" });

      const { campaignId, ...data } = input;

      const campaign = await ctx.db.campaign.findUnique({
        where: { id: campaignId },
      });

      if (!campaign) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Campaign not found",
        });
      }

      if (campaign.creatorId !== user.id) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      const updateData = {
        ...data,
        endDate: data.endDate ? new Date(data.endDate) : undefined,
      };

      await ctx.db.campaign.update({
        where: { id: campaignId },
        data: updateData,
      });

      return { success: true };
    }),

  deleteCampaign: protectedProcedure
    .input(campaignIdSchema)
    .mutation(async ({ ctx, input }) => {
      const user = await getUserByAddress(ctx.db, ctx.session.address);
      if (!user) throw new TRPCError({ code: "UNAUTHORIZED" });

      const campaign = await ctx.db.campaign.findUnique({
        where: { id: input.campaignId },
      });

      if (!campaign) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Campaign not found",
        });
      }

      if (campaign.creatorId !== user.id) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      await ctx.db.campaign.delete({
        where: { id: input.campaignId },
      });

      return { success: true };
    }),
});
