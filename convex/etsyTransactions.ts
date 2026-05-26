import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const items = await ctx.db.query("etsyTransactions").collect();
    return items.sort((a, b) => b.date.localeCompare(a.date) || b._creationTime - a._creationTime);
  },
});

export const add = mutation({
  args: {
    type: v.union(v.literal("income"), v.literal("expense"), v.literal("robert")),
    date: v.string(),
    amount: v.number(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("etsyTransactions", args);
  },
});

export const update = mutation({
  args: {
    id: v.id("etsyTransactions"),
    type: v.optional(v.union(v.literal("income"), v.literal("expense"), v.literal("robert"))),
    date: v.optional(v.string()),
    amount: v.optional(v.number()),
    description: v.optional(v.string()),
  },
  handler: async (ctx, { id, ...fields }) => {
    await ctx.db.patch(id, fields);
  },
});

export const remove = mutation({
  args: { id: v.id("etsyTransactions") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});

export const deleteAll = mutation({
  args: {},
  handler: async (ctx) => {
    const items = await ctx.db.query("etsyTransactions").collect();
    await Promise.all(items.map((item) => ctx.db.delete(item._id)));
    return items.length;
  },
});

export const batchAdd = mutation({
  args: {
    transactions: v.array(
      v.object({
        type: v.union(v.literal("income"), v.literal("expense"), v.literal("robert")),
        date: v.string(),
        amount: v.number(),
        description: v.optional(v.string()),
      })
    ),
  },
  handler: async (ctx, { transactions }) => {
    for (const tx of transactions) {
      await ctx.db.insert("etsyTransactions", tx);
    }
    return transactions.length;
  },
});
