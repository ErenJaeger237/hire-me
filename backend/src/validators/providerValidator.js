const { z } = require('zod');

const getProvidersSchema = z.object({
  category: z.string().optional(),
  maxPrice: z.string().regex(/^\d+(\.\d+)?$/).optional(),
  lat: z.string().regex(/^-?\d+(\.\d+)?$/).optional(),
  lng: z.string().regex(/^-?\d+(\.\d+)?$/).optional(),
  page: z.string().regex(/^\d+$/).optional(),
  limit: z.string().regex(/^\d+$/).optional()
});

module.exports = { getProvidersSchema };
