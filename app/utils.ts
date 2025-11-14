import { NumberNode, ParsedValue } from "./types";

export const parseValue = (value: string): ParsedValue => {
  // Root node: just a number (no sign)
  if (!/^[+\-*/]/.test(value)) {
    return {
      sign: "",
      number: parseFloat(value),
      isRoot: true,
    };
  }
  
  // Child node: sign + number
  const sign = value[0];
  const number = parseFloat(value.slice(1));
  
  if (isNaN(number)) {
    throw new Error("Invalid number format");
  }
  
  return {
    sign,
    number,
    isRoot: false,
  };
};

export const calculateValue = (node: NumberNode, parentValue: number | null = null): number => {
  const parsed = parseValue(node.value);
  
  if (parsed.isRoot) {
    return parsed.number;
  }
  
  if (parentValue === null) {
    throw new Error("Child node must have a parent value");
  }
  
  switch (parsed.sign) {
    case "+":
      return parentValue + parsed.number;
    case "-":
      return parentValue - parsed.number;
    case "*":
      return parentValue * parsed.number;
    case "/":
      if (parsed.number === 0) {
        throw new Error("Division by zero");
      }
      return parentValue / parsed.number;
    default:
      throw new Error(`Unknown operator: ${parsed.sign}`);
  }
};

export const calculateTreeValues = (node: NumberNode, parentValue: number | null = null): void => {
  const calculated = calculateValue(node, parentValue);
  node.calculatedValue = calculated;
  
  node.children.forEach(child => {
    calculateTreeValues(child, calculated);
  });
};

export const getMaxDepth = (node: NumberNode | undefined, depth = 0): number => {
  if (!node) return depth;
  if (node.children.length === 0) return depth;
  return Math.max(depth, ...node.children.map(child => getMaxDepth(child, depth + 1)));
};

