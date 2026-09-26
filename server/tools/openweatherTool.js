// Tool: OpenWeather via Swytchcode
const openweatherTool = {
  name: 'get_weather_risk_assessment',
  description: 'Fetches real-time weather conditions, forecasts, and environmental hazard metrics for a given city/region via Swytchcode OpenWeather API.',
  parameters: {
    type: 'object',
    properties: {
      city: {
        type: 'string',
        description: 'The city or region to inspect (e.g. Gurgaon, Delhi, Bengaluru, Mumbai)'
      },
      country: {
        type: 'string',
        description: 'Country code (default "IN" for India)'
      }
    },
    required: ['city']
  },
  execute: async (client, args) => {
    const city = args.city || 'Gurgaon';
    const country = args.country || 'IN';
    const result = await client.getWeather(city, country);
    return {
      tool: 'openweather_via_swytchcode',
      status: 'success',
      data: result
    };
  }
};

module.exports = openweatherTool;
