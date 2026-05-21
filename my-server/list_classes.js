const mongoose = require('mongoose');
const Class = require('./models/class.js');
require('dotenv').config();

async function run() {
  try {
    const dbUrl = process.env.DB_URL;
    console.log('Connecting to:', dbUrl);
    await mongoose.connect(dbUrl);
    console.log('Connected successfully!');

    const classes = await Class.find().limit(5);
    console.log('Sample classes from database:');
    classes.forEach(c => {
      console.log(`ID: ${c._id}, maLop: ${c.maLop}, tenLop: ${c.tenLop}`);
    });

  } catch (error) {
    console.error('Error occurred:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected!');
  }
}

run();
