import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  resources: defineTable({
    type: v.union(v.literal("link"), v.literal("file"), v.literal("note"), v.literal("embed")),
    label: v.string(),
    url: v.optional(v.string()),
    filePath: v.optional(v.string()),
    content: v.optional(v.string()),
    embedUrl: v.optional(v.string()),
    category: v.string(),
    categories: v.optional(v.array(v.string())),
    pinned: v.optional(v.boolean()),
    order: v.number(),
  }),
  categories: defineTable({
    name: v.string(),
    order: v.number(),
  }),
  printJobs: defineTable({
    status: v.union(v.literal("not-started"), v.literal("in-progress"), v.literal("done")),
    descriptor: v.string(),
    product: v.string(),
    customer: v.string(),
    produce: v.optional(v.string()),
    shipDate: v.optional(v.string()),
    shipBy: v.optional(v.string()),
    order: v.number(),
  }),
  events: defineTable({
    title: v.string(),
    date: v.string(),
    time: v.optional(v.string()),
    endTime: v.optional(v.string()),
    location: v.optional(v.string()),
    notes: v.optional(v.string()),
    order: v.number(),
  }),
});
