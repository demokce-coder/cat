import express from 'express';
import TimeTable from '../models/TimeTable.js';

const router = express.Router();

router.get('/', async (req, res) => {
    const { dbStatus, mockDb } = req.app.locals;
    if (!dbStatus.connected) {
        return res.json({ success: true, timetables: mockDb.timetables || [], connected: false });
    }

    try {
        const timetables = await TimeTable.find();
        res.json({ success: true, timetables, connected: true });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
});

router.post('/bulk-save', async (req, res) => {
    const { dbStatus, mockDb } = req.app.locals;
    const { timetables } = req.body;

    if (!dbStatus.connected) {
        mockDb.timetables = timetables;
        return res.json({ success: true, message: 'Time Table saved temporarily (Demo Mode)' });
    }

    try {
        await TimeTable.deleteMany({}); // replace all for this demo
        await TimeTable.insertMany(timetables);
        res.json({ success: true, message: 'Time Table updated successfully' });
    } catch (err) {
        res.status(400).json({ success: false, message: 'Bad request', error: err.message });
    }
});

export default router;
