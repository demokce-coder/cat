import express from 'express';
import Mark from '../models/Mark.js';
import SectionMarks from '../models/SectionMark.js';
import Student from '../models/Student.js';
import fs from 'fs';
import path from 'path';

const router = express.Router();
const DB_PATH = path.resolve('./db.json');

// Helper to ensure mockDb from file is used if exists
const syncMockDb = (req) => {
    const { mockDb } = req.app.locals;
    if (fs.existsSync(DB_PATH)) {
        try {
            const data = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
            // Merge marks 
            Object.assign(mockDb.marks, data.marks);
        } catch(e) {}
    }
};

// Fetch all marks for a specific section (Consolidated)
router.get('/section', async (req, res) => {
    const { dbStatus, mockDb } = req.app.locals;
    const { year, academicYear, department, section, catType } = req.query;

    console.log(`🔍 [FETCH] Requesting marks for ${year} ${department} ${section} - ${catType} (${academicYear})`);
    syncMockDb(req);

    if (!dbStatus.connected) {
        const key = `${academicYear || '2025-2026'}-${year}-${department}-${section}-${catType}`;
        const data = mockDb.marks[key] || null;
        console.log(`📦 [MOCK FETCH] Result: ${data ? 'Found' : 'Empty'}`);
        return res.json({ success: true, data, connected: false });
    }

    try {
        const data = await SectionMarks.findOne({ academicYear: academicYear || '2025-2026', year, department, section, catType });
        console.log(`🗄️ [DB FETCH] Result: ${data ? 'Found' : 'Empty'}`);
        res.json({ success: true, data, connected: true });
    } catch (err) {
        console.error("❌ Fetch error:", err);
        res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
});

// Bulk Save Consolidated Assessment (Used by Students.jsx Grid)
router.post('/bulk-save', async (req, res) => {
    const { dbStatus, mockDb } = req.app.locals;
    const { year, academicYear, department, section, catType, subjects, scores, subjectDates } = req.body;

    // Sanitize scores: Prevent negative marks
    const sanitizedScores = {};
    if (scores) {
        Object.entries(scores).forEach(([roll, subjects]) => {
            sanitizedScores[roll] = {};
            Object.entries(subjects).forEach(([subCode, mark]) => {
                const markStr = String(mark).toUpperCase();
                if (markStr === 'AB' || markStr === 'A') {
                    sanitizedScores[roll][subCode] = markStr;
                } else if (!isNaN(markStr) && markStr !== '') {
                    const num = parseFloat(markStr);
                    sanitizedScores[roll][subCode] = num < 0 ? '0' : (num > 50 ? '50' : String(num));
                } else {
                    sanitizedScores[roll][subCode] = ''; // Invalid data cleared
                }
            });
        });
    }

    if (!dbStatus.connected) {
        console.log(`📦 [MOCK SAVE] Saving marks for ${year} ${department} ${section} - ${catType}`);
        const key = `${academicYear || '2025-2026'}-${year}-${department}-${section}-${catType}`;
        mockDb.marks[key] = { year, academicYear: academicYear || '2025-2026', department, section, catType, subjects, scores: sanitizedScores, subjectDates: subjectDates || {} };
        
        try {
            fs.writeFileSync(DB_PATH, JSON.stringify(mockDb, null, 2));
        } catch (e) {
            console.error("Persistence error:", e);
        }
        
        return res.json({ success: true, message: 'Data saved successfully (Demo Mode - Persisted)' });
    }

    try {
        console.log(`🗄️ [DB SAVE] Attempting to save marks for ${year} ${department} ${section} - ${catType}`);
        let sectionDoc = await SectionMarks.findOne({ academicYear: academicYear || '2025-2026', year, department, section, catType });
        
        if (!sectionDoc) {
            console.log("🆕 Creating new SectionMarks record");
            sectionDoc = new SectionMarks({ year, academicYear: academicYear || '2025-2026', department, section, catType, subjects, scores: sanitizedScores, subjectDates });
        } else {
            console.log("📝 Updating existing SectionMarks record");
            sectionDoc.subjects = subjects;
            sectionDoc.scores = sanitizedScores;
            sectionDoc.subjectDates = subjectDates; 
            sectionDoc.updatedAt = Date.now();
            // Force Mongoose to notice changes in nested Map
            sectionDoc.markModified('scores');
            sectionDoc.markModified('subjectDates');
        }
        
        await sectionDoc.save();
        console.log("✅ Mark save successful");
        res.json({ success: true, message: "Successfully synchronized records", section: sectionDoc });
    } catch (err) {
        console.error("❌ Bulk Mark Save Error:", err);
        res.status(500).json({ success: false, message: 'Server error during save', error: err.message });
    }
});

// GET Marks for general search portal
router.get('/search/:query', async (req, res) => {
    const { dbStatus, mockDb } = req.app.locals;
    const searchString = req.params.query;
    let targetRoll = searchString;

    try {
        if (!dbStatus.connected) {
            const student = mockDb.students.find(s => 
                s.rollNumber.toLowerCase() === searchString.toLowerCase() || 
                s.name.toLowerCase().includes(searchString.toLowerCase())
            );
            if (student) targetRoll = student.rollNumber;
            else return res.json({ success: true, studentName: searchString, rollNumber: searchString, marks: [] });

            const allMarks = Object.values(mockDb.marks).flatMap(m => {
                const sMarks = m.scores[targetRoll];
                if (!sMarks) return [];
                return m.subjects.map(sub => ({
                    subjectCode: sub.code,
                    subjectName: sub.name,
                    marks: sMarks[sub.code],
                    catType: m.catType,
                    year: m.year
                }));
            });
            return res.json({ success: true, studentName: student.name, rollNumber: targetRoll, marks: allMarks });
        }

        let student = await Student.findOne({ rollNumber: searchString });
        if (!student) {
            student = await Student.findOne({ name: { $regex: searchString, $options: 'i' } });
        }
        if (student) targetRoll = student.rollNumber;
        else return res.json({ success: true, studentName: searchString, rollNumber: searchString, marks: [] });

        const marks = await Mark.find({ rollNumber: targetRoll }).sort({ year: 1, catType: 1 });
        res.json({ success: true, studentName: student.name, rollNumber: targetRoll, marks });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
});

// GET Global Stats for Dashboard
router.get('/stats', async (req, res) => {
    const { dbStatus, mockDb } = req.app.locals;
    syncMockDb(req);

    try {
        const { academicYear = '2025-2026' } = req.query;
        let totalStudents = 0;
        let totalSubjects = 0;
        let failCount = 0;
        let passPercentage = 0;

        if (!dbStatus.connected) {
            totalStudents = mockDb.students.length;
            totalSubjects = mockDb.subjects.length;
            
            // Calculate global fail count from mockDb filtered by academicYear
            const failures = new Set();
            Object.entries(mockDb.marks).forEach(([key, section]) => {
                if (key.includes(academicYear)) {
                    Object.entries(section.scores).forEach(([roll, scores]) => {
                        const hasFail = Object.values(scores).some(s => s !== 'AB' && parseFloat(s) < 25);
                        if (hasFail) failures.add(roll);
                    });
                }
            });
            failCount = failures.size;
            passPercentage = totalStudents > 0 ? ((totalStudents - failCount) / totalStudents) * 100 : 0;
        } else {
            totalStudents = await Student.countDocuments();
            totalSubjects = (await (await import('../models/Subject.js')).default.countDocuments());
            
            // For MongoDB, agg filtering by academicYear
            const sectionMarks = await SectionMarks.find({ academicYear });
            const failures = new Set();
            sectionMarks.forEach(section => {
                Object.entries(section.scores).forEach(([roll, scores]) => {
                    const hasFail = Object.values(scores).some(s => s !== 'AB' && parseFloat(s) < 25);
                    if (hasFail) failures.add(roll);
                });
            });
            failCount = failures.size;
            passPercentage = totalStudents > 0 ? ((totalStudents - failCount) / totalStudents) * 100 : 0;
        }

        res.json({
            success: true,
            stats: {
                totalStudents,
                totalSubjects,
                failCount,
                passPercentage: passPercentage.toFixed(1)
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error fetching stats', error: err.message });
    }
});

export default router;
