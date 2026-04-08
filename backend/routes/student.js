import express from 'express';
import Student from '../models/Student.js';

const router = express.Router();

// GET all students (with search and filter)
router.get('/', async (req, res) => {
    try {
        const { mockDb, dbStatus } = req.app.locals;
        const { search, department, year, section, academicYear } = req.query;
        let query = {};

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { rollNumber: { $regex: search, $options: 'i' } }
            ];
        }

        if (department) query.department = department;
        if (year) query.year = year;
        if (section) query.section = section;
        if (academicYear) query.academicYear = academicYear;

        const students = dbStatus.connected 
            ? await Student.find(query).sort({ rollNumber: 1 })
            : mockDb.students.filter(s => {
                const matchesSearch = !search || s.name.toLowerCase().includes(search.toLowerCase()) || s.rollNumber.includes(search);
                const matchesDept = !department || s.department === department;
                const matchesYear = !year || s.year === year;
                const matchesSection = !section || s.section === section;
                const matchesAcademicYear = !academicYear || s.academicYear === academicYear;
                return matchesSearch && matchesDept && matchesYear && matchesSection && matchesAcademicYear;
            });

        res.json({ success: true, students });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
});

router.post('/bulk', async (req, res) => {
    const { mockDb, dbStatus } = req.app.locals;
    const { students, commonInfo } = req.body;
    
    if (!dbStatus.connected) {
        // Find existing students for this specific section and year and remove them
        mockDb.students = mockDb.students.filter(s => 
            !(s.year === commonInfo.year && s.department === commonInfo.department && s.section === commonInfo.section && s.academicYear === commonInfo.academicYear)
        );

        // Add the newly uploaded name list
        students.forEach(s => {
            const studentData = { 
                ...s, 
                ...commonInfo, 
                _id: String(Date.now() + Math.random()) 
            };
            mockDb.students.push(studentData);
        });

        console.log(`✅ [MOCK DB] Replaced name list for ${commonInfo.year} ${commonInfo.department} ${commonInfo.section}`);
        return res.status(201).json({ success: true, message: 'Saved to In-Memory Store (Demo Mode)' });
    }

    try {
        console.log("Bulk importing students and replacing existing list for:", commonInfo);

        // Delete existing students for this section before bulk-upserting
        await Student.deleteMany({
            year: commonInfo.year,
            department: commonInfo.department,
            section: commonInfo.section,
            academicYear: commonInfo.academicYear
        });

        const bulkOps = students.map(s => ({
            insertOne: {
                document: {
                    rollNumber: s.rollNumber,
                    name: s.name,
                    department: commonInfo.department,
                    year: commonInfo.year,
                    section: commonInfo.section,
                    academicYear: commonInfo.academicYear
                }
            }
        }));

        if (bulkOps.length > 0) {
            await Student.bulkWrite(bulkOps);
        }
        
        res.status(201).json({ success: true, message: 'Students list updated successfully' });
    } catch (err) {
        res.status(400).json({ success: false, message: 'Bad request', error: err.message });
    }
});

router.post('/', async (req, res) => {
    try {
        const student = new Student(req.body);
        await student.save();
        res.status(201).json({ success: true, student });
    } catch (err) {
        res.status(400).json({ success: false, message: 'Bad request', error: err.message });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        await Student.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Student deleted' });
    } catch (err) {
        res.status(400).json({ success: false, message: 'Bad request', error: err.message });
    }
});

export default router;
