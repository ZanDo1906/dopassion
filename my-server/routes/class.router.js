const express = require('express');
const router = express.Router();

// Import model
const Class = require('../models/class');

// GET all
router.get('/', async (req, res) => {
    try {
        const data = await Class.find();

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
        await Class.findByIdAndDelete(req.params.id);

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