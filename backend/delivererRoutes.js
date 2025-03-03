const express = require('express');
const { PrismaClient } = require('@prisma/client');
const middleware = require('./middleware');
const token = middleware.verifyToken;

const prisma = new PrismaClient();

const router = express.Router();
router.use(token);

router.get('/', async (req, res) => {
  console.log("> Listing deliverers...");
  try {
    // Get current time in datetime format
    const now = new Date();

    // Create datetime objects for start and end of the current hour
    const startOfHour = new Date(now);
    startOfHour.setMinutes(0);
    startOfHour.setSeconds(0);
    startOfHour.setMilliseconds(0);

    const endOfHour = new Date(startOfHour);
    endOfHour.setHours(endOfHour.getHours() + 1); 

    const deliverers = await prisma.deliverers.findMany();

    res.json(deliverers); 
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;