// client/src/App.js
import React, { useEffect, useState } from "react";
import "./App.css";

const API_BASE = "http://localhost:5000/api";

function App() {
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [orchestration, setOrchestration] = useState(null);
  const [conversationStep, setConversationStep] = useState(0);
  const [customerResponse, setCustomerResponse] = useState("");
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [bookingStatus, setBookingStatus] = useState(null);
  const [uebaLogs, setUebaLogs] = useState([]);
  const [insights, setInsights] = useState([]);
  const [activeTab, setActiveTab] = useState("dashboard");

  useEffect(() => {
    fetchVehicles();
    fetchUebaLogs();
    fetchInsights();
  }, []);

  const fetchVehicles = async () => {
    try {
      const res = await fetch(`${API_BASE}/vehicles`);
      const data = await res.json();
      setVehicles(data);
    } catch (error) {
      console.error("Failed to fetch vehicles:", error);
    }
  };

  const fetchUebaLogs = async () => {
    try {
      const res = await fetch(`${API_BASE}/ueba/logs`);
      const data = await res.json();
      setUebaLogs(data);
    } catch (error) {
      console.error("Failed to fetch UEBA logs:", error);
    }
  };

  const fetchInsights = async () => {
    try {
      const res = await fetch(`${API_BASE}/mfg/insights`);
      const data = await res.json();
      setInsights(data);
    } catch (error) {
      console.error("Failed to fetch insights:", error);
    }
  };

  const handleSelectVehicle = (vehicle) => {
    setSelectedVehicle(vehicle);
    setOrchestration(null);
    setConversationStep(0);
    setCustomerResponse("");
    setSelectedSlot(null);
    setBookingStatus(null);
  };

  const handleRunOrchestration = async () => {
    if (!selectedVehicle) return;

    try {
      const res = await fetch(`${API_BASE}/orchestrate/${selectedVehicle.id}`, {
        method: "POST",
      });
      const data = await res.json();
      setOrchestration(data);
      setConversationStep(0);
      fetchUebaLogs();
    } catch (error) {
      console.error("Orchestration failed:", error);
      alert("Master Agent orchestration failed. Check backend.");
    }
  };

  const handleCustomerReply = () => {
    if (!customerResponse.trim()) return;
    if (conversationStep === 0 && orchestration) {
      setConversationStep(1);
    }
  };

  const handleSelectSlot = (slot) => {
    setSelectedSlot(slot);
  };

  const handleBookSlot = async () => {
    if (!selectedSlot) return;

    try {
      const res = await fetch(`${API_BASE}/service/book`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slotId: selectedSlot.id }),
      });
      await res.json();
      setBookingStatus("confirmed");
      setOrchestration(null);
      fetchUebaLogs();
      alert(
        `✅ Service booked successfully!\n${selectedSlot.center} - ${new Date(
          selectedSlot.slot_time
        ).toLocaleString()}`
      );
    } catch (error) {
      console.error("Booking failed:", error);
      alert("Booking failed. Slot may be taken.");
    }
  };

  const triggerAnomaly = async () => {
    await fetch(`${API_BASE}/demo-anomaly`, { method: "POST" });
    fetchUebaLogs();
  };

  const handleDeclineBooking = () => {
    setCustomerResponse("No thanks, not now.");
    setConversationStep(2);
  };
  // simple text-to-speech helper for voice agent
  const speakText = (text) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1;          // normal speed
    utterance.pitch = 1;         // normal pitch
    utterance.volume = 1;        // full volume
    utterance.lang = "en-IN";    // Indian English accent

    window.speechSynthesis.cancel(); // stop any previous speech
    window.speechSynthesis.speak(utterance);
  };


  const conversationMessages = orchestration
    ? [
      { speaker: "agent", text: orchestration.conversation.opening },
      { speaker: "agent", text: orchestration.conversation.issueExplanation },
      { speaker: "agent", text: orchestration.conversation.consequence },
      { speaker: "agent", text: orchestration.conversation.benefit },
      { speaker: "agent", text: orchestration.conversation.proposal },
      ...(customerResponse
        ? [{ speaker: "user", text: customerResponse }]
        : []),
    ]
    : [];

  return (
    <div className="app">
      <header>
        <h1>🚗 Autonomous Predictive Maintenance System</h1>
        <div className="tabs">
          <button
            className={activeTab === "dashboard" ? "active" : ""}
            onClick={() => setActiveTab("dashboard")}
          >
            Dashboard
          </button>
          <button
            className={activeTab === "ueba" ? "active" : ""}
            onClick={() => setActiveTab("ueba")}
          >
            UEBA Alerts ({uebaLogs.filter((l) => l.status === "ANOMALY").length}
            )
          </button>
          <button
            className={activeTab === "insights" ? "active" : ""}
            onClick={() => setActiveTab("insights")}
          >
            Manufacturing Insights
          </button>
        </div>
      </header>

      <main className="layout">
        {/* Vehicles panel */}
        <section className="panel vehicles-panel">
          <h2>📊 Vehicle Fleet Analysis</h2>
          <div className="vehicle-stats">
            <div className="stat">
              <span className="label">At Risk</span>
              <span className="value">
                {
                  vehicles.filter(
                    (v) =>
                      v.engine_temp > 105 ||
                      v.battery_health < 30 ||
                      v.brake_wear > 80
                  ).length
                }
              </span>
            </div>
            <div className="stat">
              <span className="label">Total</span>
              <span className="value">{vehicles.length}</span>
            </div>
          </div>

          <div className="vehicle-list">
            {vehicles.map((vehicle) => {
              const isCritical =
                vehicle.engine_temp > 105 || vehicle.brake_wear > 80;
              return (
                <div
                  key={vehicle.id}
                  className={`vehicle-item ${selectedVehicle?.id === vehicle.id ? "selected" : ""
                    } ${isCritical ? "critical" : ""}`}
                  onClick={() => handleSelectVehicle(vehicle)}
                >
                  <div className="vehicle-header">
                    <span className="vehicle-id">#{vehicle.id}</span>
                    <span
                      className={`priority ${isCritical ? "high" : "low"}`}
                    >
                      {isCritical ? "⚠️ CRITICAL" : "✅ OK"}
                    </span>
                  </div>
                  <div className="vehicle-info">
                    <strong>
                      {vehicle.model} ({vehicle.year})
                    </strong>
                    <div>{vehicle.odometer.toLocaleString()} km</div>
                    <div className="sensors">
                      <span>🔥 {vehicle.engine_temp}°C</span>
                      <span>🔋 {vehicle.battery_health}%</span>
                      <span>🛑 {vehicle.brake_wear}%</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Master Agent panel */}
        <section className="panel main-panel">
          <h2>🤖 Master Agent Orchestration</h2>

          {selectedVehicle ? (
            <div>
              <div className="vehicle-detail">
                <h3>Selected: {selectedVehicle.model}</h3>
                <div className="sensors-grid">
                  <div className="sensor engine">
                    <label>🔥Engine Temp</label>
                    <div
                      className={`value ${selectedVehicle.engine_temp > 105 ? "critical" : ""
                        }`}
                    >
                      {selectedVehicle.engine_temp}°C
                    </div>
                  </div>
                  <div className="sensor battery">
                    <label>🔋Battery</label>
                    <div
                      className={`value ${selectedVehicle.battery_health < 30 ? "critical" : ""
                        }`}
                    >
                      {selectedVehicle.battery_health}%
                    </div>
                  </div>
                  <div className="sensor brakes">
                    <label>🛑Brake Wear</label>
                    <div
                      className={`value ${selectedVehicle.brake_wear > 80 ? "critical" : ""
                        }`}
                    >
                      {selectedVehicle.brake_wear}%
                    </div>
                  </div>
                </div>

                {!orchestration ? (
                  <button
                    className="run-agent-btn"
                    onClick={handleRunOrchestration}
                  >
                    🚀 Run Master Agent Analysis
                  </button>
                ) : (
                  <div>
                    <div className="diagnosis-card">
                      <h4>🔍 Diagnosis Agent Result</h4>
                      <div className="priority-badge">
                        {orchestration.diagnosis.priority}
                      </div>
                      <p>
                        <strong>Risk Score:</strong>{" "}
                        {orchestration.diagnosis.riskScore}/100
                      </p>
                      <p>
                        <strong>Recommended:</strong>{" "}
                        {orchestration.diagnosis.recommendedWindow}
                      </p>
                      <div className="issues">
                        {orchestration.diagnosis.issues.map((issue, idx) => (
                          <span key={idx} className="issue-tag">
                            {issue}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="conversation-card">
                      <h4>📱 Voice Agent Conversation</h4>

                      <button
                        className="speak-btn"
                        onClick={() => {
                          if (!orchestration) return;
                          const agentText = [
                            orchestration.conversation.opening,
                            orchestration.conversation.issueExplanation,
                            orchestration.conversation.consequence,
                            orchestration.conversation.benefit,
                            orchestration.conversation.proposal,
                          ].join(" ");
                          speakText(agentText);
                        }}
                      >
                        🔊 Play Voice
                      </button>

                      <div className="chat-container">
                        ...

                        {conversationMessages
                          .slice(0, conversationStep + 6)
                          .map((msg, idx) => (
                            <div
                              key={idx}
                              className={`chat-message ${msg.speaker}`}
                            >
                              <div className="message-bubble">
                                {msg.text}
                              </div>
                            </div>
                          ))}

                        {conversationStep === 0 &&
                          orchestration.slots &&
                          orchestration.slots.length > 0 && (
                            <div>
                              <div className="chat-message agent">
                                <div className="message-bubble">
                                  Here are convenient slots for you:
                                </div>
                              </div>
                              <div className="slot-options">
                                {orchestration.slots
                                  .slice(0, 3)
                                  .map((slot) => (
                                    <button
                                      key={slot.id}
                                      className={`slot-btn ${selectedSlot?.id === slot.id
                                          ? "selected"
                                          : ""
                                        }`}
                                      onClick={() => handleSelectSlot(slot)}
                                    >
                                      {slot.center}
                                      <br />
                                      {new Date(
                                        slot.slot_time
                                      ).toLocaleString()}
                                    </button>
                                  ))}
                              </div>
                            </div>
                          )}
                      </div>

                      {conversationStep === 0 && selectedSlot && (
                        <div className="action-buttons">
                          <button
                            className="confirm-btn"
                            onClick={handleBookSlot}
                          >
                            ✅ Confirm Booking
                          </button>
                          <button
                            className="decline-btn"
                            onClick={handleDeclineBooking}
                          >
                            ❌ Decline for now
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="empty-state">
              <h3>Select a vehicle to start orchestration</h3>
              <p>Click any vehicle from the left panel</p>
            </div>
          )}
        </section>

        {/* Right panel */}
        <section className="panel right-panel">
          {activeTab === "dashboard" && (
            <div>
              <h3>📈 Quick Stats</h3>
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-number">
                    {vehicles.filter((v) => v.brake_wear > 80).length}
                  </div>
                  <div className="stat-label">Brake Issues</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number">
                    {vehicles.filter((v) => v.battery_health < 30).length}
                  </div>
                  <div className="stat-label">Battery Risks</div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "ueba" && (
            <div>
              <h3>🛡️ UEBA Security Logs</h3>


              <div className="logs-container">
                {uebaLogs.slice(0, 10).map((log) => (
                  <div
                    key={log.id}
                    className={`log-item ${log.status?.toLowerCase() || "ok"
                      }`}
                  >
                    <div className="log-col time">
                      {new Date(log.created_at).toLocaleTimeString()}
                    </div>
                    <div className="log-col agent">{log.agent_name}</div>
                    <div className="log-col action">{log.action}</div>
                    <div className="log-col resource">{log.resource}</div>
                    <div
                      className={`log-col status ${log.status?.toLowerCase() || "ok"
                        }`}
                    >
                      {log.status} ({log.risk_score})
                    </div>
                  </div>
                ))}
                {uebaLogs.length === 0 && (
                  <div className="no-logs">
                    No UEBA logs yet. Run Master Agent or trigger anomaly.
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "insights" && (
            <div>
              <h3>🏭 Manufacturing Insights</h3>
              <div className="insights-list">
                {insights.map((insight) => (
                  <div key={insight.component} className="insight-item">
                    <div className="insight-header">
                      <strong>{insight.component}</strong>
                      <span className="recurrence">
                        ({insight.recurrence_count}x)
                      </span>
                    </div>
                    <div className="insight-cause">
                      {insight.root_cause}
                    </div>
                    <div className="insight-action">
                      → {insight.corrective_action}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;
