const request = require('supertest');
const mongoose = require('mongoose');
const { app, server } = require('./server');
const User = require('./models/User');
const Item = require('./models/Item');
const Report = require('./models/Report');
const Message = require('./models/Message');

describe('CampusRecover API Integration Tests', () => {
  let ownerToken;
  let finderToken;
  let otherToken;
  let testItemId;
  let testItemMongoId;
  let testReportId;

  beforeAll(async () => {
    // Connect to database and clear test entries
    // Since we use the same connection as server.js, just make sure we clear test accounts
    await User.deleteMany({ email: { $in: ['testowner@college.edu', 'testfinder@college.edu', 'testother@college.edu'] } });
  });

  afterAll(async () => {
    // Clean up test data
    await User.deleteMany({ email: { $in: ['testowner@college.edu', 'testfinder@college.edu', 'testother@college.edu'] } });
    if (testItemMongoId) {
      await Item.deleteOne({ _id: testItemMongoId });
      await Report.deleteOne({ item: testItemMongoId });
      await Message.deleteMany({ item: testItemMongoId });
    }
    // Close database connection and server
    await mongoose.connection.close();
    await server.close();
  });

  describe('Authentication Endpoints', () => {
    it('should register a new owner student', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test Owner',
          studentId: 'STU9901',
          email: 'testowner@college.edu',
          phone: '9876543210',
          department: 'Computer Science',
          year: 3,
          password: 'Password123',
          confirmPassword: 'Password123'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user).toBeDefined();
      expect(res.body.data.user.email).toBe('testowner@college.edu');
      ownerToken = res.headers['set-cookie'][0].split(';')[0].split('=')[1];
    });

    it('should register a finder student', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test Finder',
          studentId: 'STU9902',
          email: 'testfinder@college.edu',
          phone: '9876543211',
          department: 'Electronics',
          year: 2,
          password: 'Password123',
          confirmPassword: 'Password123'
        });

      expect(res.statusCode).toBe(201);
      finderToken = res.headers['set-cookie'][0].split(';')[0].split('=')[1];
    });

    it('should register a third unrelated student', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test Other',
          studentId: 'STU9903',
          email: 'testother@college.edu',
          phone: '9876543212',
          department: 'Chemistry',
          year: 1,
          password: 'Password123',
          confirmPassword: 'Password123'
        });

      expect(res.statusCode).toBe(201);
      otherToken = res.headers['set-cookie'][0].split(';')[0].split('=')[1];
    });

    it('should log in using student ID', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          emailOrStudentId: 'STU9901',
          password: 'Password123'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('Item Lifecycle & QR Scan', () => {
    it('should register an item for the owner', async () => {
      const res = await request(app)
        .post('/api/items')
        .set('Cookie', `token=${ownerToken}`)
        .send({
          name: 'Test Laptop Charger',
          category: 'Electronics',
          description: 'Test Dell Charger USB-C',
          brand: 'Dell',
          color: 'Black'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.item.itemId).toBeDefined();
      expect(res.body.data.item.status).toBe('ACTIVE');

      testItemId = res.body.data.item.itemId;
      testItemMongoId = res.body.data.item._id;
    });

    it('should scan QR code and return only safe privacy info', async () => {
      const res = await request(app)
        .get(`/api/qr/${testItemId}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.item.name).toBe('Test Laptop Charger');
      expect(res.body.data.item.owner.name).toBe('Test Owner');
      
      // Verification: Should NOT expose phone or email
      expect(res.body.data.item.owner.email).toBeUndefined();
      expect(res.body.data.item.owner.phone).toBeUndefined();
    });

    it('should report the item as LOST', async () => {
      const res = await request(app)
        .post('/api/reports/lost')
        .set('Cookie', `token=${ownerToken}`)
        .send({
          itemId: testItemId,
          location: 'Library Desk 12',
          description: 'Forgotten after studying'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.item.status).toBe('LOST');
      testReportId = res.body.data.report._id;
    });

    it('should allow the finder to report the item as FOUND', async () => {
      const res = await request(app)
        .post('/api/reports/found')
        .set('Cookie', `token=${finderToken}`)
        .send({
          itemId: testItemId,
          location: 'Library desk 12',
          description: 'Found plugged in'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.item.status).toBe('FOUND');
    });

    it('should block the owner from reporting their own item as found', async () => {
      const res = await request(app)
        .post('/api/reports/found')
        .set('Cookie', `token=${ownerToken}`)
        .send({
          itemId: testItemId
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('In-app Messaging & Rule Validation', () => {
    it('should allow finder to message owner', async () => {
      const res = await request(app)
        .post('/api/messages')
        .set('Cookie', `token=${finderToken}`)
        .send({
          receiverId: (await User.findOne({ email: 'testowner@college.edu' }))._id,
          itemId: testItemMongoId,
          message: 'Hi, I found your charger!'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);

      // Verify item transitions to CONTACTED
      const updatedItem = await Item.findById(testItemMongoId);
      expect(updatedItem.status).toBe('CONTACTED');
    });

    it('should block third unrelated student from messaging', async () => {
      const res = await request(app)
        .post('/api/messages')
        .set('Cookie', `token=${otherToken}`)
        .send({
          receiverId: (await User.findOne({ email: 'testowner@college.edu' }))._id,
          itemId: testItemMongoId,
          message: 'Hi, can I have it?'
        });

      expect(res.statusCode).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('should block third unrelated student from viewing messages', async () => {
      const res = await request(app)
        .get(`/api/messages/${testItemMongoId}`)
        .set('Cookie', `token=${otherToken}`);

      expect(res.statusCode).toBe(403);
    });

    it('should allow participants (owner) to view messages', async () => {
      const res = await request(app)
        .get(`/api/messages/${testItemMongoId}`)
        .set('Cookie', `token=${ownerToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBe(1);
    });
  });

  describe('Handover and Solve Flow', () => {
    it('should transition item to HANDOVER_PENDING when owner proposes handover', async () => {
      const res = await request(app)
        .patch(`/api/reports/${testReportId}`)
        .set('Cookie', `token=${ownerToken}`)
        .send({
          status: 'HANDOVER_PENDING'
        });

      expect(res.statusCode).toBe(200);
      const updatedItem = await Item.findById(testItemMongoId);
      expect(updatedItem.status).toBe('HANDOVER_PENDING');
    });

    it('should allow owner to confirm receipt and solve the case', async () => {
      const res = await request(app)
        .post(`/api/reports/${testReportId}/confirm-return`)
        .set('Cookie', `token=${ownerToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.report.status).toBe('SOLVED');
      expect(res.body.data.item.status).toBe('RETURNED');
    });
  });
});
