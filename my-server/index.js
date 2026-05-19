const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const app = express();
const port = 3000;

// Connect DB
const db = require('./config/db');
db.connect();

// Middleware
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());

const isPlainObject = (value) => Object.prototype.toString.call(value) === '[object Object]';

const toCamel = (text) => text.replace(/_([a-z])/g, (_, chr) => chr.toUpperCase());
const toSnake = (text) => text.replace(/[A-Z]/g, (chr) => `_${chr.toLowerCase()}`);

const convertKeysDeep = (input, converter) => {
    if (Array.isArray(input)) {
        return input.map((item) => convertKeysDeep(item, converter));
    }
    if (input && typeof input.toObject === 'function') {
        return convertKeysDeep(input.toObject(), converter);
    }
    if (input && typeof input.toJSON === 'function' && !isPlainObject(input)) {
        return convertKeysDeep(input.toJSON(), converter);
    }
    if (!isPlainObject(input)) {
        return input;
    }
    return Object.keys(input).reduce((acc, key) => {
        const nextKey = converter(key);
        acc[nextKey] = convertKeysDeep(input[key], converter);
        return acc;
    }, {});
};

app.use((req, res, next) => {
    if (req.body && Object.keys(req.body).length > 0) {
        req.body = convertKeysDeep(req.body, toSnake);
    }

    const originalJson = res.json.bind(res);
    res.json = (payload) => originalJson(convertKeysDeep(payload, toCamel));

    next();
});

// Routes
const classRouter = require('./routes/class.router');
const ARreportSchema = require('./routes/AR-report.router');
const clientSchema = require('./routes/client.router');
const contactSchema = require('./routes/contact.router');
const courseSchema = require('./routes/course.router');
const customerSchema = require('./routes/customer.router');
const feedbackSchema = require('./routes/feedback.router');
const paymentSchema = require('./routes/payment.router');
const refundSchema = require('./routes/refund.router');
const registrationSchema = require('./routes/registration.router');
const roleSchema = require('./routes/role.router');
const salesreportSchema = require('./routes/sales-report.router');
const staffSchema = require('./routes/staff.router');
const studentreportSchema = require('./routes/student-report.router');
const voucherSchema = require('./routes/voucher.router');


app.use('/class', classRouter);
app.use('/AR-report', ARreportSchema);
app.use('/client', clientSchema);
app.use('/contact', contactSchema);
app.use('/course', courseSchema);
app.use('/customer', customerSchema);
app.use('/feedback', feedbackSchema);
app.use('/payment', paymentSchema);
app.use('/refund', refundSchema);
app.use('/registration', registrationSchema);
app.use('/role', roleSchema);
app.use('/sales-report', salesreportSchema);
app.use('/staff', staffSchema);
app.use('/student-report', studentreportSchema);
app.use('/voucher', voucherSchema);


// Start server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});