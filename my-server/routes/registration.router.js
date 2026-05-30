const express = require('express');
const router = express.Router();

const Registration = require('../models/registration');

// GET all
router.get('/', async (req, res) => {
    try {
        const data = await Registration.find();
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
        const data = await Registration.findById(req.params.id);

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
        const { maKh, maLop, trangThai } = req.body;

        // RULE: Không được tồn tại 2 registrations của 1 khách hàng vào 1 lớp mà đều có trạng thái "Đang hoạt động"
        if (trangThai === 'Đang hoạt động' && maKh && maLop) {
            const existingActive = await Registration.findOne({
                maKh: maKh,
                maLop: maLop,
                trangThai: 'Đang hoạt động'
            });

            if (existingActive) {
                return res.status(400).json({
                    message: `Khách hàng này đã có 1 đăng ký đang hoạt động cho lớp này. Không thể tạo đăng ký lần 2!`
                });
            }
        }

        const newData = new Registration(req.body);
        const savedData = await newData.save();

        res.status(201).json(savedData);
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});

router.put('/:id', async (req, res) => {
    try {

        console.log('PARAM ID:', req.params.id);
        console.log('BODY:', req.body);

        // Lấy dữ liệu hiện tại trước
        const currentData = await Registration.findById(req.params.id);
        if (!currentData) {
            return res.status(404).json({
                message: 'Data not found'
            });
        }

        // RULE: Không được tồn tại 2 registrations của 1 khách hàng vào 1 lớp mà đều có trạng thái "Đang hoạt động"
        // Kiểm tra nếu trạng thái được thay đổi thành "Đang hoạt động"
        const newTrangThai = req.body.trangThai || currentData.trangThai;
        if (newTrangThai === 'Đang hoạt động') {
            const maKh = req.body.maKh || currentData.maKh;
            const maLop = req.body.maLop || currentData.maLop;

            if (maKh && maLop) {
                const existingActive = await Registration.findOne({
                    _id: { $ne: req.params.id },  // Loại trừ chính record này
                    maKh: maKh,
                    maLop: maLop,
                    trangThai: 'Đang hoạt động'
                });

                if (existingActive) {
                    return res.status(400).json({
                        message: `Khách hàng này đã có 1 đăng ký đang hoạt động cho lớp này. Không thể cập nhật!`
                    });
                }
            }
        }

        const updatedData = await Registration.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        console.log('UPDATED DATA:', updatedData);

        res.status(200).json(updatedData);

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: error.message
        });
    }
});
// DELETE
router.delete('/:id', async (req, res) => {
    try {
        const deletedData = await Registration.findByIdAndDelete(req.params.id);

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
