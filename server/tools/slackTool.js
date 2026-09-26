// Tool: Slack via Swytchcode
const slackTool = {
  name: 'post_slack_incident_alert',
  description: 'Dispatches high-priority incident alert notifications, live hazard telemetry, and interactive response buttons to the operations Slack channel via Swytchcode Slack API.',
  parameters: {
    type: 'object',
    properties: {
      channel: {
        type: 'string',
        description: 'Slack channel name (e.g. #ops-emergency-dispatch or #field-safety)'
      },
      severity: {
        type: 'string',
        enum: ['CRITICAL', 'HIGH', 'MODERATE', 'INFO'],
        description: 'Incident severity level'
      },
      title: {
        type: 'string',
        description: 'Concise alert headline'
      },
      summary: {
        type: 'string',
        description: 'Detailed alert summary explaining current hazard conditions'
      },
      weatherMetrics: {
        type: 'object',
        properties: {
          temperature: { type: 'number' },
          windSpeed: { type: 'number' },
          rainProbability: { type: 'number' }
        },
        description: 'Numerical telemetry metrics for the Slack card'
      },
      notionUrl: {
        type: 'string',
        description: 'Link to the Notion incident protocol created in the previous step'
      },
      recommendedActions: {
        type: 'array',
        items: { type: 'string' },
        description: 'Bullet points of immediate actions for the on-call team'
      }
    },
    required: ['severity', 'title', 'summary', 'recommendedActions']
  },
  execute: async (client, args) => {
    const result = await client.postSlackIncidentAlert(args);
    return {
      tool: 'slack_via_swytchcode',
      status: 'success',
      data: result
    };
  }
};

module.exports = slackTool;
