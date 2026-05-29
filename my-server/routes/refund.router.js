const express = require('express');
const router = express.Router();

const Refund = require('../models/refund');
const Payment = require('../models/payment');
const Registration = require('../models/registration');

// GET all
router.get('/fix-legacy-data', async (req, res) => {
    try {
        const completedRefunds = await Refund.find({ trangThai: 'Đã hoàn tiền' });
        let count = 0;
        for (const refund of completedRefunds) {
            if (refund.maDangKy) {
                await Payment.findOneAndUpdate(
                    { maDangKy: refund.maDangKy },
                    { trangThaiThanhToan: 'Đã hoàn tiền' }
                );
                await Registration.findOneAndUpdate(
                    { maDangKy: refund.maDangKy },
                    { trangThai: 'Đã khóa' }
                );
                count++;
            }
        }
        res.status(200).json({ message: `Fixed ${count} records` });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/', async (req, res) => {
    try {
        const data = await Refund.find().lean();
        const formattedData = data.map(item => ({
            ...item,
            _id: item._id.toString()
        }));
        res.status(200).json(formattedData);
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});

// GET by id
router.get('/:id', async (req, res) => {
    try {
        const data = await Refund.findById(req.params.id);

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
        const newData = new Refund(req.body);
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
        const updatedData = await Refund.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        if (!updatedData) {
            return res.status(404).json({
                message: 'Data not found'
            });
        }

        // Khi refund được duyệt (Đã hoàn tiền) → cập nhật Payment & khóa Registration
        if (req.body.trangThai === 'Đã hoàn tiền' && updatedData.maDangKy) {
            try {
                // Cập nhật trạng thái Payment sang "Đã hoàn tiền"
                await Payment.findOneAndUpdate(
                    { maDangKy: updatedData.maDangKy },
                    { trangThaiThanhToan: 'Đã hoàn tiền' }
                );

                // Khóa Registration tương ứng
                await Registration.findOneAndUpdate(
                    { maDangKy: updatedData.maDangKy },
                    { trangThai: 'Đã khóa' }
                );

                console.log(`[REFUND APPROVED] Updated payment & registration for ${updatedData.maDangKy}`);
            } catch (syncErr) {
                console.error('Error syncing payment/registration after refund approval:', syncErr);
            }
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
        const deletedData = await Refund.findByIdAndDelete(req.params.id);

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
