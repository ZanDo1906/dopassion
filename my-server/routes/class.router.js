const express = require('express');
const router = express.Router();

// Import model
const Class = require('../models/class');

// GET all với support filter query params
router.get('/', async (req, res) => {
    try {
        // Xây dựng filter object từ query params
        const filter = {};
        
        // Filter theo maKhoa (khóa học)
        if (req.query.maKhoa) {
            filter.maKhoa = req.query.maKhoa;
        }
        
        // Filter theo chiNhanh (chi nhánh) - support multi-select
        if (req.query.chiNhanh) {
            const branches = req.query.chiNhanh.split(',').filter(b => b.trim());
            if (branches.length > 0) {
                filter.chiNhanh = { $in: branches };
            }
        }
        
        // Filter theo ngayBatDau (ngày khai giảng)
        if (req.query.ngayBatDau) {
            // Tìm classes có ngayBatDau >= ngày filter
            filter.ngayBatDau = {
                $regex: `^${req.query.ngayBatDau}`,
                $options: 'i'
            };
        }

        const data = await Class.find(filter);

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
        const data = await Class.findById(req.params.id);

        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});
module.exports = router;