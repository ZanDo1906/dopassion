const mongoose = require('mongoose');
const Registration = require('./models/registration');
const Payment = require('./models/payment');
const Refund = require('./models/refund');

require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://trieuminhhung2003:hung2003@cluster0.exdudn1.mongodb.net/test?retryWrites=true&w=majority').then(async () => {
    console.log('Connected to DB');

    // Fix for DK-290526-002
    await Registration.findOneAndUpdate(
        { maDangKy: 'DK-290526-002' },
        { trangThai: 'Đã khóa' }
    );
    await Payment.findOneAndUpdate(
        { maDangKy: 'DK-290526-002' },
        { trangThaiThanhToan: 'Đã hoàn tiền' }
    );
    
    // Also scan for any other refunds that are "Đã hoàn tiền" and fix them
    const completedRefunds = await Refund.find({ trangThai: 'Đã hoàn tiền' });
    for (const refund of completedRefunds) {
        if (refund.maDangKy) {
            await Registration.findOneAndUpdate(
                { maDangKy: refund.maDangKy },
                { trangThai: 'Đã khóa' }
            );
            await Payment.findOneAndUpdate(
                { maDangKy: refund.maDangKy },
                { trangThaiThanhToan: 'Đã hoàn tiền' }
            );
            console.log(`Fixed ${refund.maDangKy}`);
        }
    }

    console.log('Data fixed.');
    process.exit(0);
}).catch(err => {
    console.error(err);
    process.exit(1);
});
