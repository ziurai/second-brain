import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("readlist").order("asc").collect();
  },
});

export const add = mutation({
  args: {
    title: v.string(),
    read: v.boolean(),
    order: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("readlist", args);
  },
});

export const toggle = mutation({
  args: { id: v.id("readlist"), read: v.boolean() },
  handler: async (ctx, { id, read }) => {
    await ctx.db.patch(id, { read });
  },
});

export const update = mutation({
  args: {
    id: v.id("readlist"),
    title: v.string(),
  },
  handler: async (ctx, { id, title }) => {
    await ctx.db.patch(id, { title });
  },
});

export const remove = mutation({
  args: { id: v.id("readlist") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});
