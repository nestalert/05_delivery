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
    const users = await prisma.users.findFirst({
        where: {
            UNAME: username,
            PWD: password,
          },
    });

    if (!users) {
      console.log("> Rejected: " + username);
      return res.status(404).json({error: 'Incorrect username or password' });
    }

    res.json(users);
    console.log("> Validated: " + username);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error:  
 'Internal server error' });
  }
});

app.post('/create/:json', async (req, res) => {
  const { json } = req.params;
  console.log("> Attempted creation")
  try {
    const userData = JSON.parse(json);
    const { username, hash, email, address, role,token } = userData;
    const newUser = await prisma.users.create({
      data: {
        UNAME: username,
        PWD: hash,
        EMAIL: email,
        ADDR: address,
        ROLE: role,
        BANK_TOKEN: token,
      },
    });

    res.json(newUser);
    console.log("> Created user: " + username);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});