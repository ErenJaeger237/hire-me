const { z } = require('zod');

const updateProfileSchema = z.object({
  phone_number: z.string().optional(),
  profile_picture_url: z.string().url().optional().or(z.literal('')),
  location_text: z.string().optional(),
  location_lat: z.number().optional(),
  location_lng: z.number().optional(),
  resume_url: z.string().url().optional().or(z.literal('')),
  bio: z.string().optional()
});

module.exports = { updateProfileSchema };
