const express = require('express');
const { PrismaClient } = require('@prisma/client');
const middleware = require('./middleware');
const token = middleware.verifyToken;

const prisma = new PrismaClient();

const router = express.Router();
router.use(token);

router.get('/', async (req, res) => {
    console.log("> Listing restaurants...");
    try {
      const menu = await prisma.users.findMany({
          where: {
              ROLE: "KITCHEN",
            },
              select: {
              UID: true,
              UNAME: true,
            },
      
      });
      res.json(menu);
      if (!menu) {
        return res.status(404).json({error: 'Incorrect username or password' });
      }
      
      console.log("> Found restaurants");
    } catch (error) {
      console.error(error);
      res.status(500).json({ error:  
   'Internal server error' });
    }
  });
  
router.get('/:kitchen', async (req, res) => {
    const { kitchen } = req.params;
    console.log("> Sending menu of kitchen : " + kitchen);
    try {
      const findkitchen = await prisma.users.findFirst({
          where: {
              UNAME: kitchen,
            },
      
      });
        const uid = findkitchen.UID;
        const menu = await prisma.menu.findMany({
          where: {
              UID: uid,
            },
      })
      res.json(menu);
      if (!menu) {
        console.log("> Rejected: " + username);
        return res.status(404).json({error: 'Incorrect username or password' });
      }
      
      console.log("> Found menu: " + kitchen);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error:  
   'Internal server error' });
    }
  });
 module.exports = router;