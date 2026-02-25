// server/index.js
const express = require("express");
const cors = require("cors");
const pool = require("./db");
const {
  logAgentAction,
  diagnose,
  createConversation,
  getSlotsByPriority,
  getManufacturingInsights,
} = require("./agents");

const app = express();
app.use(cors());
app.use(express.json());

// Demo route to trigger UEBA anomaly
app.post("/api/scheduling/wrong-access/:vehicleId", async (req, res) => {
  const { vehicleId } = req.params;
  await simulateWrongSchedulingBehavior(vehicleId);
  res.json({ simulated: true });
});



// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// List vehicles
app.get("/api/vehicles", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM vehicles ORDER BY id ASC");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Get single vehicle
app.get("/api/vehicles/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("SELECT * FROM vehicles WHERE id=$1", [
      id,
    ]);
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Master Agent orchestration
app.post("/api/orchestrate/:vehicleId", async (req, res) => {
  try {
    const { vehicleId } = req.params;

    await logAgentAction("MasterAgent", "monitorVehicle", `vehicle:${vehicleId}`);

    const vRes = await pool.query("SELECT * FROM vehicles WHERE id=$1", [
      vehicleId,
    ]);
    const vehicle = vRes.rows[0];
    if (!vehicle) return res.status(404).json({ error: "Vehicle not found" });

    const diagnosis = diagnose(vehicle);
    const conversation = createConversation(vehicle, diagnosis);

    let slots = [];
    if (["MEDIUM", "HIGH", "CRITICAL"].includes(diagnosis.priority)) {
      slots = await getSlotsByPriority(diagnosis.priority);
    }

    res.json({ vehicle, diagnosis, conversation, slots });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Book service slot
app.post("/api/service/book", async (req, res) => {
  try {
    const { slotId } = req.body;
    await logAgentAction("SchedulingAgent", "bookSlot", `slot:${slotId}`);

    const result = await pool.query(
      "UPDATE service_slots SET is_booked=true WHERE id=$1 RETURNING *",
      [slotId]
    );

    res.json({ booking: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// UEBA logs
app.get("/api/ueba/logs", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM ueba_logs ORDER BY created_at DESC LIMIT 20"
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Manufacturing insights
app.get("/api/mfg/insights", async (req, res) => {
  try {
    const insights = await getManufacturingInsights();
    res.json(insights);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
