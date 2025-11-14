"use client";

import React from "react";
import { authClient } from "../lib/auth-client";

interface HeaderProps {
  userEmail?: string | null;
  onLoginClick: () => void;
}

export const Header = ({ userEmail, onLoginClick }: HeaderProps) => {
  const handleSignOut = async () => {
    await authClient.signOut();
  };

  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
      <h1 style={{ margin: 0 }}>Tree Platform</h1>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {userEmail ? (
          <>
            <span style={{ fontSize: 14, color: "#666" }}>{userEmail}</span>
            <button
              onClick={handleSignOut}
              style={{ padding: "6px 12px", background: "#6c757d", color: "white", border: "none", borderRadius: 4, cursor: "pointer", fontSize: 12 }}
            >
              Sign Out
            </button>
          </>
        ) : (
          <button
            onClick={onLoginClick}
            style={{ padding: "6px 12px", background: "#007bff", color: "white", border: "none", borderRadius: 4, cursor: "pointer", fontSize: 12 }}
          >
            Sign In
          </button>
        )}
      </div>
    </div>
  );
};

