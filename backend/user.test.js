// tests/integration/backend/user.test.js
import '@testing-library/jest-dom';

const request = require('supertest'); 
const express = require('express');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const app = express();

describe('User API', () => {
  it('should create a new user', async () => {
    const response = await request(app)
      .post('/newuser/{"UNAME": "TEST USER","PWD": "123"}')

    expect(response.status).toBe(201);
    expect(response.body.UNAME).toBe('TEST USER');
    expect(response.body.PWD).toBe('123');

    const user = await prisma.users.findUnique({
      where: { UID: response.body.UID },
    });
    expect(user).toBeTruthy();
  });

  // Add more tests for other API endpoints
});