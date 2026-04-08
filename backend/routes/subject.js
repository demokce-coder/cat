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
    const { dbStatus, mockDb } = req.app.locals;
    const { name, code, shortName, year, department } = req.body;

    if (!dbStatus.connected) {
        const newSubject = { name, code, shortName, year, department, _id: `mock_sub_${Date.now()}` };
        mockDb.subjects.push(newSubject);
        
        // Persist to local file
        const DB_PATH = './db.json';
        try {
            const fs = await import('fs');
            fs.default.writeFileSync(DB_PATH, JSON.stringify(mockDb, null, 2));
        } catch (e) {
            console.error("Subject Persistence error:", e);
        }
        
        return res.status(201).json({ success: true, subject: newSubject, message: 'Saved to In-Memory Store (Demo Mode)' });
    }

    try {
        const subject = new Subject({ name, code, shortName, year, department });
        await subject.save();
        res.status(201).json({ success: true, subject });
    } catch (err) {
        res.status(400).json({ success: false, message: 'Bad request', error: err.message });
    }
});

router.put('/:id', async (req, res) => {
    const { dbStatus, mockDb } = req.app.locals;
    const { name, code, shortName, year, department } = req.body;

    if (!dbStatus.connected) {
        const index = mockDb.subjects.findIndex(s => s._id === req.params.id);
        if (index === -1) return res.status(404).json({ success: false, message: 'Subject not found' });
        
        mockDb.subjects[index] = { ...mockDb.subjects[index], name, code, shortName, year, department };
        
        try {
            const fs = await import('fs');
            fs.default.writeFileSync('./db.json', JSON.stringify(mockDb, null, 2));
        } catch (e) {}
        
        return res.json({ success: true, subject: mockDb.subjects[index] });
    }

    try {
        const subject = await Subject.findByIdAndUpdate(req.params.id, { name, code, shortName, year, department }, { new: true });
        res.json({ success: true, subject });
    } catch (err) {
        res.status(400).json({ success: false, message: 'Bad request', error: err.message });
    }
});

router.delete('/:id', async (req, res) => {
    const { dbStatus, mockDb } = req.app.locals;

    if (!dbStatus.connected) {
        mockDb.subjects = mockDb.subjects.filter(s => s._id !== req.params.id);
        try {
            const fs = await import('fs');
            fs.default.writeFileSync('./db.json', JSON.stringify(mockDb, null, 2));
        } catch (e) {}
        return res.json({ success: true, message: 'Subject deleted (Demo Mode)' });
    }

    try {
        await Subject.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Subject deleted' });
    } catch (err) {
        res.status(400).json({ success: false, message: 'Bad request', error: err.message });
    }
});

export default router;
