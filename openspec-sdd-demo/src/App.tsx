import { useState } from "react";
import { APITester } from "./APITester";
import "./index.css";

import logo from "./logo.svg";
import reactLogo from "./react.svg";
import { SearchInput } from "./components/SearchInput";

function SearchDemo() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  function handleSearch(value: string) {
    if (!value.trim()) {
      setResult(null);
      return;
    }
    setLoading(true);
    setResult(null);
    // 模拟异步搜索
    setTimeout(() => {
      setLoading(false);
      setResult(`搜索 "${value}" 完成，共找到 42 条结果`);
    }, 1000);
  }

  return (
    <div style={{ marginTop: "1.5rem", textAlign: "left", maxWidth: "400px" }}>
      <h2 style={{ fontSize: "1rem", marginBottom: "0.5rem" }}>SearchInput Demo</h2>
      <SearchInput
        value={query}
        onChange={setQuery}
        onSearch={handleSearch}
        loading={loading}
        debounceDelay={400}
        placeholder="输入关键词搜索..."
      />
      {result && (
        <p style={{ marginTop: "0.5rem", fontSize: "0.875rem", color: "#374151" }}>
          {result}
        </p>
      )}
      <p style={{ marginTop: "0.25rem", fontSize: "0.75rem", color: "#9ca3af" }}>
        当前值："{query}" · 防抖延迟：400ms
      </p>
    </div>
  );
}

export function App() {
  return (
    <div className="app">
      <div className="logo-container">
        <img src={logo} alt="Bun Logo" className="logo bun-logo" />
        <img src={reactLogo} alt="React Logo" className="logo react-logo" />
      </div>

      <h1>Bun + React</h1>
      <p>
        Edit <code>src/App.tsx</code> and save to test HMR
      </p>
      <SearchDemo />
      <APITester />
    </div>
  );
}

export default App;
