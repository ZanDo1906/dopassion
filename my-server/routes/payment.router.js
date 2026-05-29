const express = require('express');
const router = express.Router();

const Payment = require('../models/payment');
const Customer = require('../models/customer');
const Registration = require('../models/registration');

// Helper to get day/month/year code
function getCurrentDateCode() {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = String(now.getFullYear()).slice(-2);
    return `${day}${month}${year}`;
}

// POST checkout
router.post('/checkout', async (req, res) => {
    try {
        const {
            email,
            tenKhachHang,
            maLop,
            tenLop,
            chiNhanh,
            hocPhi,
            remainingAmount,
            voucherCode,
            discountAmount
        } = req.body;

        if (!email || !tenKhachHang || !maLop) {
            return res.status(400).json({ message: 'Email, tên khách hàng và mã lớp là bắt buộc.' });
        }

        const dateCode = getCurrentDateCode();

        // 1. Check or Create Customer
        let customer = await Customer.findOne({ email: email.trim().toLowerCase() });
        let isNewCustomer = false;

        if (!customer) {
            isNewCustomer = true;
            // Generate maKh
            const pattern = new RegExp(`^KH-${dateCode}-\\d{3}$`, 'i');
            const existingCustomers = await Customer.find({ maKh: pattern });
            let maxSeq = 0;
            existingCustomers.forEach(c => {
                if (c.maKh) {
                    const match = c.maKh.match(/-(\d{3})$/);
                    if (match) {
                        maxSeq = Math.max(maxSeq, parseInt(match[1], 10));
                    }
                }
            });
            const nextSeq = maxSeq + 1;
            const maKh = `KH-${dateCode}-${String(nextSeq).padStart(3, '0')}`;

            customer = new Customer({
                maKh,
                tenKhachHang,
                email: email.trim().toLowerCase(),
                ngayDangKy: new Date(),
                trangThai: 'Chờ thanh toán',
                active: true
            });
            await customer.save();
        } else {
            // Update existing customer to 'Chờ thanh toán'
            customer.trangThai = 'Chờ thanh toán';
            await customer.save();
        }

        // 2. Generate Registration
        const patternDk = new RegExp(`^DK-${dateCode}-\\d{3}$`, 'i');
        const existingRegistrations = await Registration.find({ maDangKy: patternDk });
        let maxSeqDk = 0;
        existingRegistrations.forEach(r => {
            const match = r.maDangKy.match(/-(\d{3})$/);
            if (match) {
                maxSeqDk = Math.max(maxSeqDk, parseInt(match[1], 10));
            }
        });
        const nextSeqDk = maxSeqDk + 1;
        const maDangKy = `DK-${dateCode}-${String(nextSeqDk).padStart(3, '0')}`;

        const lastReg = await Registration.findOne().sort({ stt: -1 });
        const nextRegStt = lastReg && lastReg.stt ? lastReg.stt + 1 : 1;

        const registration = new Registration({
            stt: nextRegStt,
            maDangKy,
            maKh: customer.maKh,
            tenKh: customer.tenKhachHang,
            maLop,
            tenLopHoc: tenLop,
            khoaHoc: maLop.split('-')[0] || 'TOEIC',
            tenKhoa: tenLop,
            chiNhanh,
            ngayDangKy: new Date(),
            trangThai: 'Chờ thanh toán'
        });
        await registration.save();

        // 3. Generate Payment (Debt)
        const lastPay = await Payment.findOne().sort({ stt: -1 });
        const nextPayStt = lastPay && lastPay.stt ? lastPay.stt + 1 : 1;

        const payment = new Payment({
            stt: nextPayStt,
            maDangKy,
            maKh: customer.maKh,
            tenKh: customer.tenKhachHang,
            maLop,
            tenLopHoc: tenLop,
            khoaHoc: maLop.split('-')[0] || 'TOEIC',
            tenKhoa: tenLop,
            chiNhanh,
            ngayDangKy: new Date(),
            hocPhi,
            voucher: voucherCode || '',
            thongSoGiam: discountAmount || 0,
            soTienCanThanhToan: remainingAmount,
            soTienConLai: remainingAmount,
            trangThaiThanhToan: 'Chờ thanh toán'
        });
        await payment.save();

        // 4. Set 10 minutes timeout to update status to 'Chưa thanh toán'
        setTimeout(async () => {
            try {
                const currentPayment = await Payment.findById(payment._id);
                if (currentPayment && currentPayment.trangThaiThanhToan === 'Chờ thanh toán') {
                    currentPayment.trangThaiThanhToan = 'Chưa thanh toán';
                    await currentPayment.save();

                    await Registration.findOneAndUpdate(
                        { maDangKy: currentPayment.maDangKy },
                        { trangThai: 'Chưa thanh toán' }
                    );

                    await Customer.findOneAndUpdate(
                        { maKh: currentPayment.maKh },
                        { trangThai: 'Chưa thanh toán' }
                    );

                    console.log(`[TIMEOUT expired] Updated registration, payment, customer for ${currentPayment.maDangKy} to Chưa thanh toán`);
                }
            } catch (err) {
                console.error('Error in checkout timeout update:', err);
            }
        }, 10 * 60 * 1000); // 10 minutes

        res.status(201).json({
            success: true,
            customer,
            registration,
            payment
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});

// GET all
router.get('/', async (req, res) => {
    try {
        const data = await Payment.find();
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});

// GET by id
router.get('/:id', async (req, res) => {
    try {
        const data = await Payment.findById(req.params.id);

        if (!data) {
            return res.status(404).json({
                message: 'Data not found'
            });
        }

        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});

// CREATE
router.post('/', async (req, res) => {
    try {
        const newData = new Payment(req.body);
        const savedData = await newData.save();

        res.status(201).json(savedData);
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});

// UPDATE
router.put('/:id', async (req, res) => {
    try {
        const updatedData = await Payment.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        if (!updatedData) {
            return res.status(404).json({
                message: 'Data not found'
            });
        }

        res.status(200).json(updatedData);
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});

// DELETE
router.delete('/:id', async (req, res) => {
    try {
        const deletedData = await Payment.findByIdAndDelete(req.params.id);

        if (!deletedData) {
            return res.status(404).json({
                message: 'Data not found'
            });
        }

        res.status(200).json({
            message: 'Deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});

module.exports = router;
