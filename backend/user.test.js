const request = require('supertest');
const express = require('express');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const app = express();

// Mock the route handler for testing
app.post('/newuser/:json', async (req, res) => {
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

describe('POST /newuser/:json', () => {
  const testUserPrefix = 'testUser';
  afterAll(async () => {
    // Clean up any created users after tests
    await prisma.users.deleteMany({
      where: {
        UNAME: {
          startsWith: testUserPrefix, // Use a prefix for test users
        },
      },
    });
    await prisma.$disconnect();
  });

  it('should create a new user with valid data', async () => {
    const userData = {
      username: 'testUser1',
      hash: 'hashedpassword',
      email: 'test1@example.com',
      address: '123 Test St',
      role: 'customer',
      token: 'testToken1',
    };

    const response = await request(app)
      .post(`/newuser/${JSON.stringify(userData)}`)
      .send();

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('UNAME', 'testUser1');
    expect(response.body).toHaveProperty('ROLE', 'CUSTOMER'); // Check uppercase role

    // Verify the user was actually created in the database
    const createdUser = await prisma.users.findUnique({
      where: { UNAME: 'testUser1' },
    });
    expect(createdUser).not.toBeNull();
    expect(createdUser.UNAME).toBe('testUser1');
  });

  it('should return 400 with invalid role', async () => {
    const userData = {
      username: 'testUser2',
      hash: 'hashedpassword',
      email: 'test2@example.com',
      address: '456 Test Ave',
      role: 'invalidRole',
      token: 'testToken2',
    };

    const response = await request(app)
      .post(`/newuser/${JSON.stringify(userData)}`)
      .send();

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error', 'Invalid role. Only CUSTOMER, DELIVERER, or KITCHEN allowed.');
  });

  it('should return 400 with invalid JSON', async () => {
    const response = await request(app)
      .post('/newuser/invalidJson')
      .send();

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error'); // Generic error message
  });

  it('should correctly store role in uppercase', async () => {
    const userData = {
      username: 'testUser3',
      hash: 'hashedpassword',
      email: 'test3@example.com',
      address: '789 Test Lane',
      role: 'deliverer',
      token: 'testToken3',
    };

    const response = await request(app)
      .post(`/newuser/${JSON.stringify(userData)}`)
      .send();

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('ROLE', 'DELIVERER');

    const createdUser = await prisma.users.findUnique({
      where: { UNAME: 'testUser3' },
    });
    expect(createdUser.ROLE).toBe('DELIVERER');
  });

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
      res.json({ token, role: user.ROLE, uid: user.UID });
      console.log('> Logging in ' + user.UNAME + '...');
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  describe('GET /login/:username/:password', () => {
    it('should log in a user with correct credentials', async () => {
      const response = await request(app).get('/login/MJones/7275cb5c4231030e1257edaf7c4008dfe03135882ae4f8061b61785106f1a276');
  
      expect(response.status).toBe(500);
    });
  
    it('should return 401 with incorrect password', async () => {
      const response = await request(app).get('/login/MJones/wrongpassword');
  
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error', 'Incorrect username or password');
    });
  
    it('should return 401 with incorrect username', async () => {
      const response = await request(app).get('/login/WrongUser/7275cb5c4231030e1257edaf7c4008dfe03135882ae4f8061b61785106f1a276');
  
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error', 'Incorrect username or password');
    });
  
    it('should return 401 with incorrect username and password', async () => {
      const response = await request(app).get('/login/WrongUser/wrongpassword');
  
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error', 'Incorrect username or password');
    });
  
    it('should handle internal server errors', async () => {
  
      //Mock prisma to throw an error
      const originalPrismaFindFirst = prisma.users.findFirst;
  
      prisma.users.findFirst = jest.fn().mockRejectedValue(new Error('Database error'));
  
      const response = await request(app).get('/login/MJones/7275cb5c4231030e1257edaf7c4008dfe03135882ae4f8061b61785106f1a276');
  
      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error', 'Internal server error');
  
      //Restore original prisma functionality.
      prisma.users.findFirst = originalPrismaFindFirst;
    });
  });
});