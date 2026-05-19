const mongoose = require('mongoose');
require('dotenv').config();

async function connect() {
    try {
        await mongoose.connect(process.env.DB_URL);

        console.log('MongoDB Connected');
    } catch (error) {
        console.log('Error connecting to MongoDB:', error);
    }
}

module.exports = { connect };