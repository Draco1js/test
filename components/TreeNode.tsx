"use client";

import React from "react";
import { NumberNode } from "../app/types";
import { Id } from "../convex/_generated/dataModel";
import { parseValue } from "../app/utils";

interface TreeNodeProps {
  node: NumberNode;
  level?: number;
  x?: number;
  y?: number;
  maxDepth?: number;
  onSelectParent: (id: Id<"numbers">, x: number, y: number) => void;
  onHover: (x: number, y: number, email: string) => void;
}

export const TreeNode = ({ 
  node, 
  level = 0, 
  x = 0, 
  y = 0, 
  maxDepth = 5, 
  onSelectParent, 
  onHover 
}: TreeNodeProps) => {
  const nodeSize = 45;
  const minNodeSpacing = nodeSize * 2.5; // Increased from 1.5
  const verticalSpacing = 140; // Increased from 100
  const childY = y + verticalSpacing;

  const parsed = parseValue(node.value);
  const displayText = parsed.isRoot ? node.value : `${parsed.sign}${parsed.number}`;
  const result = node.calculatedValue ?? 0;

  // Calculate positions for all children
  const childCount = node.children.length;
  const childPositions: { x: number; y: number }[] = [];
  
  if (childCount > 0) {
    const baseSpacing = minNodeSpacing;
    const levelMultiplier = 1 + (level * 0.5); // Increased from 0.3
    const spacingPerChild = baseSpacing * levelMultiplier;
    
    const totalWidth = spacingPerChild * (childCount - 1);
    const startX = x - totalWidth / 2;
    
    for (let i = 0; i < childCount; i++) {
      childPositions.push({
        x: startX + spacingPerChild * i,
        y: childY
      });
    }
  }

  return (
    <g>
      {/* Lines to children */}
      {node.children.map((child, index) => {
        const childPos = childPositions[index];
        if (!childPos) return null;
        return (
          <line
            key={child._id}
            x1={x}
            y1={y + nodeSize / 2}
            x2={childPos.x}
            y2={childPos.y}
            stroke="currentColor"
            strokeWidth="2"
          />
        );
      })}
      
      {/* Node circle */}
      <circle
        cx={x}
        cy={y}
        r={nodeSize / 2}
        fill="var(--background)"
        stroke="currentColor"
        strokeWidth="2"
        className="cursor-pointer hover:fill-gray-200"
        onClick={() => onSelectParent(node._id, x, y)}
        onMouseEnter={() => onHover(x, y, node.user)}
        onMouseLeave={() => onHover(0, 0, "")}
      />
      
      {/* Sign and number inside node */}
      <text
        x={x}
        y={y}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize="14"
        fontWeight="bold"
        className="pointer-events-none select-none"
      >
        {displayText}
      </text>
      
      {/* Calculated result next to node */}
      <text
        x={x + nodeSize / 2 + 10}
        y={y}
        textAnchor="start"
        dominantBaseline="middle"
        fontSize="12"
        fill="#666"
        className="pointer-events-none select-none"
      >
        = {Number.isInteger(result) ? result.toString() : result.toFixed(2)}
      </text>
      
      {/* Recursively render all children */}
      {node.children.map((child, index) => {
        const childPos = childPositions[index];
        if (!childPos) return null;
        return (
          <TreeNode
            key={child._id}
            node={child}
            level={level + 1}
            x={childPos.x}
            y={childPos.y}
            maxDepth={maxDepth}
            onSelectParent={onSelectParent}
            onHover={onHover}
          />
        );
      })}
    </g>
  );
};

