// SentinelOps AI Frontend Controller
document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const promptInput = document.getElementById('promptInput');
  const runAgentBtn = document.getElementById('runAgentBtn');
  const traceContainer = document.getElementById('traceContainer');
  const stepCounter = document.getElementById('stepCounter');
  const clearTraceBtn = document.getElementById('clearTraceBtn');
  const scenarioChips = document.querySelectorAll('.chip');
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabPanels = document.querySelectorAll('.tab-panel');

  // Artifact Views
  const weatherView = document.getElementById('weatherView');
  const notionView = document.getElementById('notionView');
  const slackView = document.getElementById('slackView');
  const resendView = document.getElementById('resendView');
  const rawJsonOutput = document.getElementById('rawJsonOutput');
  const copyJsonBtn = document.getElementById('copyJsonBtn');

  // Status Dots
  const dotWeather = document.getElementById('dotWeather');
  const dotNotion = document.getElementById('dotNotion');
  const dotSlack = document.getElementById('dotSlack');
  const dotResend = document.getElementById('dotResend');

  // Settings Elements
  const settingsBtn = document.getElementById('settingsBtn');
  const settingsModal = document.getElementById('settingsModal');
  const closeSettingsModal = document.getElementById('closeSettingsModal');
  const cancelSettingsBtn = document.getElementById('cancelSettingsBtn');
  const saveSettingsBtn = document.getElementById('saveSettingsBtn');
  const inputGroqKey = document.getElementById('inputGroqKey');
  const inputSwytchcodeKey = document.getElementById('inputSwytchcodeKey');
  const inputSwytchcodeUrl = document.getElementById('inputSwytchcodeUrl');
  const activeModelLabel = document.getElementById('activeModelLabel');

  let currentExecutionData = null;
  let activeEventSource = null;

  // Initialize System Health & Config
  async function loadSystemHealth() {
    try {
      const res = await fetch('/api/health');
      const data = await res.json();
      if (data.config && data.config.hasGroqKey) {
        activeModelLabel.textContent = 'Groq Live LLM (ReAct Loop)';
        activeModelLabel.parentElement.style.borderColor = 'rgba(16, 185, 129, 0.4)';
        activeModelLabel.parentElement.style.color = '#34d399';
      } else {
        activeModelLabel.textContent = 'Autonomous ReAct Agent Engine';
      }
    } catch (e) {
      console.warn('System health check fallback', e);
    }
  }
  loadSystemHealth();

  // Tab Switching
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      tabPanels.forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      const targetId = btn.getAttribute('data-tab');
      document.getElementById(targetId)?.classList.add('active');
    });
  });

  function switchTab(tabId) {
    const targetBtn = document.querySelector(`.tab-btn[data-tab="${tabId}"]`);
    if (targetBtn) {
      targetBtn.click();
    }
  }

  // Quick Demo Chips
  scenarioChips.forEach(chip => {
    chip.addEventListener('click', () => {
      const promptText = chip.getAttribute('data-prompt');
      promptInput.value = promptText;
      triggerAgentWorkflow(promptText);
    });
  });

  // Clear Trace
  clearTraceBtn.addEventListener('click', () => {
    traceContainer.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🤖</div>
        <h3>Autonomous Agent Ready</h3>
        <p>Select a quick demo scenario above or enter a custom prompt. You will observe the agent reason, select Swytchcode tools, and chain actions live.</p>
      </div>
    `;
    stepCounter.textContent = 'Ready';
    resetArtifactViews();
  });

  function resetArtifactViews() {
    dotWeather.classList.remove('active');
    dotNotion.classList.remove('active');
    dotSlack.classList.remove('active');
    dotResend.classList.remove('active');

    weatherView.innerHTML = `<div class="placeholder-msg">Awaiting agent to invoke Swytchcode OpenWeather API...</div>`;
    notionView.innerHTML = `<div class="placeholder-msg">Awaiting agent to generate Notion incident protocol...</div>`;
    slackView.innerHTML = `<div class="placeholder-msg">Awaiting agent to dispatch Slack notification...</div>`;
    resendView.innerHTML = `<div class="placeholder-msg">Awaiting agent to send safety email advisory via Resend...</div>`;
    rawJsonOutput.textContent = `// Complete execution telemetry will stream here`;
  }

  // Run Agent
  runAgentBtn.addEventListener('click', () => {
    const prompt = promptInput.value.trim();
    if (!prompt) {
      alert('Please enter a prompt or click one of the quick scenario demo buttons above.');
      return;
    }
    triggerAgentWorkflow(prompt);
  });

  // Main Workflow Dispatch
  async function triggerAgentWorkflow(prompt) {
    // UI state
    runAgentBtn.disabled = true;
    runAgentBtn.querySelector('.btn-text').textContent = 'Agent Reasoning...';
    stepCounter.textContent = 'Executing...';
    traceContainer.innerHTML = '';
    resetArtifactViews();

    if (activeEventSource) {
      activeEventSource.close();
    }

    try {
      // Connect to SSE stream for real-time live execution
      const sseUrl = `/api/agent/stream?prompt=${encodeURIComponent(prompt)}`;
      activeEventSource = new EventSource(sseUrl);

      activeEventSource.addEventListener('init', (e) => {
        console.log('[SSE Init]', JSON.parse(e.data));
      });

      activeEventSource.addEventListener('step', (e) => {
        const step = JSON.parse(e.data);
        renderStepCard(step);
      });

      activeEventSource.addEventListener('complete', (e) => {
        const result = JSON.parse(e.data);
        currentExecutionData = result;
        activeEventSource.close();
        handleCompletion(result);
      });

      activeEventSource.addEventListener('error', async (e) => {
        console.warn('[SSE Connection dropped, falling back to POST /api/agent/run]', e);
        if (activeEventSource) activeEventSource.close();

        // Fallback to standard POST
        const res = await fetch('/api/agent/run', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt })
        });
        const result = await res.json();
        currentExecutionData = result;
        renderAllSteps(result.steps);
        handleCompletion(result);
      });

    } catch (err) {
      console.error('Agent dispatch failed', err);
      alert('Failed to execute agent: ' + err.message);
      runAgentBtn.disabled = false;
      runAgentBtn.querySelector('.btn-text').textContent = 'Dispatch Agent';
      stepCounter.textContent = 'Error';
    }
  }

  function handleCompletion(result) {
    runAgentBtn.disabled = false;
    runAgentBtn.querySelector('.btn-text').textContent = 'Dispatch Agent';
    stepCounter.textContent = `${result.steps?.length || 4} Steps • Complete`;

    // Populate Artifacts
    if (result.artifacts) {
      if (result.artifacts.weatherData) {
        renderWeatherArtifact(result.artifacts.weatherData);
        dotWeather.classList.add('active');
      }
      if (result.artifacts.notionProtocol) {
        renderNotionArtifact(result.artifacts.notionProtocol);
        dotNotion.classList.add('active');
      }
      if (result.artifacts.slackAlert) {
        renderSlackArtifact(result.artifacts.slackAlert);
        dotSlack.classList.add('active');
      }
      if (result.artifacts.resendEmail) {
        renderResendArtifact(result.artifacts.resendEmail);
        dotResend.classList.add('active');
      }
    }

    // Populate raw JSON
    rawJsonOutput.textContent = JSON.stringify(result, null, 2);

    // Auto-focus on Weather or Notion tab to showcase result
    switchTab('tab-weather');
  }

  function renderAllSteps(steps = []) {
    traceContainer.innerHTML = '';
    steps.forEach(step => renderStepCard(step));
  }

  function renderStepCard(step) {
    const card = document.createElement('div');
    const typeClass = step.type || 'thought';
    card.className = `step-card ${typeClass}`;

    const timeStr = new Date(step.timestamp || Date.now()).toLocaleTimeString();
    const tagLabel = (step.phase || step.type || 'THOUGHT').toUpperCase();

    let detailsHtml = '';
    if (step.content) {
      detailsHtml = `<div class="step-body">${escapeHtml(step.content)}</div>`;
    } else if (step.args) {
      detailsHtml = `
        <div class="step-body">Preparing tool parameters:</div>
        <pre class="code-snippet">${escapeHtml(JSON.stringify(step.args, null, 2))}</pre>
      `;
    } else if (step.data) {
      detailsHtml = `
        <div class="step-body">Received structured response:</div>
        <pre class="code-snippet">${escapeHtml(JSON.stringify(step.data, null, 2))}</pre>
      `;
    }

    card.innerHTML = `
      <div class="step-top">
        <div class="step-badge-wrap">
          <span class="step-tag ${typeClass}">${tagLabel}</span>
          <span class="step-title">${escapeHtml(step.title || 'Agent Step')}</span>
        </div>
        <span class="step-time">${timeStr}</span>
      </div>
      ${detailsHtml}
    `;

    traceContainer.appendChild(card);
    traceContainer.scrollTop = traceContainer.scrollHeight;

    // Check if intermediate tool result arrived to activate tabs early
    if (step.toolName) {
      if (step.toolName.includes('weather') && step.data) {
        renderWeatherArtifact(step.data);
        dotWeather.classList.add('active');
      } else if (step.toolName.includes('notion') && step.data) {
        renderNotionArtifact(step.data);
        dotNotion.classList.add('active');
      } else if (step.toolName.includes('slack') && step.data) {
        renderSlackArtifact(step.data);
        dotSlack.classList.add('active');
      } else if (step.toolName.includes('resend') && step.data) {
        renderResendArtifact(step.data);
        dotResend.classList.add('active');
      }
    }
  }

  // 1. Render OpenWeather Telemetry
  function renderWeatherArtifact(data) {
    const isCritical = (data.temperature >= 40 || data.rainProbability >= 80 || (data.severityLevel && data.severityLevel.includes('CRITICAL')));
    const riskClass = isCritical ? 'critical' : 'high';
    const riskLabel = isCritical ? 'CRITICAL HAZARD' : 'ELEVATED RISK';

    weatherView.innerHTML = `
      <div class="weather-hero-card">
        <div class="weather-header">
          <div>
            <div class="weather-city">📍 ${escapeHtml(data.city || 'Gurgaon')}, ${escapeHtml(data.country || 'IN')}</div>
            <div class="weather-condition">Condition: ${escapeHtml(data.weatherCondition || 'Adverse Weather')} (${escapeHtml(data.description || '')})</div>
          </div>
          <span class="risk-pill ${riskClass}">⚠️ ${riskLabel}</span>
        </div>

        <div class="weather-metrics-grid">
          <div class="metric-box">
            <div class="metric-label">Ambient Temp</div>
            <div class="metric-val">${data.temperature ?? 30}°C</div>
          </div>
          <div class="metric-box">
            <div class="metric-label">Rain Probability</div>
            <div class="metric-val" style="color: #38bdf8;">${data.rainProbability ?? 80}%</div>
          </div>
          <div class="metric-box">
            <div class="metric-label">Wind Velocity</div>
            <div class="metric-val" style="color: #f59e0b;">${data.windSpeedKmH ?? 35} km/h</div>
          </div>
          <div class="metric-box">
            <div class="metric-label">Humidity</div>
            <div class="metric-val">${data.humidity ?? 82}%</div>
          </div>
          <div class="metric-box">
            <div class="metric-label">Air Quality Index</div>
            <div class="metric-val" style="color: #ec4899;">${data.aqi ?? 180} AQI</div>
          </div>
          <div class="metric-box">
            <div class="metric-label">API Gateway</div>
            <div class="metric-val" style="font-size: 13px; color: #10b981;">Swytchcode</div>
          </div>
        </div>

        <div class="hazard-alert-banner">
          <strong>🚨 Environmental Directive:</strong> ${escapeHtml(data.hazardAlert || data.description || 'Elevated risk conditions detected. Incident protocol dispatched.')}
        </div>
      </div>
    `;
  }

  // 2. Render Notion Incident Document
  function renderNotionArtifact(data) {
    const actionItems = data.actionItems || [
      'Activate Regional Emergency Operations Command',
      'Audit high-risk transit corridors and re-route delivery fleet away from low-lying areas',
      'Coordinate on-call safety supervisors and broadcast real-time Slack check-ins',
      'Verify corporate facility storm-drainage pumps and electrical backup generators'
    ];

    notionView.innerHTML = `
      <div class="notion-preview">
        <div class="notion-breadcrumbs">
          Workspace / Real-World Incident Protocols Database / <span>${escapeHtml(data.pageId || 'PAGE-REF')}</span>
        </div>
        <div class="notion-icon">📜</div>
        <h2 class="notion-title">${escapeHtml(data.title || 'Real-World Incident Protocol')}</h2>
        
        <div class="notion-meta">
          <span>Status: <strong>Active Protocol</strong></span>
          <span>Severity: <strong style="color: #f43f5e;">${escapeHtml(data.severity || 'HIGH')}</strong></span>
          <span>Location: <strong>${escapeHtml(data.location || 'NCR')}</strong></span>
          <span>Integration: <strong>Swytchcode Notion API</strong></span>
        </div>

        <div class="notion-callout">
          <strong>⚠️ Automated Activation Notice:</strong> This protocol was dynamically generated and published by SentinelOps AI Agent following real-time weather telemetry observation.
        </div>

        <div class="notion-section-title">Operational Contingency Plan</div>
        <p style="font-size: 13px; line-height: 1.6; color: #cbd5e1; margin-bottom: 18px;">
          ${escapeHtml(data.contingencyPlan || 'Enact precautionary travel advisory and halt low-ground fleet movements.')}
        </p>

        <div class="notion-section-title">Mandatory Action Items (${actionItems.length})</div>
        <ul class="notion-checklist">
          ${actionItems.map(item => `
            <li>
              <span class="notion-checkbox">✓</span>
              <span>${escapeHtml(item)}</span>
            </li>
          `).join('')}
        </ul>

        <div style="margin-top: 20px; font-size: 11px; color: #777;">
          Notion Page URL: <a href="${data.url || '#'}" target="_blank" style="color: #06b6d4; text-decoration: none;">${data.url || 'https://notion.so/swytchcode/incident'}</a>
        </div>
      </div>
    `;
  }

  // 3. Render Slack Block Kit Alert
  function renderSlackArtifact(data) {
    const actions = data.recommendedActions || ['Review Notion Contingency Plan', 'Confirm field staff check-in within 15 minutes'];
    const metrics = data.weatherMetrics || {};

    slackView.innerHTML = `
      <div class="slack-preview">
        <div class="slack-header">
          <div class="slack-avatar">SO</div>
          <div class="slack-bot-info">
            <div class="slack-bot-name">
              SentinelOps Incident Bot <span class="slack-app-badge">APP</span>
            </div>
            <div class="slack-time">Posted to ${escapeHtml(data.channel || '#ops-emergency-dispatch')} • Just now</div>
          </div>
        </div>

        <div class="slack-card-body">
          <div class="slack-title">🚨 [${escapeHtml(data.severity || 'HIGH')}] ${escapeHtml(data.title || 'Operational Hazard Alert')}</div>
          <div class="slack-summary">${escapeHtml(data.summary || 'Real-world risk detected.')}</div>

          <div style="background: rgba(0,0,0,0.3); border-radius: 6px; padding: 10px; margin-bottom: 12px; font-size: 12px; font-family: var(--font-mono);">
            <span>Temp: <strong style="color: #38bdf8;">${metrics.temperature || 30}°C</strong></span> &nbsp;|&nbsp;
            <span>Wind: <strong style="color: #f59e0b;">${metrics.windSpeed || 35} km/h</strong></span> &nbsp;|&nbsp;
            <span>Rain Prob: <strong style="color: #34d399;">${metrics.rainProbability || 80}%</strong></span>
          </div>

          <div style="font-size: 12px; font-weight: 600; color: #fff; margin-bottom: 6px;">Immediate Protocols:</div>
          <ul style="font-size: 12px; color: #b5b8bb; margin-left: 18px; line-height: 1.5;">
            ${actions.map(a => `<li>${escapeHtml(a)}</li>`).join('')}
          </ul>

          <div class="slack-actions-row">
            <button class="slack-btn" onclick="alert('Navigating to linked Notion Protocol page generated by Swytchcode Notion API')">
              📖 View Protocol in Notion
            </button>
            <button class="slack-btn-secondary" onclick="alert('Incident acknowledged by on-call supervisor.')">
              ✅ Acknowledge Alert
            </button>
          </div>
        </div>
      </div>
    `;
  }

  // 4. Render Resend Email Preview
  function renderResendArtifact(data) {
    const instructions = data.instructions || [
      'Avoid travel through flooded or hazard-prone areas until further clearance.',
      'If operating in the field, report current status to your regional supervisor immediately.'
    ];

    resendView.innerHTML = `
      <div class="resend-preview">
        <div class="resend-envelope">
          <div>From: <strong>SentinelOps Emergency Alerts &lt;alerts@swytchcode.dev&gt;</strong></div>
          <div>To: <strong>${escapeHtml(Array.isArray(data.recipients) ? data.recipients.join(', ') : (data.to || 'regional-workforce@enterprise.com'))}</strong></div>
          <div>Subject: <strong>${escapeHtml(data.subject || 'Urgent Weather & Safety Advisory')}</strong></div>
          <div>Delivery Gateway: <strong style="color: #06b6d4;">Swytchcode Resend Integration (ID: ${escapeHtml(data.emailId || 'EMAIL-ID')})</strong></div>
        </div>
        <div class="resend-body-frame">
          ${data.htmlPreview || `
            <div style="background: #1e293b; padding: 18px; border-radius: 8px; border-left: 4px solid #f43f5e;">
              <h3 style="color: #ffffff; margin-bottom: 8px;">🚨 [${escapeHtml(data.severity || 'CRITICAL')}] Field Safety Directive</h3>
              <p style="color: #cbd5e1; font-size: 13px; line-height: 1.5; margin-bottom: 12px;">
                ${escapeHtml(data.headline || 'Hazardous atmospheric conditions detected. Follow all mandatory guidelines below:')}
              </p>
              <ul style="color: #94a3b8; font-size: 12px; line-height: 1.6; padding-left: 20px;">
                ${instructions.map(i => `<li>${escapeHtml(i)}</li>`).join('')}
              </ul>
            </div>
          `}
        </div>
      </div>
    `;
  }

  // Copy Raw JSON
  copyJsonBtn.addEventListener('click', () => {
    if (currentExecutionData) {
      navigator.clipboard.writeText(JSON.stringify(currentExecutionData, null, 2));
      const orig = copyJsonBtn.textContent;
      copyJsonBtn.textContent = 'Copied!';
      setTimeout(() => copyJsonBtn.textContent = orig, 1500);
    }
  });

  // Settings Modal Handlers
  settingsBtn.addEventListener('click', () => settingsModal.classList.add('open'));
  closeSettingsModal.addEventListener('click', () => settingsModal.classList.remove('open'));
  cancelSettingsBtn.addEventListener('click', () => settingsModal.classList.remove('open'));

  saveSettingsBtn.addEventListener('click', async () => {
    const payload = {
      groqApiKey: inputGroqKey.value.trim(),
      swytchcodeApiKey: inputSwytchcodeKey.value.trim(),
      swytchcodeBaseUrl: inputSwytchcodeUrl.value.trim()
    };

    try {
      const res = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        settingsModal.classList.remove('open');
        loadSystemHealth();
        alert('Configuration saved! Settings updated successfully.');
      }
    } catch (e) {
      alert('Error updating configuration: ' + e.message);
    }
  });

  function escapeHtml(str) {
    if (typeof str !== 'string') return String(str ?? '');
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
});
