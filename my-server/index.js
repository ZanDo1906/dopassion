const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Connect DB
const db = require('./config/db');
db.connect();

// Middleware
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
const classRouter = require('./routes/class.router');
const ARreportSchema = require('./routes/AR-report.router');
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
app.get('/', (req, res) => {
    res.send('Backend is running');
});

// Start server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});