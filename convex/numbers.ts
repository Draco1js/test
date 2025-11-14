import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const addNumber = mutation({
	args: {
		value: v.string(),
		parent: v.optional(v.id("numbers")),
	},
	handler: async (ctx, args) => {
		const user = await ctx.auth.getUserIdentity();
		if (!user || !user.email) {
			return new ConvexError("Not Authenticated, cannot add new numbers")
		}
		const id = await ctx.db.insert("numbers", {
			value: args.value,
			user: user.email,
			parentId: args.parent ?? null,
		});
		return id;
	},
});

export const getAllNumbers = query({
	args: {},
	handler: async (ctx) => {
		return await ctx.db.query("numbers").collect();
	},
});

export const deleteAllNumbers = mutation({
	args: {},
	handler: async (ctx) => {
		const user = await ctx.auth.getUserIdentity()
		if (!user || !user.email) {
			return new ConvexError("Not Authenticated, cannot delete numbers")
		}
		const allNumbers = await ctx.db.query("numbers").collect();
		for (const number of allNumbers) {
			await ctx.db.delete(number._id);
		}
		return allNumbers.length;
	},
});