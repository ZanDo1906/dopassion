const express = require('express');
const router = express.Router();

const StudentReport = require('../models/student-report');

// GET all
router.get('/', async (req, res) => {
    try {
        const data = await StudentReport.find();
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
        const data = await StudentReport.findById(req.params.id);

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
        const newData = new StudentReport(req.body);
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
        const updatedData = await StudentReport.findByIdAndUpdate(
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
        const deletedData = await StudentReport.findByIdAndDelete(req.params.id);

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
