const express = require('express');
const router = express.Router();

// Import model
const Class = require('../models/class');
const Registration = require('../models/registration');

// GET all
router.get('/', async (req, res) => {
    try {
        const { courseCode, branch, startDate, endDate, keyword } = req.query;

        const query = {};

        if (courseCode) {
            query.maKhoa = `${courseCode}`.trim().toUpperCase();
        }

        if (branch) {
            query.chiNhanh = `${branch}`.trim();
        }

        if (startDate || endDate) {
            query.ngayBatDau = {};

            if (startDate) {
                // Ensure startDate starts from 00:00:00 in Vietnam Time (+07:00)
                query.ngayBatDau.$gte = new Date(`${startDate}T00:00:00+07:00`).toISOString();
            }

            if (endDate) {
                // Ensure endDate ends at 23:59:59 in Vietnam Time (+07:00)
                query.ngayBatDau.$lte = new Date(`${endDate}T23:59:59+07:00`).toISOString();
            }
        }

        if (keyword) {
            const escapedKeyword = `${keyword}`.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            query.$or = [
                { tenLop: { $regex: escapedKeyword, $options: 'i' } },
                { maLop: { $regex: escapedKeyword, $options: 'i' } },
                { tenKhoaHoc: { $regex: escapedKeyword, $options: 'i' } }
            ];
        }

        const data = await Class.find(query);
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});

// GET detail by maLop with current enrollment count
router.get('/detail/:maLop', async (req, res) => {
    try {
        res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        res.set('Pragma', 'no-cache');
        res.set('Expires', '0');

        const classData = await Class.findOne({ maLop: req.params.maLop });

        if (!classData) {
            return res.status(404).json({
                message: 'Class not found'
            });
        }

        // Count registration records that reference the same class code
        const currentEnrollment = await Registration.countDocuments({
            maLop: classData.maLop
        });

        res.status(200).json({
            ...classData.toObject(),
            currentEnrollment,
            maxEnrollment: 30
        });
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
        const newData = new Class(req.body);
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
        const updatedData = await Class.findByIdAndUpdate(
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
        const deletedData = await Class.findByIdAndDelete(req.params.id);

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