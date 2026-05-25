import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("events").order("asc").collect();
  },
});

export const todayCount = query({
  args: { todayDate: v.string() },
  handler: async (ctx, { todayDate }) => {
    const all = await ctx.db.query("events").collect();
    return all.filter((e) => {
      if (e.date === todayDate) return true;
      if (!e.recurrence) return false;
      // For recurring events, check if today matches a recurrence
      // (simplified: just return true if it's a recurring event — client handles display date)
      return false;
    }).length;
  },
});

export const add = mutation({
  args: {
    title: v.string(),
    date: v.string(),
    time: v.optional(v.string()),
    endTime: v.optional(v.string()),
    location: v.optional(v.string()),
    notes: v.optional(v.string()),
    recurrence: v.optional(v.string()),
    order: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("events", args);
  },
});

export const update = mutation({
  args: {
    id: v.id("events"),
    title: v.optional(v.string()),
    date: v.optional(v.string()),
    time: v.optional(v.string()),
    endTime: v.optional(v.string()),
    location: v.optional(v.string()),
    notes: v.optional(v.string()),
    recurrence: v.optional(v.string()),
  },
  handler: async (ctx, { id, ...fields }) => {
    await ctx.db.patch(id, fields);
  },
});

export const remove = mutation({
  args: { id: v.id("events") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});
