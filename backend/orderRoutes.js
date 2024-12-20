const express = require('express');
const { PrismaClient } = require('@prisma/client');
const middleware = require('./middleware');
const token = middleware.verifyToken;

const prisma = new PrismaClient();

const router = express.Router();
router.use(token);

router.delete('/delete/:uid', async (req, res) => {
    const { uid } = req.params;
    console.log("> Deleting order");
    try {
      const order = await prisma.orders.delete({
          where: {
              ORDER_ID: uid
            },
      });
  
      if (!order) {
        console.log("> No order found");
        return res.status(404).json({error: 'Incorrect username or password' });
      }
  
      res.status(200);
      console.log("> Deleted order.");
    } catch (error) {
      console.error(error);
      res.status(500).json({ error:  
   'Internal server error' });
    }
  });

router.get('/:choice/:uid', async (req, res) => {
      const { choice, uid } = req.params;
      console.log("> Looking for orders")
      let whereClause;
      localUid = parseInt(uid);
      switch (parseInt(choice)) {
          case 1:
              whereClause = { CUSTOMER_ID: localUid };
              break;
          case 2:
              whereClause = { KITCHEN_ID: localUid };
              break;
          case 3:
              whereClause = { DELIVERER_ID: localUid };
              break;
          default:
              whereClause = { ORDER_ID: localUid };
      }
  
      try {
          const orders = await prisma.orders.findMany({
              where: whereClause,
          });
          console.log("> Found order(s)")
          res.json(orders);
      } catch (error) {
          console.error('Error fetching orders:', error);
          res.status(500).json({ error: 'Failed to fetch orders' });
      }
  });

router.get('/options/', async (req, res) => {
    console.log("> Delivery options")
    try {
      const orders = await prisma.orders.findMany({
          where: {
          STATUS: "PENDING"
        }
      });
      res.json(orders);
  } catch (error) {
      console.error('Error fetching orders:', error);
      res.status(500).json({ error: 'Failed to fetch orders' });
  }
  });

router.post('/create/:json', async (req, res) => {
    const { json } = req.params;
    console.log("> Attempted creation of order");
    try {
      const userData = JSON.parse(json);
      const {customer_id,kitchen_id,deliverer_id,total_amount } = userData;
  
       const newOrder = await prisma.orders.create({
        data: {
          CUSTOMER_ID:customer_id,
          KITCHEN_ID:kitchen_id,
          DELIVERER_ID:deliverer_id,
          TOTAL_AMOUNT:total_amount
        },
      });
      res.json(newOrder);
      console.log("> Created order");
    } catch (error) {
      console.error(error);
      res.status(400).json({ error: error.message || 'Internal server error' });
    }
  });
  module.exports = router;
