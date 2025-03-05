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

  router.get('/withuid/:uid', async (req, res) => {
    const { uid } = req.params;
    console.log("> Sending menu of kitchen : " + uid);
    try {
        const Kmenu = await prisma.menu.findMany({
          where: {
              UID: parseInt(uid),
            },
      })
      res.json(Kmenu);
      if (!Kmenu) {
        console.log("> Rejected: " + username);
        return res.status(404).json({error: 'Incorrect username or password' });
      }
      
      console.log("> Found menu: " + uid);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error:  
   'Internal server error' });
    }
  });

  router.post('/add', async (req, res) => {
    const { FOOD_NAME, PRICE, FOOD_ALLERGENS, UID } = req.body;
    console.log("Attempting creation...");
    try {
      //Find the largest MENU_ID for the given UID
      const maxMenuIdResult = await prisma.menu.aggregate({
        _max: {
          MENU_ID: true,
        },
        where: {
          UID: parseInt(UID),
        },
      });
  
      const maxMenuId = maxMenuIdResult._max.MENU_ID || 0; // Handle the case where no menu items exist for the UID
  
      //Create a new menu item with the next MENU_ID
      const newMenuItem = await prisma.menu.create({
        data: {
          MENU_ID: maxMenuId + 1,
          FOOD_NAME: FOOD_NAME,
          PRICE: PRICE,
          FOOD_ALLERGENS: FOOD_ALLERGENS,
          UID: parseInt(UID),
        },
      });
  
      res.status(201).json(newMenuItem);
      console.log("> Created item: " + FOOD_NAME);
    } catch (error) {
      console.log("! Menu creation failed.")
      console.error('Error creating menu item: ', error);
      res.status(500).json({ error: 'Failed to create menu item' });
    }
  });

  router.put('/update/:menu_id', async (req, res) => {
    const { FOOD_NAME, PRICE, FOOD_ALLERGENS, UID } = req.body;
    const { menu_id } = req.params;
    console.log("> Menu updating...");
    //The menu uses a composite key. Prisma needs it to update correctly.
    const compositeKey = {
      UID: parseInt(UID),
      MENU_ID: parseInt(menu_id),
    };
    
    try {
      const updatedMenuItem = await prisma.menu.update({
        where: {
          UID_MENU_ID: compositeKey,
        },
        data: {
          FOOD_NAME: FOOD_NAME,
          PRICE: PRICE,
          FOOD_ALLERGENS: FOOD_ALLERGENS,
        },
      });
  
      res.json(updatedMenuItem);
      console.log("> Updated item: " + FOOD_NAME);
    } catch (error) {
      console.log("! Menu update failed.")
      console.error('Error updating menu item:', error);
      res.status(500).json({ error: 'Failed to update menu item' });
    }
  });

  router.delete('/delete/:menu_id', async (req, res) => {
    const { UID } = req.body;
    const { menu_id } = req.params;
    console.log("> Deleting entry...");
    //Same as update.
    const compositeKey = {
      UID: parseInt(UID),
      MENU_ID: parseInt(menu_id),
    };
    
    try {
      const deletedEntry = await prisma.menu.delete({ 
          where: {
              UID_MENU_ID: compositeKey,
          },
      });
      console.log("> Deleted.");
    } catch (error) {
      console.log("! Deletion failed.")
      console.error('Error updating menu item:', error);
      res.status(500).json({ error: 'Failed to update menu item' });
    }
  });

 module.exports = router;