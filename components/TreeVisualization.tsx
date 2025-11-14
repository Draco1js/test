"use client";

import React from "react";
import { NumberNode } from "../app/types";
import { Id } from "../convex/_generated/dataModel";
import { TreeNode } from "./TreeNode";
import { getMaxDepth, parseValue } from "../app/utils";

interface TreeVisualizationProps {
  treeRoots: NumberNode[];
  orphanedNodes: NumberNode[];
  onSelectParent: (id: Id<"numbers">, x: number, y: number) => void;
  onHover: (x: number, y: number, email: string) => void;
  selectedParentId: Id<"numbers"> | null;
  selectedParentPosition: { x: number; y: number } | null;
  inputValue: string;
  setInputValue: (value: string) => void;
  inputError: string;
  onChildSubmit: (e: React.FormEvent) => void;
  onCancelInput: () => void;
  isAuthenticated: boolean;
}

export const TreeVisualization = ({
  treeRoots,
  orphanedNodes,
  onSelectParent,
  onHover,
  selectedParentId,
  selectedParentPosition,
  inputValue,
  setInputValue,
  inputError,
  onChildSubmit,
  onCancelInput,
  isAuthenticated,
}: TreeVisualizationProps) => {
  const getTreeBounds = () => {
    const nodeSize = 45;
    const minNodeSpacing = nodeSize * 2.5;
    const verticalSpacing = 140;

    let maxDepth = 0;
    if (treeRoots.length > 0) {
      maxDepth = Math.max(...treeRoots.map((root) => getMaxDepth(root)));
    }
    const actualMaxDepth = Math.max(maxDepth, 1);

    // Calculate actual width needed based on root nodes
    const rootSpacing = 500; // Space between root nodes
    const rootsWidth =
      treeRoots.length > 0 ? (treeRoots.length - 1) * rootSpacing : 0;

    // Estimate width needed for deepest level
    const maxChildrenEstimate = 5;
    const deepestLevelSpacing = minNodeSpacing * (1 + actualMaxDepth * 0.5);
    const deepestLevelWidth = deepestLevelSpacing * maxChildrenEstimate;

    // Use the larger of roots width or deepest level estimate, with minimum
    const estimatedWidth = Math.max(rootsWidth, deepestLevelWidth, 800);

    const orphanedRows =
      orphanedNodes.length > 0 ? Math.ceil(orphanedNodes.length / 5) : 0;
    const height =
      actualMaxDepth * verticalSpacing +
      nodeSize +
      30 +
      (orphanedRows > 0 ? orphanedRows * 120 + 50 : 0);

    return { width: estimatedWidth, height, maxDepth: actualMaxDepth };
  };

  const bounds = getTreeBounds();
  const svgWidth = Math.max(bounds.width, 1000);
  const svgHeight = Math.max(bounds.height, 600);
  // Center the tree in the SVG viewport (which is centered in the container)
  const centerX = svgWidth / 2;

  return (
    <div
      style={{
        overflow: "auto",
        border: "1px solid #ddd",
        borderRadius: 8,
        padding: 20,
        background: "var(--background)",
        height: "75vh",
        width: "100%",
        position: "relative",
      }}
    >
      <div style={{ display: "flex", justifyContent: "center", width: "100%" }}>
        <svg
          width={svgWidth}
          height={svgHeight}
          style={{ display: "block" }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              onCancelInput();
            }
          }}
        >
          {treeRoots.map((root, index) => (
            <TreeNode
              key={root._id}
              node={root}
              x={centerX + (index - (treeRoots.length - 1) / 2) * 500}
              y={50}
              maxDepth={bounds.maxDepth}
              onSelectParent={onSelectParent}
              onHover={onHover}
            />
          ))}

          {/* Orphaned nodes section */}
          {orphanedNodes.length > 0 && (
            <g>
              <text
                x={50}
                y={bounds.height - 50}
                fontSize="14"
                fontWeight="bold"
                fill="#ef4444"
              >
                Orphaned Nodes (parent not found):
              </text>
              {orphanedNodes.map((node, index) => {
                const orphanX = 50 + (index % 5) * 180;
                const orphanY =
                  bounds.height - 20 + Math.floor(index / 5) * 100;
                const parsed = parseValue(node.value);
                return (
                  <g key={node._id}>
                    <circle
                      cx={orphanX}
                      cy={orphanY}
                      r={22.5}
                      fill="var(--background)"
                      stroke="#ef4444"
                      strokeWidth="2"
                      strokeDasharray="5,5"
                      className="cursor-pointer hover:fill-gray-200"
                      onClick={() => onSelectParent(node._id, orphanX, orphanY)}
                      onMouseEnter={() => onHover(orphanX, orphanY, node.user)}
                      onMouseLeave={() => onHover(0, 0, "")}
                    />
                    <text
                      x={orphanX}
                      y={orphanY}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fontSize="12"
                      fontWeight="bold"
                      className="pointer-events-none select-none"
                    >
                      {parsed.isRoot
                        ? node.value
                        : `${parsed.sign}${parsed.number}`}
                    </text>
                    <text
                      x={orphanX + 22.5 + 5}
                      y={orphanY}
                      textAnchor="start"
                      dominantBaseline="middle"
                      fontSize="10"
                      fill="#666"
                      className="pointer-events-none select-none"
                    >
                      ={" "}
                      {Number.isInteger(node.calculatedValue ?? 0)
                        ? (node.calculatedValue ?? 0).toString()
                        : (node.calculatedValue ?? 0).toFixed(2)}
                    </text>
                  </g>
                );
              })}
            </g>
          )}

          {/* Input form positioned near selected node */}
          {selectedParentId && selectedParentPosition && isAuthenticated && (
            <foreignObject
              x={selectedParentPosition.x + 30}
              y={selectedParentPosition.y - 20}
              width="200"
              height="80"
            >
              <form
                onSubmit={onChildSubmit}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 4,
                  background: "white",
                  padding: 8,
                  borderRadius: 4,
                  border: "1px solid #ccc",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="+5, -10, *3, /2"
                  autoFocus
                  style={{
                    padding: 6,
                    width: "100%",
                    border: inputError ? "1px solid #ef4444" : "1px solid #ccc",
                    fontSize: 12,
                  }}
                />
                {inputError && (
                  <span style={{ fontSize: 10, color: "#ef4444" }}>
                    {inputError}
                  </span>
                )}
                <div style={{ display: "flex", gap: 4 }}>
                  <button
                    type="submit"
                    style={{
                      padding: "4px 8px",
                      fontSize: 12,
                      background: "#007bff",
                      color: "white",
                      border: "none",
                      borderRadius: 2,
                      cursor: "pointer",
                    }}
                  >
                    Add
                  </button>
                  <button
                    type="button"
                    onClick={onCancelInput}
                    style={{
                      padding: "4px 8px",
                      fontSize: 12,
                      background: "#6c757d",
                      color: "white",
                      border: "none",
                      borderRadius: 2,
                      cursor: "pointer",
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </foreignObject>
          )}
        </svg>
      </div>
    </div>
  );
};
