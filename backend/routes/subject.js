import express from 'express';
import Subject from '../models/Subject.js';

const router = express.Router();

router.get('/', async (req, res) => {
    const { dbStatus, mockDb } = req.app.locals;
    if (!dbStatus.connected) {
        return res.json({ success: true, subjects: mockDb.subjects || [], connected: false });
    }

    try {
        const subjects = await Subject.find().sort({ name: 1 });
        res.json({ success: true, subjects, connected: true });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
});

router.post('/', async (req, res) => {
    try {
        const { name, code, shortName, year, department } = req.body;
        const subject = new Subject({ name, code, shortName, year, department });
        await subject.save();
        res.status(201).json({ success: true, subject });
    } catch (err) {
        res.status(400).json({ success: false, message: 'Bad request', error: err.message });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const { name, code, shortName, year, department } = req.body;
        const subject = await Subject.findByIdAndUpdate(req.params.id, { name, code, shortName, year, department }, { new: true });
        res.json({ success: true, subject });
    } catch (err) {
        res.status(400).json({ success: false, message: 'Bad request', error: err.message });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        await Subject.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Subject deleted' });
    } catch (err) {
        res.status(400).json({ success: false, message: 'Bad request', error: err.message });
    }
});

export default router;
