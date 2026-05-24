import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("printJobs").order("asc").collect();
  },
});

export const add = mutation({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("printJobs").order("asc").collect();
    return await ctx.db.insert("printJobs", {
      status: "not-started",
      descriptor: "",
      product: "",
      customer: "",
      produce: "",
      shipDate: "",
      shipBy: "",
      order: all.length,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("printJobs"),
    status: v.optional(v.union(v.literal("not-started"), v.literal("in-progress"), v.literal("done"))),
    descriptor: v.optional(v.string()),
    product: v.optional(v.string()),
    customer: v.optional(v.string()),
    produce: v.optional(v.string()),
    shipDate: v.optional(v.string()),
    shipBy: v.optional(v.string()),
  },
  handler: async (ctx, { id, ...fields }) => {
    await ctx.db.patch(id, fields);
  },
});

export const remove = mutation({
  args: { id: v.id("printJobs") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});
