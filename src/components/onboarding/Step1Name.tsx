"use client";

import { useState } from "react";

interface Step1NameProps {
  name: string;
  onUpdate: (updates: { name: string }) => void;
  onNext: () => void;
}

export default function Step1Name({ name: initialName, onUpdate, onNext }: Step1NameProps) {
  const [name, setName] = useState(initialName || "");
  const [error, setError] = useState("");

  const handleSubmit = () => {
    const trimmedName = name.trim();
    if (!trimmedName) { setError("Please enter your name"); return; }
    if (trimmedName.length < 2) { setError("Name must be at least 2 characters"); return; }
    onUpdate({ name: trimmedName });
    onNext();
  };

  return (
    <div className="flex-1 flex flex-col justify-center px-6">
      <h1 className="text-3xl font-extrabold text-white text-center mb-2">
        Welcome to Still Here
      </h1>
      <p className="text-base text-gray-400 text-center mb-10">
        A simple daily check-in for peace of mind
      </p>

      <div className="mb-6">
        <label className="block text-base text-gray-300 font-semibold mb-2">
          What&apos;s your name?
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => { setName(e.target.value); setError(""); }}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          placeholder="Enter your name"
          autoFocus
          autoComplete="name"
          className={`w-full rounded-md p-4 text-lg text-white border outline-none transition-colors
            ${error
              ? "border-danger bg-gray-900"
              : "border-gray-700 bg-gray-900 focus:border-accent-dark"
            }`}
          style={{ backgroundColor: "var(--gray-900)" }}
        />
        {error && (
          <p className="text-danger text-sm mt-1">{error}</p>
        )}
      </div>

      <button
        onClick={handleSubmit}
        className="w-full py-4 rounded-md text-base font-bold transition-all btn-press"
        style={{
          backgroundColor: "var(--accent)",
          color: "var(--bg)",
        }}
      >
        Continue
      </button>
    </div>
  );
}
