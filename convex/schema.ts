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
    order: v.number(),
  }),
  categories: defineTable({
    name: v.string(),
    order: v.number(),
  }),
});
