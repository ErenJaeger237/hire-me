const { z } = require('zod');

const sendMessageSchema = z.object({
  content: z.string().min(1, 'Message content cannot be empty')
});

module.exports = { sendMessageSchema };
