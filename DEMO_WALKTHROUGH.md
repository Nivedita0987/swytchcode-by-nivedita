# 🎯 2.5-Minute Final Jury Demo Script & Q&A Guide

**Project:** SentinelOps AI — Autonomous Real-World Operations & Hazard Incident Commander  
**Track:** Track 5 – AI Real World Agent (Build with Swytchcode - Gurgaon Edition)

---

## ⏱️ Demo Timeline (Total: 2.5 Minutes)

### Phase 1: Problem & Agent Introduction (0:00 – 0:40)
> *"Hello judges! For Track 5 (AI Real World Agent), we built **SentinelOps AI**—an autonomous incident commander that connects real-world physical environmental hazards directly to operational software execution.*
>
> *Traditional systems just show you weather widgets. SentinelOps is an active agent: it ingests physical telemetry, reasons through operational risk levels, and automatically coordinates across 4 Swytchcode APIs—OpenWeather, Notion, Slack, and Resend—to safeguard distributed operations."*

---

### Phase 2: Live Interactive Execution (0:40 – 1:50)
1. **Click the preset button:** `🌧️ Gurgaon Monsoon Flash Flood`.
2. **Point to the Left Panel (Live Trace):**
   > *"Notice how the agent doesn't follow a hardcoded script. Look at the live execution graph:*
   > - *First, it forms a **deliberation plan** and calls **Swytchcode OpenWeather** to inspect live rain and wind metrics in Gurgaon.*
   > - *Next, it **observes** 48mm/hr rainfall and 95% flood risk. Based on this observation, the agent dynamically decides this is a **CRITICAL severity incident**.*
   > - *Tool 2: It calls **Swytchcode Notion** to publish a formal incident protocol document with 4 emergency action items.*
   > - *Tool 3: Notice the parameter chaining—the agent takes the generated Notion URL and live weather telemetry, and calls **Swytchcode Slack** to broadcast an interactive alert card to `#ops-emergency-dispatch`.*
   > - *Tool 4: To protect field drivers and warehouse personnel, it dispatches an emergency directive email via **Swytchcode Resend**.*"*

---

### Phase 3: Inspect the Generated Artifacts (1:50 – 2:30)
1. **Click `OpenWeather Telemetry` Tab:** Show the live metrics (Temperature, Wind, Rain probability, AQI, and Risk Pill).
2. **Click `Notion Incident Page` Tab:** Show the realistic Notion protocol with checklist items and operational strategy.
3. **Click `Slack Ops Dispatch` Tab:** Show the formatted Slack card with priority bar, action buttons, and direct link to Notion.
4. **Click `API Telemetry Inspector` Tab:** 
   > *"Judges can inspect the full JSON trace here, confirming that each Swytchcode API call received parameters dynamically synthesized from earlier tool observations."*

---

## 💡 Anticipated Jury Q&A (1.5 Minutes)

**Q: How does this prove it is an AI Agent and not just a workflow automation script?**  
*A:* "A traditional workflow script blindly executes A then B with hardcoded values. In SentinelOps, the LLM reasoning loop (live on Groq) inspects the dynamic meteorological output. If the weather is mild, it takes no emergency action. If conditions exceed safety thresholds (e.g., >40°C heatwave or >80% storm probability), it dynamically formulates customized mitigation strategies, authors specific action items, and routes them to appropriate channels."

**Q: What Swytchcode APIs are used?**  
*A:* "We integrated 4 Swytchcode APIs: **OpenWeather** (physical observation), **Notion** (protocol authoring), **Slack** (team dispatch), and **Resend** (workforce email advisories). Output from OpenWeather directly dictates the contents and parameters sent to Notion, Slack, and Resend."
