"use client";

import React, { useState } from "react";
import { authClient } from "../lib/auth-client";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal = ({ isOpen, onClose }: AuthModalProps) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authError, setAuthError] = useState("");

  if (!isOpen) return null;

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    try {
      if (isSignUp) {
        await authClient.signUp.email({ email: authEmail, password: authPassword, name: authEmail.split("@")[0] });
      } else {
        await authClient.signIn.email({ email: authEmail, password: authPassword });
      }
      setAuthEmail("");
      setAuthPassword("");
      onClose();
    } catch (error: unknown) {
      setAuthError(error instanceof Error ? error.message : "Authentication failed");
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "white",
          padding: 30,
          borderRadius: 8,
          maxWidth: 400,
          width: "90%",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h2 style={{ margin: 0, fontSize: 20 }}>{isSignUp ? "Sign Up" : "Sign In"}</h2>
          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              fontSize: 24,
              cursor: "pointer",
              color: "#666",
              padding: 0,
              width: 30,
              height: 30,
            }}
          >
            ×
          </button>
        </div>
        <form onSubmit={handleAuth} style={{ display: "flex", flexDirection: "column", gap: 15 }}>
          <input
            type="email"
            value={authEmail}
            onChange={(e) => setAuthEmail(e.target.value)}
            placeholder="Email"
            required
            style={{ padding: 10, border: "1px solid #ccc", borderRadius: 4 }}
          />
          <input
            type="password"
            value={authPassword}
            onChange={(e) => setAuthPassword(e.target.value)}
            placeholder="Password"
            required
            style={{ padding: 10, border: "1px solid #ccc", borderRadius: 4 }}
          />
          {authError && (
            <span style={{ color: "#ef4444", fontSize: 14 }}>{authError}</span>
          )}
          <button
            type="submit"
            style={{ padding: 10, background: "#007bff", color: "white", border: "none", borderRadius: 4, cursor: "pointer" }}
          >
            {isSignUp ? "Sign Up" : "Sign In"}
          </button>
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setAuthError("");
            }}
            style={{ padding: 8, background: "transparent", border: "none", cursor: "pointer", color: "#666", textDecoration: "underline", fontSize: 14 }}
          >
            {isSignUp ? "Already have an account? Sign in" : "Don't have an account? Sign up"}
          </button>
        </form>
      </div>
    </div>
  );
};

