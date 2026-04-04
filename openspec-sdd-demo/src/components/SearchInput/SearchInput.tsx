import { useEffect, useRef, useState } from "react";

export interface SearchInputProps {
  value?: string;
  onChange?: (value: string) => void;
  onSearch?: (value: string) => void;
  loading?: boolean;
  debounceDelay?: number;
  placeholder?: string;
}

export function SearchInput({
  value,
  onChange,
  onSearch,
  loading = false,
  debounceDelay = 300,
  placeholder = "搜索...",
}: SearchInputProps) {
  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState("");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const displayValue = isControlled ? value : internalValue;

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const newValue = e.target.value;

    if (!isControlled) {
      setInternalValue(newValue);
    }
    onChange?.(newValue);

    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = setTimeout(() => {
      onSearch?.(newValue);
      timerRef.current = null;
    }, debounceDelay);
  }

  return (
    <div style={{ position: "relative", display: "inline-flex", alignItems: "center" }}>
      <input
        type="text"
        value={displayValue}
        onChange={handleChange}
        placeholder={placeholder}
        style={{
          paddingRight: "2rem",
          padding: "0.5rem 2.25rem 0.5rem 0.75rem",
          border: "1px solid #ccc",
          borderRadius: "0.375rem",
          fontSize: "0.875rem",
          outline: "none",
          width: "100%",
          boxSizing: "border-box",
        }}
      />
      <span
        style={{
          position: "absolute",
          right: "0.5rem",
          display: "flex",
          alignItems: "center",
          visibility: loading ? "visible" : "hidden",
          pointerEvents: "none",
        }}
        aria-hidden={!loading}
      >
        <Spinner />
      </span>
    </div>
  );
}

function Spinner() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{
        animation: "spin 0.75s linear infinite",
        color: "#6b7280",
      }}
    >
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}
