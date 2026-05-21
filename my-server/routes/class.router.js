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
module.exports = router;