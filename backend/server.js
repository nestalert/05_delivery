const crypto = require('crypto');

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const  
 { PrismaClient } = require('@prisma/client');

const app = express();
const port = 8080;

const prisma = new PrismaClient();  


app.use(cors());
app.use(bodyParser.json());

app.get('/users/:username/:password', async (req, res) => {
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

app.post('/create/:json', async (req, res) => {
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

app.patch('/update/:uid/:json', async (req, res) => {
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

app.get('/menu/', async (req, res) => {
  const { kitchen } = req.params;
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

app.get('/menu/:kitchen', async (req, res) => {
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

app.get('/orders/:choice/:uid', async (req, res) => {
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

app.post('/orders/create/:json', async (req, res) => {
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

app.delete('/orders/delete/:uid', async (req, res) => {
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


app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

