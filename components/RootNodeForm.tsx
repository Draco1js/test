"use client";

import React from "react";

interface RootNodeFormProps {
  rootInputValue: string;
  setRootInputValue: (value: string) => void;
  rootInputError: string;
  onSubmit: (e: React.FormEvent) => void;
  onReset: () => void;
  allNumbersCount: number;
  isAuthenticated: boolean;
}

export const RootNodeForm = ({
  rootInputValue,
  setRootInputValue,
  rootInputError,
  onSubmit,
  onReset,
  allNumbersCount,
  isAuthenticated,
}: RootNodeFormProps) => {
  if (!isAuthenticated) {
    return (
      <div style={{ marginBottom: 30 }}>
        <p style={{ fontSize: 14, color: "#666" }}>
          Sign in to add nodes to the tree
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} style={{ marginBottom: 30 }}>
      <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <input
            type="text"
            value={rootInputValue}
            onChange={(e) => setRootInputValue(e.target.value)}
            placeholder="10 (root number)"
            style={{ 
              padding: 8, 
              width: 200, 
              border: rootInputError ? "1px solid #ef4444" : "1px solid black" 
            }}
          />
          {rootInputError && (
            <span style={{ fontSize: 12, color: "#ef4444" }}>{rootInputError}</span>
          )}
        </div>
        <button type="submit" style={{ padding: "8px 16px" }}>
          Add Root Node
        </button>
        {allNumbersCount > 0 && (
          <button
            type="button"
            onClick={onReset}
            style={{ 
              padding: "8px 16px", 
              background: "#ef4444", 
              color: "white", 
              border: "none", 
              borderRadius: 4,
              cursor: "pointer"
            }}
          >
            Reset Canvas
          </button>
        )}
      </div>
      <p style={{ marginTop: 8, fontSize: 14, color: "#666" }}>
        Click on any node to add a child, or add a root node above
      </p>
    </form>
  );
};

