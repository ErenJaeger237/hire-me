const { z } = require('zod');

const createBookingSchema = z.object({
  providerId: z.number().int().positive('providerId must be a positive integer'),
  date: z.string().datetime({ message: 'Invalid datetime format' }),
  description: z.string().optional()
});

const getBookingsSchema = z.object({
  page: z.string().regex(/^\d+$/).optional(),
  limit: z.string().regex(/^\d+$/).optional()
});

const updateBookingStatusSchema = z.object({
  status: z.enum(['ACCEPTED', 'REJECTED', 'COMPLETED'])
});

const addReviewSchema = z.object({
  rating: z.number().min(1).max(5),
  reviewText: z.string().optional()
});

module.exports = { 
  createBookingSchema, 
  getBookingsSchema, 
  updateBookingStatusSchema, 
  addReviewSchema 
};
