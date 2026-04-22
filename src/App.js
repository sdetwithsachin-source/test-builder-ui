import React, { useState } from "react";
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

  const [rows, setRows] = useState([
    createEmptyRow(1)
  ]);

  const [output, setOutput] = useState("");

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

    // Special rule for OPEN_URL
    if (field === "action" && value === "OPEN_URL") {
      updated[index].locatorType = "N/A";
      updated[index].locatorValue = "";
    }

    setRows(updated);
  };

  const generateJSON = () => {
    setOutput(JSON.stringify({ steps: rows }, null, 2));
  };

  // 🚀 NEW FUNCTION (RUN TEST)
  const runTest = async () => {
    try {
      const jsonData = JSON.stringify({ steps: rows });

      const response = await fetch("https://automation-backend-2-phfv.onrender.com/api/test/run", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: jsonData
      });

      const result = await response.text();
      alert(result);

    } catch (error) {
      console.error("Error:", error);
      alert("Failed to run test");
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

        {/* ✅ NEW BUTTON ADDED HERE */}
        <button onClick={runTest}>▶ Run Test</button>
      </div>

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