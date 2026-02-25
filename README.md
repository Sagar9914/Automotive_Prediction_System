Autonomous Predictive Maintenance System

An Agentic AI-based web platform for proactive vehicle maintenance, autonomous service scheduling, manufacturing quality insights, and UEBA-based security monitoring.

📌 Overview

This system simulates an automotive OEM’s intelligent aftersales platform where a Master Agent orchestrates multiple Worker Agents to:

Predict vehicle failures

Engage customers via voice assistant

Autonomously schedule service

Generate manufacturing insights

Detect anomalous agent behavior using UEBA

🧠 Agentic Architecture
Master Agent

Orchestrates diagnosis, scheduling, customer engagement, and manufacturing feedback.

Worker Agents

Data Analysis Agent

Diagnosis Agent

Customer Engagement Agent

Scheduling Agent

Manufacturing Insights Module

UEBA Monitoring Layer

🛠 Tech Stack

Frontend:

React.js

CSS

Web Speech API

Backend:

Node.js

Express.js

Database:

PostgreSQL

📂 Project Structure
client/
  src/
    App.js
    App.css
server/
  index.js
  agents.js
  db.js
🚀 Features
✅ Vehicle Fleet Monitoring

View real-time vehicle health

Detect critical vehicles

✅ Predictive Failure Detection

Risk scoring (0–100)

Priority classification

✅ Voice-Based Customer Engagement

AI-generated conversation

Speech playback

✅ Autonomous Service Scheduling

Suggest available slots

Confirm booking

✅ Manufacturing Insights

RCA/CAPA analysis

Recurrence detection

✅ UEBA Security Monitoring

Logs all agent actions

Detects anomalies

Risk scoring

🔐 UEBA Example

If SchedulingAgent accesses telematics:

Status: ANOMALY
Risk Score: 80
🗄 Database Tables

vehicles

service_slots

ueba_logs

capa_rca

⚙️ Setup Instructions
1️⃣ Clone Repository
git clone <repo-url>
2️⃣ Install Dependencies

Backend:

cd server
npm install

Frontend:

cd client
npm install
3️⃣ Setup PostgreSQL

Create database and required tables.

Update db.js with:

user
password
database
host
port
4️⃣ Run Application

Backend:

node index.js

Frontend:

npm start

Open:

http://localhost:3000
📊 APIs
Endpoint	Description
GET /api/vehicles	List vehicles
POST /api/orchestrate/:vehicleId	Run master agent
POST /api/service/book	Book slot
GET /api/ueba/logs	View UEBA logs
GET /api/mfg/insights	Manufacturing insights
🎯 Business Impact

Reduced vehicle downtime

Improved customer satisfaction

Optimized service scheduling

Manufacturing defect reduction

Secure AI agent orchestration

🔮 Future Enhancements

ML-based prediction model

Real-time telematics streaming

Demand forecasting dashboard

Feedback agent

Advanced UEBA behavior profiling
