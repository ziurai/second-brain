import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const items = await ctx.db.query("resources").collect();
    return items.sort((a, b) => a.order - b.order);
  },
});

export const add = mutation({
  args: {
    type: v.union(v.literal("link"), v.literal("file"), v.literal("note"), v.literal("embed")),
    label: v.string(),
    url: v.optional(v.string()),
    filePath: v.optional(v.string()),
    content: v.optional(v.string()),
    embedUrl: v.optional(v.string()),
    category: v.string(),
    categories: v.optional(v.array(v.string())),
    order: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("resources", args);
  },
});

export const remove = mutation({
  args: { id: v.id("resources") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});

export const reorder = mutation({
  args: { ids: v.array(v.id("resources")) },
  handler: async (ctx, { ids }) => {
    await Promise.all(ids.map((id, i) => ctx.db.patch(id, { order: i })));
  },
});

export const update = mutation({
  args: {
    id: v.id("resources"),
    label: v.optional(v.string()),
    content: v.optional(v.string()),
    url: v.optional(v.string()),
    filePath: v.optional(v.string()),
    embedUrl: v.optional(v.string()),
    category: v.optional(v.string()),
    categories: v.optional(v.array(v.string())),
    pinned: v.optional(v.boolean()),
  },
  handler: async (ctx, { id, ...fields }) => {
    await ctx.db.patch(id, fields);
  },
});
