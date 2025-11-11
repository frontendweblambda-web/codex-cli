import { useState } from "react";

export default function App() {
  const [state, setState] = useState(0);
  return (
    <div
      style={{
        textAlign: "center",
        padding: "4rem",
        fontFamily: "sans-serif",
      }}
    >
      <button onClick={() => setState((prev) => prev + 1)}>inc</button>
      <h1>🚀 Codex React App {state}</h1>
      <p>Your React + Vite app is ready!</p>
    </div>
  );
}
