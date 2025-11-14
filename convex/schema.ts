import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  numbers: defineTable({
    value: v.string(),
    user:v.string(),
    parentId: v.union(v.id("numbers"), v.null())
  }).index("parentId", ["parentId"]),
});
