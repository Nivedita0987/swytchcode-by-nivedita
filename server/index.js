// SentinelOps AI - Main Server
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const SwytchcodeClient = require('./swytchcodeClient');
const AgentRunner = require('./agent/agentRunner');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

// In-memory runtime config that can be updated via UI
let runtimeConfig = {
  groqApiKey: process.env.GROQ_API_KEY || '',
  swytchcodeApiKey: process.env.SWYTCHCODE_API_KEY || '',
  swytchcodeBaseUrl: process.env.SWYTCHCODE_BASE_URL || 'https://api.swytchcode.com/v1'
};

// Health & System Info Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    track: 'Track 5 – AI Real World Agent',
    hackathon: 'Build with Swytchcode - Gurgaon Edition',
    integrations: [
      { name: 'OpenWeather', provider: 'Swytchcode', status: 'connected', role: 'Real-World Hazard Telemetry' },
      { name: 'Notion', provider: 'Swytchcode', status: 'connected', role: 'Contingency Protocol Publishing' },
      { name: 'Slack', provider: 'Swytchcode', status: 'connected', role: 'Operations Dispatch Notification' },
      { name: 'Resend', provider: 'Swytchcode', status: 'connected', role: 'Workforce Safety Advisory' }
    ],
    config: {
      hasGroqKey: Boolean(runtimeConfig.groqApiKey),
      hasSwytchcodeKey: Boolean(runtimeConfig.swytchcodeApiKey),
      swytchcodeBaseUrl: runtimeConfig.swytchcodeBaseUrl
    },
    timestamp: new Date().toISOString()
  });
});

// Update runtime config from settings modal
app.post('/api/config', (req, res) => {
  const { groqApiKey, swytchcodeApiKey, swytchcodeBaseUrl } = req.body;
  if (groqApiKey !== undefined) runtimeConfig.groqApiKey = groqApiKey.trim();
  if (swytchcodeApiKey !== undefined) runtimeConfig.swytchcodeApiKey = swytchcodeApiKey.trim();
  if (swytchcodeBaseUrl !== undefined) runtimeConfig.swytchcodeBaseUrl = swytchcodeBaseUrl.trim();

  res.json({
    success: true,
    message: 'Configuration updated successfully',
    config: {
      hasGroqKey: Boolean(runtimeConfig.groqApiKey),
      hasSwytchcodeKey: Boolean(runtimeConfig.swytchcodeApiKey),
      swytchcodeBaseUrl: runtimeConfig.swytchcodeBaseUrl
    }
  });
});

// Run Agent Workflow (Standard JSON response)
app.post('/api/agent/run', async (req, res) => {
  try {
    const { prompt, groqApiKey, swytchcodeApiKey } = req.body;
    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'A valid natural language prompt is required.' });
    }

    const client = new SwytchcodeClient({
      apiKey: swytchcodeApiKey || runtimeConfig.swytchcodeApiKey,
      baseUrl: runtimeConfig.swytchcodeBaseUrl
    });

    const runner = new AgentRunner(client, groqApiKey || runtimeConfig.groqApiKey);
    const result = await runner.runWorkflow(prompt);

    res.json(result);
  } catch (err) {
    console.error('[API /api/agent/run Error]', err);
    res.status(500).json({
      error: 'Agent workflow execution failed',
      details: err.message
    });
  }
});

// Real-Time Server-Sent Events (SSE) Stream Endpoint
app.get('/api/agent/stream', async (req, res) => {
  const prompt = req.query.prompt;
  if (!prompt) {
    return res.status(400).send('Prompt query parameter is required');
  }

  // Setup SSE headers
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*'
  });

  const sendSSE = (eventName, data) => {
    res.write(`event: ${eventName}\ndata: ${JSON.stringify(data)}\n\n`);
  };

  sendSSE('init', { message: 'Agent connected to live telemetry stream', prompt });

  try {
    const client = new SwytchcodeClient({
      apiKey: req.query.swytchcodeKey || runtimeConfig.swytchcodeApiKey,
      baseUrl: runtimeConfig.swytchcodeBaseUrl
    });

    const runner = new AgentRunner(client, req.query.groqKey || runtimeConfig.groqApiKey);

    const fullResult = await runner.runWorkflow(prompt, (step) => {
      sendSSE('step', step);
    });

    sendSSE('complete', fullResult);
    res.end();
  } catch (err) {
    console.error('[SSE Error]', err);
    sendSSE('error', { message: err.message });
    res.end();
  }
});

const PORT = parseInt(process.env.PORT, 10) || 3001;

function startServer(portToTry) {
  const server = app.listen(portToTry, () => {
    console.log('================================================================');
    console.log(`🚀 SentinelOps AI Agent is running at: http://localhost:${portToTry}`);
    console.log(`🏆 Track 5: AI Real World Agent (Build with Swytchcode)`);
    console.log(`⚡ 4 Swytchcode APIs Active: OpenWeather, Notion, Slack, Resend`);
    console.log('================================================================');
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.warn(`[Port ${portToTry} in use, trying port ${portToTry + 1}...]`);
      startServer(portToTry + 1);
    } else {
      console.error('Server error:', err);
    }
  });
}

startServer(PORT);

