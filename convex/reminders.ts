import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("reminders").order("asc").collect();
  },
});

export const add = mutation({
  args: { text: v.string(), checked: v.boolean(), order: v.number() },
  handler: async (ctx, args) => {
    return await ctx.db.insert("reminders", args);
  },
});

export const toggle = mutation({
  args: { id: v.id("reminders"), checked: v.boolean() },
  handler: async (ctx, { id, checked }) => {
    await ctx.db.patch(id, { checked });
  },
});

export const update = mutation({
  args: { id: v.id("reminders"), text: v.string() },
  handler: async (ctx, { id, text }) => {
    await ctx.db.patch(id, { text });
  },
});

export const remove = mutation({
  args: { id: v.id("reminders") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});

export const removeChecked = mutation({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("reminders").collect();
    await Promise.all(all.filter((r) => r.checked).map((r) => ctx.db.delete(r._id)));
  },
});
