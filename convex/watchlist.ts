import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("watchlist").order("asc").collect();
  },
});

export const add = mutation({
  args: {
    type: v.union(v.literal("movie"), v.literal("tv")),
    title: v.string(),
    releaseDate: v.optional(v.string()),
    platform: v.optional(v.string()),
    watched: v.boolean(),
    order: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("watchlist", args);
  },
});

export const toggle = mutation({
  args: { id: v.id("watchlist"), watched: v.boolean() },
  handler: async (ctx, { id, watched }) => {
    await ctx.db.patch(id, { watched });
  },
});

export const update = mutation({
  args: {
    id: v.id("watchlist"),
    title: v.string(),
    releaseDate: v.optional(v.string()),
    platform: v.optional(v.string()),
  },
  handler: async (ctx, { id, title, releaseDate, platform }) => {
    await ctx.db.patch(id, { title, releaseDate, platform });
  },
});

export const remove = mutation({
  args: { id: v.id("watchlist") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});
