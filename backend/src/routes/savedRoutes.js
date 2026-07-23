const express = require('express');
const router = express.Router();
const { getSaved, saveProvider, unsaveProvider } = require('../controllers/savedController');
const authenticate = require('../middleware/authenticate');

/**
 * @swagger
 * tags:
 *   name: Saved
 *   description: Saved/Favourite Providers
 */

/**
 * @swagger
 * /api/saved:
 *   get:
 *     summary: Get saved providers for logged-in client
 *     tags: [Saved]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of saved providers
 */
router.get('/', authenticate, getSaved);

/**
 * @swagger
 * /api/saved/{id}:
 *   post:
 *     summary: Save a provider
 *     tags: [Saved]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       201:
 *         description: Provider saved
 */
router.post('/:id', authenticate, saveProvider);

/**
 * @swagger
 * /api/saved/{id}:
 *   delete:
 *     summary: Unsave a provider
 *     tags: [Saved]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Provider unsaved
 */
router.delete('/:id', authenticate, unsaveProvider);

module.exports = router;
