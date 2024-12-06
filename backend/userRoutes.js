const express = require('express');
const { PrismaClient } = require('@prisma/client');
const middleware = require('./middleware');
const token = middleware.verifyToken;

const prisma = new PrismaClient();

const router = express.Router();
//router.use(token);

router.get('/:username/:password', async (req, res) => {
    const { username,password } = req.params;
    console.log("> Requested: " + username);
    try {
      const user = await prisma.users.findFirst({
          where: {
              UNAME: username,
              PWD: password,
            },
      });
  
      if (!user) {
        console.log("> Rejected: " + username);
        return res.status(404).json({error: 'Incorrect username or password' });
      }
  
      res.json(user);
      console.log("> Validated: " + username);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error:  
   'Internal server error' });
    }
  });

  router.patch('/update/:uid/:json', async (req, res) => {
    const { uid, json } = req.params;
  
    console.log(`> Attempting to update user with ID: ${uid}`);
  
    try {
      const userData = JSON.parse(json);
  
      // Optional: Include checks for allowed fields to update (e.g., username, email, etc.)
      const { username, email, address, role} = userData; // Modify as needed
  
      // Convert role to uppercase before checking (if applicable)
      const uppercaseRole = role ? role.toUpperCase() : undefined;
  
      // Check if role is valid (if applicable)
      if (uppercaseRole && !["CUSTOMER", "DELIVERER", "KITCHEN"].includes(uppercaseRole)) {
        throw new Error("Invalid role. Only CUSTOMER, DELIVERER, or KITCHEN allowed.");
      }
  
      // Build update object with only the provided fields
      const updateData = {};
      if (username) updateData.UNAME = username;
      if (email) updateData.EMAIL = email;
      if (address) updateData.ADDR = address;
      if (uppercaseRole) updateData.ROLE = uppercaseRole;
  
      const updatedUser = await prisma.users.update({
        where: {
          ID: parseInt(uid), // Ensure uid is converted to an integer
        },
        data: updateData,
      });
  
      if (updatedUser) {
        res.json(updatedUser);
        console.log(`> User with ID ${uid} updated`);
      } else {
        res.status(404).json({ error: 'User not found' });
      }
    } catch (error) {
      console.error(error);
      res.status(400).json({ error: error.message || 'Internal server error' });
    }
  });

  router.post('/create/:json', async (req, res) => {
    const { json } = req.params;
    console.log("> Attempted creation of user");
    try {
      const userData = JSON.parse(json);
      const { username, hash, email, address, role, token } = userData;
  
      // Convert role to uppercase before checking
      const uppercaseRole = role.toUpperCase();
  
      // Check if role is valid
      if (!["CUSTOMER", "DELIVERER", "KITCHEN"].includes(uppercaseRole)) {
        throw new Error("Invalid role. Only CUSTOMER, DELIVERER, or KITCHEN allowed.");
      }
  
      const newUser = await prisma.users.create({
        data: {
          UNAME: username,
          PWD: hash,
          EMAIL: email,
          ADDR: address,
          ROLE: uppercaseRole, // Store role in uppercase
          BANK_TOKEN: token,
        },
      });
  
      res.json(newUser);
      console.log("> Created user: " + username);
    } catch (error) {
      console.error(error);
      res.status(400).json({ error: error.message || 'Internal server error' });
    }
  });
module.exports = router;