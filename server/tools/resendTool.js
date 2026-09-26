// Tool: Resend via Swytchcode
const resendTool = {
  name: 'send_resend_safety_advisory',
  description: 'Dispatches urgent safety advisory emails to field personnel, delivery drivers, or facility employees via Swytchcode Resend API.',
  parameters: {
    type: 'object',
    properties: {
      to: {
        type: 'string',
        description: 'Recipient email address or team distribution list (e.g. ops-field-staff@enterprise.com)'
      },
      subject: {
        type: 'string',
        description: 'Subject line of the urgent advisory email'
      },
      severity: {
        type: 'string',
        enum: ['CRITICAL', 'HIGH', 'MODERATE'],
        description: 'Severity level'
      },
      location: {
        type: 'string',
        description: 'Impacted region or city'
      },
      headline: {
        type: 'string',
        description: 'Lead paragraph explaining the situation and necessity for precautions'
      },
      instructions: {
        type: 'array',
        items: { type: 'string' },
        description: 'Step-by-step instructions for personnel safety'
      },
      emergencyPhone: {
        type: 'string',
        description: 'Helpline / Emergency operations center contact number'
      }
    },
    required: ['subject', 'severity', 'headline', 'instructions']
  },
  execute: async (client, args) => {
    const result = await client.sendResendAdvisory(args);
    return {
      tool: 'resend_via_swytchcode',
      status: 'success',
      data: result
    };
  }
};

module.exports = resendTool;
