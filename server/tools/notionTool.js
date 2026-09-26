// Tool: Notion via Swytchcode
const notionTool = {
  name: 'create_notion_incident_protocol',
  description: 'Creates a structured incident response document, operational contingency plan, and task checklist in Notion via Swytchcode Notion API.',
  parameters: {
    type: 'object',
    properties: {
      title: {
        type: 'string',
        description: 'Title of the incident protocol document (e.g. "Gurgaon Monsoon Waterlogging & Dispatch Contingency")'
      },
      severity: {
        type: 'string',
        enum: ['CRITICAL', 'HIGH', 'MODERATE', 'LOW'],
        description: 'Assessed risk severity level based on weather telemetry'
      },
      location: {
        type: 'string',
        description: 'Geographic location affected'
      },
      weatherSummary: {
        type: 'string',
        description: 'Summary of the weather metrics that triggered this incident'
      },
      contingencyPlan: {
        type: 'string',
        description: 'Strategic operational plan detailing adjustments to fleet, personnel, or office safety'
      },
      actionItems: {
        type: 'array',
        items: { type: 'string' },
        description: 'List of specific actionable checklist items for response teams'
      }
    },
    required: ['title', 'severity', 'location', 'contingencyPlan', 'actionItems']
  },
  execute: async (client, args) => {
    const result = await client.createNotionIncidentProtocol(args);
    return {
      tool: 'notion_via_swytchcode',
      status: 'success',
      data: result
    };
  }
};

module.exports = notionTool;
