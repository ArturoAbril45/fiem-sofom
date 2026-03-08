"use client";

import { useEffect } from "react";

export default function Loader() {
  useEffect(() => {
    const t = setTimeout(() => {
      window.location.href = "/dashboard";
    }, 5000);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="loader-screen">
      <div className="letters">
        {["F", "I", "E", "M"].map((l, i) => (
          <span key={l} className="letter" style={{ animationDelay: `${i * 0.15}s` }}>
            {l}
          </span>
        ))}
      </div>
      <p className="loader-msg">Cargando tu cuenta...</p>
      <div className="loader-dots">
        <span className="dot" style={{ animationDelay: "0s" }} />
        <span className="dot" style={{ animationDelay: "0.2s" }} />
        <span className="dot" style={{ animationDelay: "0.4s" }} />
      </div>

      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@400;500&display=swap');
        .loader-screen {
          position: fixed; inset: 0;
          background: #0d1f5c;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          gap: 28px;
          animation: fadeIn 0.4s ease both;
          z-index: 100;
        }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .letters { display: flex; gap: 12px; }
        .letter {
          font-family: 'DM Serif Display', serif;
          font-size: 72px; color: #fff; line-height: 1;
          display: inline-block;
          animation: bounce 0.6s cubic-bezier(0.36,0.07,0.19,0.97) infinite alternate both;
          text-shadow: 0 4px 24px rgba(21,101,192,0.6);
        }
        @keyframes bounce {
          from { transform: translateY(0px) scale(1); opacity: 0.4; }
          to   { transform: translateY(-18px) scale(1.08); opacity: 1; }
        }
        .loader-msg {
          font-size: 15px; font-weight: 500;
          color: rgba(255,255,255,0.55);
          letter-spacing: 0.04em;
          font-family: 'DM Sans', system-ui, sans-serif;
        }
        .loader-dots { display: flex; gap: 8px; }
        .dot {
          width: 8px; height: 8px;
          background: rgba(255,255,255,0.3); border-radius: 50%;
          animation: pulse 0.9s ease-in-out infinite alternate both;
        }
        @keyframes pulse {
          from { background: rgba(255,255,255,0.15); transform: scale(0.8); }
          to   { background: rgba(255,255,255,0.85); transform: scale(1.2); }
        }
      `}</style>
    </div>
  );
}