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

app.get('/users/:username', async (req, res) => {
  const { username } = req.params;

  try {
    const users = await prisma.users.findFirst({
        where: {
            UNAME: username,
          },
    });

    if (!users) {
      return res.status(404).json({  
 error: 'User not found' });
    }

    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error:  
 'Internal server error' });
  }
});

const fs = require('fs');

app.get('/create', async (req, res) => {
  try {
    const fileContent = fs.readFileSync('../user.json', 'utf-8').split('\r\n');
    const [username, temppass, email, address, role, bankToken] = fileContent;
    const password = crypto.createHash('sha256').update(temppass).digest('hex');
    const newUser = await prisma.users.create({
        data: {
          UNAME: username,
          PWD: password,
          EMAIL: email,
          ADDR: address,
          ROLE: role,
          BANK_TOKEN: bankToken,
        },
    });
    res.json(newUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error creating user' });
  }
});


app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});