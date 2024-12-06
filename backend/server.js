const express = require('express');
const  { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const config = require('./config');
const middleware = require('./middleware');
const orderRoutes = require('./orderRoutes');
const menuRoutes = require('./menuRoutes');
const userRoutes = require('./userRoutes')

const prisma = new PrismaClient();  
const app = express();
const port = config.port;
const secretKey = 'd1acb9602970513209590380d15c33f42a7728d9395c775bc571c9d6bc49850c';
const token = middleware.verifyToken;

app.use(middleware.corsMiddleware);
app.use(middleware.bodyParserMiddleware);

app.use('/order', orderRoutes);
app.use('/menu', menuRoutes);
app.use('/users', userRoutes);

const generateToken = (id) => {
  return jwt.sign({ userId: id }, secretKey, { expiresIn: '4h' });
};

app.get('/login/:username/:password', async (req, res) => {
  console.log('> Attempting login');
  const { username, password } = req.params;

  try {
      const user = await prisma.users.findFirst({
          where: {
              UNAME: username,
              PWD: password,
          },
      });
      if (!user) {
          console.log('> Failed.');
          return res.status(401).json({ error: 'Incorrect username or password' });
      }

      const token = generateToken(user.UID); // Generate token using user's ID
      res.json({token});
      console.log('> Logging in '+ user.UNAME + '...');
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
  }
});

async function updateOrders() {
  const today = new Date();
  const oneDayAgo = new Date();
  oneDayAgo.setDate(today.getDate() - 1);
  console.log("> Updating orders at "+ today)
  const expiredOrders = await prisma.orders.findMany({
    where: {
      ORDER_DATE: { lte: oneDayAgo },
      STATUS: 'PENDING',
    },
  });

  for (const order of expiredOrders) {
    await prisma.orders.update({
      where: { 
        ORDER_ID: order.ORDER_ID 
      },
      data: { STATUS: 'EXPIRED' },
    });
  }
}
// Set up the interval
setInterval(updateOrders, 60000); // Check every minute

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

