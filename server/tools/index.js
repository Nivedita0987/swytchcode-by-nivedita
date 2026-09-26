// Tools Registry for Swytchcode Real-World Agent (Track 5)
const openweatherTool = require('./openweatherTool');
const notionTool = require('./notionTool');
const slackTool = require('./slackTool');
const resendTool = require('./resendTool');

const allTools = [openweatherTool, notionTool, slackTool, resendTool];

// Format tools into OpenAI / Groq function definition format
const toolDefinitions = allTools.map(tool => ({
  type: 'function',
  function: {
    name: tool.name,
    description: tool.description,
    parameters: tool.parameters
  }
}));

async function executeTool(toolName, args, swytchcodeClient) {
  const tool = allTools.find(t => t.name === toolName);
  if (!tool) {
    throw new Error(`Tool "${toolName}" is not registered in Swytchcode tool registry.`);
  }
  return await tool.execute(swytchcodeClient, args);
}

module.exports = {
  allTools,
  toolDefinitions,
  executeTool
};
