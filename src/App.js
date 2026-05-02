import React, { useState, useEffect } from "react";
import "./App.css";

const actions = [
  "OPEN_URL",
  "CLICK",
  "TYPE",
  "WAIT",
  "ASSERT_TEXT",
  "SCREENSHOT"
];

const locatorTypes = ["N/A", "css", "xpath", "id", "text"];
const assertions = ["", "equals", "contains", "visible"];

function App() {
  const [theme, setTheme] = useState("light");
  const [rows, setRows] = useState([createEmptyRow(1)]);
  const [output, setOutput] = useState("");

  const [isRunning, setIsRunning] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  function createEmptyRow(step) {
    return {
      step,
      action: "OPEN_URL",
      locatorType: "N/A",
      locatorValue: "",
      data: "",
      wait: "",
      assertion: "",
      description: ""
    };
  }

  // 🔥 WAKE UP BACKEND ON PAGE LOAD (FIXED URL)
  useEffect(() => {
    const wakeUpServer = async () => {
      try {
        console.log("Waking up backend...");
        await fetch("https://automation-backend-2-phfv.onrender.com/api/test/health");
        console.log("Backend is awake");
      } catch (error) {
        console.error("Wake-up failed:", error);
      }
    };

    wakeUpServer();
  }, []);

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  const addRow = () => {
    setRows([...rows, createEmptyRow(rows.length + 1)]);
  };

  const deleteRow = (index) => {
    const updated = rows
      .filter((_, i) => i !== index)
      .map((row, i) => ({ ...row, step: i + 1 }));
    setRows(updated);
  };

  const handleChange = (index, field, value) => {
    const updated = [...rows];
    updated[index][field] = value;

    if (field === "action" && value === "OPEN_URL") {
      updated[index].locatorType = "N/A";
      updated[index].locatorValue = "";
    }

    setRows(updated);
  };

  const generateJSON = () => {
    setOutput(JSON.stringify({ steps: rows }, null, 2));
  };

  // 🚀 RUN TEST WITH FIXED HEALTH CALL
  const runTest = async () => {
    if (isRunning) return;

    setIsRunning(true);

    try {
      setStatusMessage("⏳ Waking server...");
      await fetch("https://automation-backend-2-phfv.onrender.com/api/test/health");

      setStatusMessage("🚀 Running test...");

      const jsonData = JSON.stringify({ steps: rows });

      const response = await fetch(
        "https://automation-backend-2-phfv.onrender.com/api/test/run",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: jsonData
        }
      );

      const data = await response.json();

      setStatusMessage("✅ Test completed successfully!");

      const videoUrl = `https://automation-backend-2-phfv.onrender.com/api/test/video?path=${encodeURIComponent(
        data.videoPath
      )}`;

      window.open(videoUrl, "_blank");

    } catch (error) {
      console.error("Error:", error);
      setStatusMessage("❌ Failed to run test");
    } finally {
      setTimeout(() => {
        setIsRunning(false);
      }, 1000);
    }
  };

  return (
    <div className={`container ${theme}`}>
      <h2>🧪 Test Automation Builder</h2>

      <div className="controls">
        <button onClick={toggleTheme}>
          {theme === "light" ? "🌙 Dark Mode" : "☀️ Light Mode"}
        </button>

        <button onClick={addRow}>➕ Add Step</button>

        <button onClick={generateJSON}>📦 Generate JSON</button>

        <button
          onClick={runTest}
          disabled={isRunning}
          className={`run-btn ${isRunning ? "disabled-btn" : ""}`}
        >
          {isRunning ? (
            <>
              <span className="spinner"></span> Running...
            </>
          ) : (
            "▶ Run Test"
          )}
        </button>
      </div>

      {statusMessage && <p className="status">{statusMessage}</p>}

      <table>
        <thead>
          <tr>
            <th>Step</th>
            <th>Action</th>
            <th>Locator Type</th>
            <th>Locator Value</th>
            <th>Data</th>
            <th>Wait (ms)</th>
            <th>Assertion</th>
            <th>Description</th>
            <th>Delete</th>
          </tr>
        </thead>

        <tbody>
          {rows.map((row, index) => (
            <tr key={index}>
              <td>{row.step}</td>

              <td>
                <select
                  value={row.action}
                  onChange={(e) =>
                    handleChange(index, "action", e.target.value)
                  }
                >
                  {actions.map((a) => (
                    <option key={a}>{a}</option>
                  ))}
                </select>
              </td>

              <td>
                <select
                  value={row.locatorType}
                  disabled={row.action === "OPEN_URL"}
                  onChange={(e) =>
                    handleChange(index, "locatorType", e.target.value)
                  }
                >
                  {locatorTypes.map((l) => (
                    <option key={l}>{l}</option>
                  ))}
                </select>
              </td>

              <td>
                <input
                  value={row.locatorValue}
                  disabled={row.action === "OPEN_URL"}
                  onChange={(e) =>
                    handleChange(index, "locatorValue", e.target.value)
                  }
                />
              </td>

              <td>
                <input
                  value={row.data}
                  onChange={(e) =>
                    handleChange(index, "data", e.target.value)
                  }
                />
              </td>

              <td>
                <input
                  type="number"
                  value={row.wait}
                  onChange={(e) =>
                    handleChange(index, "wait", e.target.value)
                  }
                />
              </td>

              <td>
                <select
                  value={row.assertion}
                  onChange={(e) =>
                    handleChange(index, "assertion", e.target.value)
                  }
                >
                  {assertions.map((a) => (
                    <option key={a}>{a}</option>
                  ))}
                </select>
              </td>

              <td>
                <input
                  value={row.description}
                  onChange={(e) =>
                    handleChange(index, "description", e.target.value)
                  }
                />
              </td>

              <td>
                <button className="delete" onClick={() => deleteRow(index)}>
                  X
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3>Generated JSON</h3>
      <textarea value={output} readOnly />
    </div>
  );
}

export default App;