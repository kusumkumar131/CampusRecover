const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

const User = require('../models/User');
const Item = require('../models/Item');
const Report = require('../models/Report');
const Message = require('../models/Message');
const Notification = require('../models/Notification');
const QRScan = require('../models/QRScan');

const generateItemId = require('../utils/generateItemId');
const generateQRCode = require('../utils/generateQRCode');

dotenv.config();

const seedDatabase = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/campusrecover');
    console.log('Database connected for seeding...');

    // Clear existing data
    await User.deleteMany();
    await Item.deleteMany();
    await Report.deleteMany();
    await Message.deleteMany();
    await Notification.deleteMany();
    await QRScan.deleteMany();
    console.log('Cleared existing database records.');

    // 1. Create Users
    const salt = await bcrypt.genSalt(10);
    const commonPasswordHash = await bcrypt.hash('Demo@123', salt);

    const users = await User.insertMany([
      {
        name: 'Kumar K.',
        studentId: 'STU1001',
        email: 'kumar@example.com',
        phone: '9876543210',
        department: 'Computer Science',
        year: 3,
        passwordHash: commonPasswordHash,
        profileImage: '',
        role: 'student',
        isVerified: true
      },
      {
        name: 'Jane Doe (Finder)',
        studentId: 'STU1002',
        email: 'finder@example.com',
        phone: '9876501234',
        department: 'Mechanical Engineering',
        year: 2,
        passwordHash: commonPasswordHash,
        profileImage: '',
        role: 'student',
        isVerified: true
      },
      {
        name: 'Admin Officer',
        studentId: 'ADM1001',
        email: 'admin@example.com',
        phone: '9998887776',
        department: 'Administration',
        year: 4,
        passwordHash: commonPasswordHash,
        profileImage: '',
        role: 'admin',
        isVerified: true
      }
    ]);

    const kumar = users[0];
    const finder = users[1];
    const admin = users[2];

    console.log('Users seeded.');

    // 2. Create Items for Kumar
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

    // Laptop (ACTIVE)
    const laptopId = generateItemId('Electronics');
    const laptopQr = await generateQRCode(`${clientUrl}/scan/${laptopId}`);
    const laptop = await Item.create({
      owner: kumar._id,
      itemId: laptopId,
      name: 'MacBook Pro 14"',
      category: 'Electronics',
      description: 'Space Gray MacBook Pro with student stickers on the cover',
      brand: 'Apple',
      color: 'Space Gray',
      identificationDetails: 'Serial: C02DF123XXXX, stickers of GitHub and React.',
      qrCodeUrl: laptopQr,
      status: 'ACTIVE'
    });

    // Laptop Charger (LOST)
    const chargerId = generateItemId('Electronics');
    const chargerQr = await generateQRCode(`${clientUrl}/scan/${chargerId}`);
    const charger = await Item.create({
      owner: kumar._id,
      itemId: chargerId,
      name: 'Laptop Charger',
      category: 'Electronics',
      description: 'Black Dell USB-C 65W charger',
      brand: 'Dell',
      color: 'Black',
      identificationDetails: 'Slight scratch near the connector pin.',
      qrCodeUrl: chargerQr,
      status: 'LOST'
    });

    // Headset (CONTACTED / IN_PROGRESS)
    const headsetId = generateItemId('Electronics');
    const headsetQr = await generateQRCode(`${clientUrl}/scan/${headsetId}`);
    const headset = await Item.create({
      owner: kumar._id,
      itemId: headsetId,
      name: 'Sony WH-1000XM4 Headset',
      category: 'Electronics',
      description: 'Silver wireless noise cancelling headphones',
      brand: 'Sony',
      color: 'Silver',
      identificationDetails: 'Sony logo slightly faded on left cup.',
      qrCodeUrl: headsetQr,
      status: 'CONTACTED'
    });

    // Book (RETURNED / SOLVED)
    const bookId = generateItemId('Books');
    const bookQr = await generateQRCode(`${clientUrl}/scan/${bookId}`);
    const book = await Item.create({
      owner: kumar._id,
      itemId: bookId,
      name: 'Introduction to Algorithms',
      category: 'Books',
      description: 'CLRS 3rd Edition textbook, slightly worn spine',
      brand: 'MIT Press',
      color: 'Black/Blue',
      identificationDetails: 'Kumar written in ink on the first page.',
      qrCodeUrl: bookQr,
      status: 'RETURNED'
    });

    // Power Bank (ACTIVE)
    const powerBankId = generateItemId('Electronics');
    const powerBankQr = await generateQRCode(`${clientUrl}/scan/${powerBankId}`);
    const powerBank = await Item.create({
      owner: kumar._id,
      itemId: powerBankId,
      name: 'Anker Power Bank 20000mAh',
      category: 'Electronics',
      description: 'Heavy black external battery pack',
      brand: 'Anker',
      color: 'Black',
      identificationDetails: 'Single blue sticker on the back.',
      qrCodeUrl: powerBankQr,
      status: 'ACTIVE'
    });

    console.log('Items seeded.');

    // 3. Create Reports
    // Charger Lost Report (LOST - UNSOLVED)
    const chargerReport = await Report.create({
      item: charger._id,
      owner: kumar._id,
      type: 'LOST',
      location: 'Classroom 204',
      date: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      time: '14:30',
      description: 'Left it plugged in near the back corner desk under the whiteboard.',
      status: 'UNSOLVED'
    });

    // Headset Lost Report (CONTACTED - IN_PROGRESS)
    const headsetReport = await Report.create({
      item: headset._id,
      owner: kumar._id,
      type: 'LOST',
      location: 'Library Second Floor',
      date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      time: '11:00',
      description: 'Left on the reading desks near the CS books section.',
      status: 'FOUND', // Marked found by finder
      foundBy: finder._id,
      foundAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      contactedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    });

    // Book Lost Report (RETURNED - SOLVED)
    const bookReport = await Report.create({
      item: book._id,
      owner: kumar._id,
      type: 'LOST',
      location: 'Student Activity Center',
      date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
      time: '18:00',
      description: 'Left on the cafeteria tables.',
      status: 'SOLVED',
      foundBy: finder._id,
      foundAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000),
      contactedAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000),
      handoverAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
      returnedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000)
    });

    console.log('Reports seeded.');

    // 4. Create QR Scans
    // Charger Scanned by anonymous 12 hours ago
    await QRScan.create({
      item: charger._id,
      scanner: null,
      scannedAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
      action: 'VIEWED',
      location: 'Classroom 204'
    });

    // Headset Scanned by finder 2 days ago
    await QRScan.create({
      item: headset._id,
      scanner: finder._id,
      scannedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      action: 'FOUND_REPORTED',
      location: 'Library'
    });

    // Book Scanned by finder 9 days ago
    await QRScan.create({
      item: book._id,
      scanner: finder._id,
      scannedAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000),
      action: 'CONTACTED',
      location: 'Student Activity Center'
    });

    console.log('QR Scans seeded.');

    // 5. Create Messages
    // Conversation for Headset between Kumar and Finder
    await Message.insertMany([
      {
        sender: finder._id,
        receiver: kumar._id,
        item: headset._id,
        report: headsetReport._id,
        message: 'Hi Kumar, I found your Sony headphones on the library desk. They are safe with me.',
        read: true,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
      },
      {
        sender: kumar._id,
        receiver: finder._id,
        item: headset._id,
        report: headsetReport._id,
        message: 'Oh thank god! I was so worried. Thank you so much for picking them up.',
        read: true,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 10 * 60 * 1000) // +10 mins
      },
      {
        sender: finder._id,
        receiver: kumar._id,
        item: headset._id,
        report: headsetReport._id,
        message: 'No problem! Can we meet tomorrow at the library entrance at 2 PM to hand them over?',
        read: false, // Unread message for Kumar
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
      }
    ]);

    // Conversation for Book (Solved, all read)
    await Message.insertMany([
      {
        sender: finder._id,
        receiver: kumar._id,
        item: book._id,
        report: bookReport._id,
        message: 'Hey, I found your Algorithms book in the cafeteria.',
        read: true,
        createdAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000)
      },
      {
        sender: kumar._id,
        receiver: finder._id,
        item: book._id,
        report: bookReport._id,
        message: 'Awesome! Let me know when you are free.',
        read: true,
        createdAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000 + 5 * 60 * 1000)
      },
      {
        sender: finder._id,
        receiver: kumar._id,
        item: book._id,
        report: bookReport._id,
        message: 'I am here now. Handed it over to you!',
        read: true,
        createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000)
      }
    ]);

    console.log('Messages seeded.');

    // 6. Create Notifications
    // Notification for Kumar (Unread message, item found)
    await Notification.insertMany([
      {
        user: kumar._id,
        type: 'ITEM_FOUND',
        title: 'Sony WH-1000XM4 Headset Found',
        message: 'Jane Doe (Finder) reported that they found your Sony WH-1000XM4 Headset.',
        relatedItem: headset._id,
        relatedReport: headsetReport._id,
        isRead: true
      },
      {
        user: kumar._id,
        type: 'NEW_MESSAGE',
        title: 'New Message from Jane Doe (Finder)',
        message: 'Can we meet tomorrow at the library entrance...',
        relatedItem: headset._id,
        relatedReport: headsetReport._id,
        isRead: false // Unread
      },
      {
        user: kumar._id,
        type: 'QR_SCANNED',
        title: 'QR Code Scanned',
        message: 'Someone scanned the QR code on your Laptop Charger.',
        relatedItem: charger._id,
        isRead: false // Unread
      }
    ]);

    console.log('Notifications seeded.');
    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error.message);
    process.exit(1);
  }
};

seedDatabase();
