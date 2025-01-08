const express = require('express');
const { PrismaClient } = require('@prisma/client');
const middleware = require('./middleware');
const token = middleware.verifyToken;

const prisma = new PrismaClient();

const router = express.Router();
router.use(token);

router.get('/:uid/', async (req, res) => {
    const { uid } = req.params;
    console.log("> Requested: " + uid);
    try {
      const user = await prisma.users.findFirst({
          where: {
              UID: parseInt(uid)
            },
      });
  
      if (!user) {
        console.log("> Rejected: " + uid);
        return res.status(404).json({error: 'Incorrect username or password' });
      }
  
      res.json(user);
      console.log("> Validated: " + user.UNAME);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error:  
   'Internal server error' });
    }
  });

  router.patch('/update/:uid/:json', async (req, res) => {
    const { uid, json } = req.params;
  
    console.log(`> Attempting to update user with UID: ${uid}`);
  
    try {
      const userData = JSON.parse(json);

  
      // Convert role to uppercase before checking (if applicable)
      const uppercaseRole = userData.ROLE ? userData.ROLE.toUpperCase() : undefined;
  
      // Check if role is valid (if applicable)
      if (uppercaseRole && !["CUSTOMER", "DELIVERER", "KITCHEN"].includes(uppercaseRole)) {
        throw new Error("Invalid role. Only CUSTOMER, DELIVERER, or KITCHEN allowed.");
      }
  
      // Build update object with only the provided fields
      const updateData = {};
      if (userData.UNAME) updateData.UNAME = userData.UNAME;
      if (userData.PWD) updateData.PWD = userData.PWD;
      if (userData.EMAIL) updateData.EMAIL = userData.EMAIL;
      if (userData.ADDR) updateData.ADDR = userData.ADDR;
      if (uppercaseRole) updateData.ROLE = uppercaseRole;
  
      const updatedUser = await prisma.users.update({
        where: {
          UID: parseInt(uid), // Ensure uid is converted to an integer
        },
        data: updateData,
      });
  
      if (updatedUser) {
        res.json(updatedUser);
        console.log(`> User with UID ${uid} updated`);
      } else {
        res.status(404).json({ error: 'User not found' });
      }
    } catch (error) {
      console.error(error);
      res.status(400).json({ error: error.message || 'Internal server error' });
    }
  });



module.exports = router;