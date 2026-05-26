const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.DB_URL).then(async () => {
    const db = mongoose.connection.db;
    const doc = await db.collection('class').findOne();
    console.log(typeof doc.ngayBatDau);
    console.log(doc.ngayBatDau.constructor.name);
    console.log(doc.ngayBatDau);
    process.exit(0);
}).catch(console.error);
