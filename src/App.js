import React, { useState, useEffect } from "react";
import "./App.css";

const actions = [
  "OPEN_URL",
  "CLICK",
  "TYPE",
  "VERIFY_TEXT",
  "SCREENSHOT"
];

const locatorTypes = ["N/A", "css", "xpath", "id", "text"];
const assertions = ["", "equals", "contains", "visible"];

function App() {
  const [theme, setTheme] = useState("dark");
  const [rows, setRows] = useState([createEmptyRow(1)]);
  const [output, setOutput] = useState("");

  const [isRunning, setIsRunning] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  // ✅ NEW: REPORT STATE
  const [report, setReport] = useState(null);

  function createEmptyRow(step) {
    return {
      step,
      action: "OPEN_URL",
      locatorType: "N/A",
      locatorValue: "",
      data: "",
      assertion: "",
      description: "",
      selected: false
    };
  }

  // ✅ BACKEND URL
  const BASE_URL =
    "https://automation-backend-2-phfv.onrender.com";

  // 🔥 WAKE UP BACKEND
  useEffect(() => {
    const wakeUpServer = async () => {
      try {
        console.log("Waking up backend...");
        await fetch(`${BASE_URL}/api/test/health`);
        console.log("Backend awake");
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

  const deleteSelectedRows = () => {

    const filteredRows = rows
      .filter(row => !row.selected)
      .map((row, index) => ({
        ...row,
        step: index + 1
      }));

    setRows(filteredRows);
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

  // 🚀 RUN TEST
  const runTest = async () => {
    if (isRunning) return;

    setIsRunning(true);

    try {

      setStatusMessage("⏳ Waking server...");

      await fetch(`${BASE_URL}/api/test/health`);

      setStatusMessage("🚀 Running test...");

      const jsonData = JSON.stringify({
        steps: rows
      });

      // ✅ RUN EXECUTION
      const response = await fetch(
        `${BASE_URL}/api/test/run`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: jsonData
        }
      );

      const data = await response.json();

      console.log("Run Response:", data);

      // ✅ VIDEO DOWNLOAD
      if (
        data.videoPath &&
        data.videoPath !== "Video not available"
      ) {

        const videoUrl =
          `${BASE_URL}/api/test/video?path=${encodeURIComponent(
            data.videoPath
          )}`;

        const link = document.createElement("a");

        link.href = videoUrl;
        link.download = "test-video.webm";

        document.body.appendChild(link);

        link.click();

        document.body.removeChild(link);
      }

      // ✅ WAIT FOR REPORT FILE TO BE READY
      await new Promise(resolve =>
        setTimeout(resolve, 2000)
      );

      // ✅ FETCH REPORT
      const reportResponse = await fetch(
        `${BASE_URL}/api/test/report`
      );

      if (!reportResponse.ok) {
        throw new Error(
          "Failed to fetch report"
        );
      }

      const reportData =
        await reportResponse.json();

      console.log(
        "Fetched Report:",
        reportData
      );

      // ✅ UPDATE UI
      setReport(reportData);

      setStatusMessage(
        "✅ Test completed successfully!"
      );

    } catch (error) {

      console.error(error);

      setStatusMessage(
        "❌ Test execution failed"
      );

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
          {theme === "light"
            ? "🌙 Dark Mode"
            : "☀️ Light Mode"}
        </button>

        <button onClick={addRow}>
          ➕ Add Step
        </button>

        <button onClick={deleteSelectedRows}>
          🗑 Delete Selected
        </button>

        <button onClick={generateJSON}>
          📦 Generate JSON
        </button>

        <button
          onClick={runTest}
          disabled={isRunning}
          className={`run-btn ${isRunning ? "disabled-btn" : ""
            }`}
        >
          {isRunning ? (
            <>
              <span className="spinner"></span>
              Running...
            </>
          ) : (
            "▶ Run Test"
          )}
        </button>
      </div>

      {statusMessage && (
        <p className="status">{statusMessage}</p>
      )}

      {/* ✅ STEP TABLE */}
      <table>
        <thead>
          <tr>
            <th>Select</th>
            <th>Step</th>
            <th>Action</th>
            <th>Locator Type</th>
            <th>Locator Value</th>
            <th>Data</th>
            <th>Assertion</th>
            <th>Description</th>
          </tr>
        </thead>

        <tbody>
          {rows.map((row, index) => (
            <tr key={index}>

              <td>
                <input
                  type="checkbox"
                  checked={row.selected || false}
                  onChange={(e) =>
                    handleChange(
                      index,
                      "selected",
                      e.target.checked
                    )
                  }
                />
              </td>

              <td>{row.step}</td>

              <td>
                <select
                  value={row.action}
                  onChange={(e) =>
                    handleChange(
                      index,
                      "action",
                      e.target.value
                    )
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
                  disabled={
                    row.action === "OPEN_URL"
                  }
                  onChange={(e) =>
                    handleChange(
                      index,
                      "locatorType",
                      e.target.value
                    )
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
                  disabled={
                    row.action === "OPEN_URL"
                  }
                  onChange={(e) =>
                    handleChange(
                      index,
                      "locatorValue",
                      e.target.value
                    )
                  }
                />
              </td>

              <td>
                <input
                  value={row.data}
                  onChange={(e) =>
                    handleChange(
                      index,
                      "data",
                      e.target.value
                    )
                  }
                />
              </td>


              <td>
                <select
                  value={row.assertion}
                  onChange={(e) =>
                    handleChange(
                      index,
                      "assertion",
                      e.target.value
                    )
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
                    handleChange(
                      index,
                      "description",
                      e.target.value
                    )
                  }
                />
              </td>


            </tr>
          ))}
        </tbody>
      </table>

      {/* ✅ GENERATED JSON */}
      <h3>Generated JSON</h3>

      <textarea value={output} readOnly />

      {/* ✅ REPORT SECTION */}
      {report && (

        <div className="report-section">

          <h2>📊 Execution Report</h2>

          <p>
            <strong>Status:</strong>{" "}
            {report.status}
          </p>

          <p>
            <strong>Total Time:</strong>{" "}
            {report.totalExecutionTime} sec
          </p>

          {/* ✅ STEP REPORT TABLE */}
          <table className="report-table">

            <thead>
              <tr>
                <th>Step</th>
                <th>Action</th>
                <th>Status</th>
                <th>Execution Time</th>
                <th>Message</th>
                <th>Screenshot</th>
              </tr>
            </thead>

            <tbody>

              {report.steps.map((step, index) => (

                <tr key={index}>

                  <td>{step.stepNo}</td>

                  <td>{step.action}</td>

                  <td>
                    {step.status === "PASSED"
                      ? "✅ PASSED"
                      : "❌ FAILED"}
                  </td>

                  <td>
                    {step.executionTime} sec
                  </td>

                  <td>{step.message}</td>

                  <td>

                    {step.screenshot ? (

                      <a
                        href={`${BASE_URL}/${step.screenshot}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        View Screenshot
                      </a>

                    ) : (
                      "-"
                    )}

                  </td>

                </tr>
              ))}

            </tbody>

          </table>

          {/* ✅ CONSOLE LOGS */}
          <h3>🖥 Console Logs</h3>

          {report.consoleLogs &&
            report.consoleLogs.length > 0 ? (

            <div className="logs">

              {report.consoleLogs.map(
                (log, index) => (
                  <p key={index}>{log}</p>
                )
              )}

            </div>

          ) : (

            <p>No console logs available</p>

          )}

        </div>
      )}
    </div>
  );
}

export default App;