import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("countdowns").order("asc").collect();
  },
});

export const add = mutation({
  args: {
    title: v.string(),
    startDate: v.string(),
    endDate: v.optional(v.string()),
    order: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("countdowns", args);
  },
});

export const update = mutation({
  args: {
    id: v.id("countdowns"),
    title: v.optional(v.string()),
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
  },
  handler: async (ctx, { id, ...fields }) => {
    await ctx.db.patch(id, fields);
  },
});

export const remove = mutation({
  args: { id: v.id("countdowns") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});
