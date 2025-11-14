import { Id } from "../convex/_generated/dataModel";

export type NumberNode = {
  _id: Id<"numbers">;
  value: string;
  parentId: Id<"numbers"> | null;
  user: string;
  children: NumberNode[];
  calculatedValue?: number;
};

export type ParsedValue = {
  sign: string;
  number: number;
  isRoot: boolean;
};

