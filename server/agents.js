// server/agents.js
const pool = require("./db");

// UEBA logging
async function logAgentAction(agentName, action, resource) {
  let riskScore = 0;
  let status = "OK";

  // mark anomaly if SchedulingAgent accesses telematics
  if (agentName === "SchedulingAgent" && resource.includes("telematics")) {
    riskScore = 80;
    status = "ANOMALY";
  }

  await pool.query(
    "INSERT INTO ueba_logs (agent_name, action, resource, risk_score, status) VALUES ($1,$2,$3,$4,$5)",
    [agentName, action, resource, riskScore, status]
  );
}
// BAD behavior: SchedulingAgent reading telematics for some reason
async function simulateWrongSchedulingBehavior(vehicleId) {
  await logAgentAction(
    "SchedulingAgent",
    "readTelematics",
    `telematics:vehicle:${vehicleId}` // contains "telematics"
  );
}

// Data Analysis Agent
function analyzeVehicle(vehicle) {
  const issues = [];
  let riskScore = 0;

  if (vehicle.engine_temp > 105) {
    issues.push("Engine temperature high, possible cooling issue");
    riskScore += 40;
  }
  if (vehicle.battery_health < 30) {
    issues.push("Battery health low, possible starting issue");
    riskScore += 35;
  }
  if (vehicle.brake_wear > 80) {
    issues.push("Brake wear high, safety risk");
    riskScore += 50;
  }

  if (issues.length === 0) {
    issues.push("No critical issues detected");
  }

  if (riskScore > 80) return { riskScore, priority: "CRITICAL", issues };
  if (riskScore > 50) return { riskScore, priority: "HIGH", issues };
  if (riskScore > 20) return { riskScore, priority: "MEDIUM", issues };
  return { riskScore, priority: "LOW", issues };
}

// Diagnosis Agent
function diagnose(vehicle) {
  const analysis = analyzeVehicle(vehicle);

  let probableFailure = "General check-up recommended";
  let recommendedWindow = "Within 30 days";

  if (analysis.priority === "CRITICAL") {
    probableFailure = "Immediate risk of breakdown or safety issue";
    recommendedWindow = "Within 1 day";
  } else if (analysis.priority === "HIGH") {
    probableFailure = "High chance of failure soon";
    recommendedWindow = "Within 3 days";
  } else if (analysis.priority === "MEDIUM") {
    probableFailure = "Component wear detected, schedule soon";
    recommendedWindow = "Within 7 days";
  }

  return { ...analysis, probableFailure, recommendedWindow };
}

// Customer Engagement Agent
function createConversation(vehicle, diagnosis) {
  const baseIntro = `Hello, this is your smart service assistant for your ${vehicle.model}.`;

  const issueExplanation = diagnosis.issues.join(" ");
  let consequence = "";
  let benefit = "";

  switch (diagnosis.priority) {
    case "CRITICAL":
      consequence =
        "If you keep driving, there is a high risk of sudden breakdown or safety hazard.";
      benefit =
        "Servicing now will prevent roadside failure and keep you and your family safe.";
      break;
    case "HIGH":
      consequence =
        "Ignoring this may lead to unexpected issues and higher repair costs.";
      benefit = "Addressing it now reduces cost and prevents inconvenience.";
      break;
    case "MEDIUM":
      consequence =
        "If delayed too long, the wear may become more serious.";
      benefit = "A timely check keeps your vehicle smooth and reliable.";
      break;
    default:
      consequence =
        "No urgent issue, but preventive care is always better.";
      benefit =
        "A routine check will keep your vehicle in top condition.";
  }

  const proposal =
    "Would you like to book a convenient service slot now?";

  return {
    opening: baseIntro,
    issueExplanation,
    consequence,
    benefit,
    proposal,
  };
}

// Scheduling Agent
async function getSlotsByPriority(priority) {
  await logAgentAction("SchedulingAgent", "getSlots", "service_slots");

  let query =
    "SELECT * FROM service_slots WHERE is_booked=false ORDER BY slot_time ASC LIMIT 3";

  if (priority === "CRITICAL") {
    query =
      "SELECT * FROM service_slots WHERE is_booked=false ORDER BY slot_time ASC LIMIT 3";
  }

  const res = await pool.query(query);
  return res.rows;
}

// Manufacturing Insights Module
async function getManufacturingInsights() {
  await logAgentAction(
    "ManufacturingInsightsModule",
    "listInsights",
    "capa_rca"
  );
  const res = await pool.query(
    "SELECT component, root_cause, corrective_action, recurrence_count FROM capa_rca ORDER BY recurrence_count DESC LIMIT 5"
  );
  return res.rows;
}

module.exports = {
  logAgentAction,
  diagnose,
  createConversation,
  getSlotsByPriority,
  getManufacturingInsights,
};
