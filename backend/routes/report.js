import express from 'express';
import Report from '../models/Report.js';

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const reports = await Report.find().sort({ lastUpdated: -1 });
        res.json(reports);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.post('/', async (req, res) => {
    try {
        const { year, section, catType, ...metadata } = req.body;
        const report = await Report.findOneAndUpdate(
            { year, section, catType },
            { ...metadata, lastUpdated: Date.now() },
            { upsert: true, new: true }
        );
        res.json(report);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.patch('/:id', async (req, res) => {
    try {
        const report = await Report.findByIdAndUpdate(
            req.params.id,
            { ...req.body, lastUpdated: Date.now() },
            { new: true }
        );
        res.json(report);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        await Report.findByIdAndDelete(req.params.id);
        res.json({ message: "Report removed" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

export default router;
