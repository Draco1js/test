"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";
import { authClient } from "../lib/auth-client";
import { Header } from "../components/Header";
import { AuthModal } from "../components/AuthModal";
import { RootNodeForm } from "../components/RootNodeForm";
import { TreeVisualization } from "../components/TreeVisualization";
import { NumberNode } from "./types";
import { calculateTreeValues } from "./utils";

const Home = () => {
  const [inputValue, setInputValue] = useState("");
  const [inputError, setInputError] = useState("");
  const [selectedParentId, setSelectedParentId] = useState<Id<"numbers"> | null>(null);
  const [selectedParentPosition, setSelectedParentPosition] = useState<{ x: number; y: number } | null>(null);
  const [rootInputValue, setRootInputValue] = useState("");
  const [rootInputError, setRootInputError] = useState("");
  const [hoveredNode, setHoveredNode] = useState<{ x: number; y: number; email: string } | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  
  const addNumber = useMutation(api.numbers.addNumber);
  const deleteAllNumbers = useMutation(api.numbers.deleteAllNumbers);
  const allNumbers = useQuery(api.numbers.getAllNumbers);
  
  const session = authClient.useSession();
  const isAuthenticated = !!session?.data?.user;
  const userEmail = session?.data?.user?.email || null;

  const validateInput = (value: string, isRoot: boolean, setError: (msg: string) => void): boolean => {
    if (!value.trim()) {
      setError("Input cannot be empty");
      return false;
    }

    if (isRoot) {
      if (/^[+\-*/]/.test(value)) {
        setError("Root node should be a number without a sign");
        return false;
      }
      const num = parseFloat(value);
      if (isNaN(num)) {
        setError("Root must be a valid number");
        return false;
      }
    } else {
      if (!/^[+\-*/]/.test(value)) {
        setError("Child node must start with +, -, *, or /");
        return false;
      }
      const sign = value[0];
      const numStr = value.slice(1);
      if (!numStr.trim()) {
        setError("Number is required after the sign");
        return false;
      }
      const num = parseFloat(numStr);
      if (isNaN(num)) {
        setError("Invalid number after sign");
        return false;
      }
      if (sign === "/" && num === 0) {
        setError("Cannot divide by zero");
        return false;
      }
    }

    setError("");
    return true;
  };

  const { treeRoots, orphanedNodes } = useMemo(() => {
    if (!allNumbers) return { treeRoots: [], orphanedNodes: [] };
    
    const nodeMap = new Map<Id<"numbers">, NumberNode>();
    allNumbers.forEach((n) => {
      nodeMap.set(n._id, { ...n, children: [], user: n.user || "" });
    });

    const roots: NumberNode[] = [];
    const childrenMap = new Map<Id<"numbers">, NumberNode[]>();
    const orphanedNodes: NumberNode[] = [];
    
    allNumbers.forEach((n) => {
      if (n.parentId === null) {
        roots.push(nodeMap.get(n._id)!);
      } else {
        if (nodeMap.has(n.parentId)) {
          const children = childrenMap.get(n.parentId) || [];
          children.push(nodeMap.get(n._id)!);
          childrenMap.set(n.parentId, children);
        } else {
          orphanedNodes.push(nodeMap.get(n._id)!);
        }
      }
    });

    childrenMap.forEach((children, parentId) => {
      const parent = nodeMap.get(parentId);
      if (parent) {
        parent.children = children;
      }
    });

    roots.forEach(root => {
      calculateTreeValues(root);
    });
    
    orphanedNodes.forEach(node => {
      calculateTreeValues(node);
    });

    return { treeRoots: roots, orphanedNodes };
  }, [allNumbers]);

  const handleNodeClick = (nodeId: Id<"numbers">, x: number, y: number) => {
    if (!isAuthenticated) return;
    setSelectedParentId(nodeId);
    setSelectedParentPosition({ x, y });
    setInputValue("");
    setInputError("");
  };

  const handleChildSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (inputValue.trim().length === 0) return;
    if (!selectedParentId || !isAuthenticated) return;
    
    if (!validateInput(inputValue, false, setInputError)) {
      return;
    }
    
    try {
      await addNumber({ 
        value: inputValue.trim(), 
        parent: selectedParentId 
      });
      setInputValue("");
      setSelectedParentId(null);
      setSelectedParentPosition(null);
      setInputError("");
    } catch {
      setInputError("Failed to add node. Please sign in.");
    }
  };

  const handleRootSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rootInputValue.trim().length === 0 || !isAuthenticated) return;
    
    if (!validateInput(rootInputValue, true, setRootInputError)) {
      return;
    }
    
    try {
      await addNumber({ 
        value: rootInputValue.trim(), 
        parent: undefined 
      });
      setRootInputValue("");
      setRootInputError("");
    } catch {
      setRootInputError("Failed to add node. Please sign in.");
    }
  };

  const cancelChildInput = () => {
    setSelectedParentId(null);
    setSelectedParentPosition(null);
    setInputValue("");
    setInputError("");
  };

  // Handle Escape key to close input
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && selectedParentId) {
        cancelChildInput();
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [selectedParentId]);

  const handleReset = async () => {
    if (confirm("Are you sure you want to delete all nodes? This cannot be undone.")) {
      try {
        await deleteAllNumbers();
        setSelectedParentId(null);
        setSelectedParentPosition(null);
        setInputValue("");
        setRootInputValue("");
      } catch {
        alert("Failed to reset. Please sign in.");
      }
    }
  };

  const handleNodeHover = (x: number, y: number, email: string) => {
    if (email) {
      const svgElement = document.querySelector('svg');
      if (svgElement) {
        const svgRect = svgElement.getBoundingClientRect();
        const screenX = svgRect.left + x;
        const screenY = svgRect.top + y;
        setHoveredNode({ x: screenX, y: screenY, email });
      } else {
        setHoveredNode({ x, y, email });
      }
    } else {
      setHoveredNode(null);
    }
  };

  // Count total nodes being displayed (for debugging)
  const countDisplayedNodes = (node: NumberNode): number => {
    let count = 1;
    node.children.forEach(child => {
      count += countDisplayedNodes(child);
    });
    return count;
  };

  const totalDisplayedNodes = treeRoots.reduce((sum, root) => sum + countDisplayedNodes(root), 0) + orphanedNodes.length;

  return (
    <main style={{ maxWidth: "100%", margin: "40px auto", padding: 20 }}>
      <Header userEmail={userEmail} onLoginClick={() => setShowAuthModal(true)} />
      
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
      
      <RootNodeForm
        rootInputValue={rootInputValue}
        setRootInputValue={setRootInputValue}
        rootInputError={rootInputError}
        onSubmit={handleRootSubmit}
        onReset={handleReset}
        allNumbersCount={allNumbers?.length || 0}
        isAuthenticated={isAuthenticated}
      />

      {allNumbers && (
        <p style={{ marginTop: 4, fontSize: 12, color: "#999" }}>
          Total nodes in database: {allNumbers.length} | Root nodes: {treeRoots.length} | Orphaned nodes: {orphanedNodes.length} | Total displayed: {totalDisplayedNodes}
          {allNumbers.length !== totalDisplayedNodes && (
            <span style={{ color: "#ef4444", marginLeft: 8 }}>
              ⚠️ Mismatch detected - some nodes may not be properly linked
            </span>
          )}
        </p>
      )}

      <div style={{ marginTop: 20 }}>
        {!allNumbers ? (
          <p>Loading…</p>
        ) : allNumbers.length === 0 ? (
          <p>No numbers yet. {isAuthenticated ? "Add a root number to start building the tree!" : "Sign in to add numbers to the tree."}</p>
        ) : (
          <TreeVisualization
            treeRoots={treeRoots}
            orphanedNodes={orphanedNodes}
            onSelectParent={handleNodeClick}
            onHover={handleNodeHover}
            selectedParentId={selectedParentId}
            selectedParentPosition={selectedParentPosition}
            inputValue={inputValue}
            setInputValue={setInputValue}
            inputError={inputError}
            onChildSubmit={handleChildSubmit}
            onCancelInput={cancelChildInput}
            isAuthenticated={isAuthenticated}
          />
        )}
      </div>
      
      {/* Tooltip for showing email on hover */}
      {hoveredNode && hoveredNode.email && (
        <div
          style={{
            position: "fixed",
            left: `${hoveredNode.x}px`,
            top: `${hoveredNode.y}px`,
            background: "rgba(0, 0, 0, 0.8)",
            color: "white",
            padding: "6px 10px",
            borderRadius: 4,
            fontSize: 12,
            pointerEvents: "none",
            zIndex: 1000,
            transform: "translate(-100%, -50%)",
            whiteSpace: "nowrap",
            marginLeft: "-10px",
          }}
        >
          Added by: {hoveredNode.email}
        </div>
      )}
    </main>
  );
};

export default Home;
