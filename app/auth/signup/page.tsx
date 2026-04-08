"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import WealthLensLogo from "@/app/components/WealthLensLogo";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (password.length < 8) { setError("Password must be at least 8 characters."); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Signup failed."); return; }
      localStorage.setItem("wl_token", data.token);
      localStorage.setItem("wl_user", JSON.stringify(data.user));
      router.push("/dashboard");
    } catch {
      setError("Network error — please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ minHeight: "100vh", background: "#07060E", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px", fontFamily: "'Outfit', sans-serif", position: "relative", overflow: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,500;1,300&family=Outfit:wght@300;400;500;600&display=swap');
        @keyframes shimmerX { 0%{background-position:-200% center} 100%{background-position:200% center} }
        @keyframes aurora { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(30px,-20px) scale(1.06)} }
        .gold-text { background: linear-gradient(90deg,#8B6914,#C9A84C,#F0D080,#C9A84C,#8B6914); background-size:200% auto; -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; animation:shimmerX 4s linear infinite; }
        input:-webkit-autofill { -webkit-box-shadow: 0 0 0 100px #0f0d19 inset !important; -webkit-text-fill-color: #F5F0E8 !important; }
      `}</style>

      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
        <div style={{ position: "absolute", width: 500, height: 500, borderRadius: "50%", top: -150, right: -100, background: "radial-gradient(circle,rgba(201,168,76,0.1) 0%,transparent 70%)", filter: "blur(80px)", animation: "aurora 14s ease-in-out infinite" }} />
        <div style={{ position: "absolute", width: 400, height: 400, borderRadius: "50%", bottom: -100, left: -80, background: "radial-gradient(circle,rgba(255,107,157,0.07) 0%,transparent 70%)", filter: "blur(70px)", animation: "aurora 18s ease-in-out infinite reverse" }} />
      </div>

      <div style={{ position: "relative", zIndex: 10, width: "100%", maxWidth: 420 }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
            <WealthLensLogo size={36} />
            <span className="gold-text" style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 22, fontWeight: 600, letterSpacing: "0.14em" }}>WEALTHLENS</span>
          </div>
          <p style={{ color: "rgba(245,240,232,0.35)", fontSize: 13, letterSpacing: "0.05em", margin: 0 }}>Create your free account</p>
        </div>

        <div style={{ background: "rgba(15,13,25,0.85)", backdropFilter: "blur(40px)", border: "1px solid rgba(201,168,76,0.14)", borderRadius: 14, padding: "36px 32px" }}>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            {[
              { id: "signup-name", label: "FULL NAME", type: "text", value: name, setValue: setName, placeholder: "Aarav Shah", autoComplete: "name" },
              { id: "signup-email", label: "EMAIL ADDRESS", type: "email", value: email, setValue: setEmail, placeholder: "you@example.com", autoComplete: "email" },
              { id: "signup-password", label: "PASSWORD (MIN 8 CHARS)", type: "password", value: password, setValue: setPassword, placeholder: "••••••••", autoComplete: "new-password" },
            ].map(field => (
              <div key={field.id}>
                <label style={{ display: "block", fontSize: 10, letterSpacing: "0.2em", color: "rgba(201,168,76,0.7)", marginBottom: 8 }}>{field.label}</label>
                <input
                  id={field.id}
                  type={field.type} value={field.value}
                  onChange={e => field.setValue(e.target.value)}
                  autoComplete={field.autoComplete}
                  required
                  style={{ width: "100%", boxSizing: "border-box", padding: "13px 16px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(201,168,76,0.16)", borderRadius: 6, color: "#F5F0E8", fontSize: 14, outline: "none", transition: "border-color .2s", fontFamily: "'Outfit',sans-serif" }}
                  onFocus={e => (e.currentTarget.style.borderColor = "rgba(201,168,76,0.5)")}
                  onBlur={e => (e.currentTarget.style.borderColor = "rgba(201,168,76,0.16)")}
                  placeholder={field.placeholder}
                />
              </div>
            ))}

            {error && (
              <div style={{ padding: "10px 14px", background: "rgba(255,107,157,0.08)", border: "1px solid rgba(255,107,157,0.22)", borderRadius: 6, fontSize: 12, color: "#FF6B9D" }}>
                {error}
              </div>
            )}

            <button
              id="signup-submit"
              type="submit" disabled={loading}
              style={{ marginTop: 4, padding: "14px", borderRadius: 6, border: "none", cursor: loading ? "not-allowed" : "pointer", fontSize: 12, fontWeight: 600, letterSpacing: "0.1em", fontFamily: "'Outfit',sans-serif", background: "linear-gradient(135deg,#8B6914,#C9A84C,#F0D080,#C9A84C,#8B6914)", backgroundSize: "200% auto", animation: "shimmerX 3.5s linear infinite", color: "#07060E", opacity: loading ? 0.6 : 1, transition: "all .3s" }}
            >
              {loading ? "CREATING ACCOUNT…" : "CREATE ACCOUNT →"}
            </button>
          </form>

          <div style={{ marginTop: 24, textAlign: "center", borderTop: "1px solid rgba(201,168,76,0.08)", paddingTop: 22 }}>
            <span style={{ fontSize: 12, color: "rgba(245,240,232,0.3)" }}>Already have an account? </span>
            <Link href="/auth/login" style={{ fontSize: 12, color: "#C9A84C", textDecoration: "none", letterSpacing: "0.05em" }}>Sign in →</Link>
          </div>
        </div>

        <p style={{ textAlign: "center", marginTop: 20, fontSize: 10, letterSpacing: "0.12em", color: "rgba(245,240,232,0.15)" }}>
          🔐 BCRYPT ROUNDS=12 · JWT HS256 · ZERO DATA RETAINED
        </p>
      </div>
    </main>
  );
}
