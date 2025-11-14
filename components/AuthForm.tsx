"use client";

import React, { useState } from "react";
import { authClient } from "../lib/auth-client";

export const AuthForm = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authError, setAuthError] = useState("");

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
    } catch (error: unknown) {
      setAuthError(error instanceof Error ? error.message : "Authentication failed");
    }
  };

  return (
    <main style={{ maxWidth: 400, margin: "100px auto", padding: 20 }}>
      <h1 style={{ marginBottom: 30, textAlign: "center" }}>Tree Platform</h1>
      <form onSubmit={handleAuth} style={{ display: "flex", flexDirection: "column", gap: 15 }}>
        <h2 style={{ margin: 0, fontSize: 18 }}>{isSignUp ? "Sign Up" : "Sign In"}</h2>
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
          style={{ padding: 8, background: "transparent", border: "none", cursor: "pointer", color: "#666", textDecoration: "underline" }}
        >
          {isSignUp ? "Already have an account? Sign in" : "Don't have an account? Sign up"}
        </button>
      </form>
    </main>
  );
};

