import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes, { seedAdmin } from './routes/auth.js';
import studentRoutes from './routes/student.js';
import subjectRoutes from './routes/subject.js';
import markRoutes from './routes/mark.js';
import timetableRoutes from './routes/timetable.js';

import fs from 'fs';
import path from 'path';

dotenv.config();
const DB_PATH = path.resolve('./db.json');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/marks', markRoutes);
app.use('/api/timetables', timetableRoutes);

// Health check
app.get('/health', (req, res) => res.json({ status: 'OK', date: new Date() }));

// Production Frontend Serving
if (process.env.NODE_ENV === 'production') {
    const __dirname = path.resolve();
    app.use(express.static(path.join(__dirname, '../dist')));

    app.get('/*', (req, res) => {
        if (!req.path.startsWith('/api')) {
            res.sendFile(path.join(__dirname, '../dist/index.html'));
        }
    });
}

// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ success: false, message: 'Something went wrong!', error: err.message });
});

// Database connection & In-Memory Fallback
const dbStatus = { connected: false };
let mockDb = { students: [], marks: {}, subjects: [] };

// Load persisted mock data on start
if (fs.existsSync(DB_PATH)) {
    try {
        const persisted = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
        mockDb = { ...mockDb, ...persisted };
        console.log('📦 Persistence Loaded: Synced In-Memory Store with db.json');
    } catch (e) { console.error("Load Persistence Error:", e); }
}

const seedSubjects = async () => {
    const subjects = [
        { code: 'CCS356', name: 'Object Oriented Software Engineering', department: 'CSE', year: 'III YEAR', shortName: 'OOSE' },
        { code: 'CS3691', name: 'Embedded Systems and IoT', department: 'CSE', year: 'III YEAR', shortName: 'ES & IOT' },
        { code: 'OEE351', name: 'Renewable Energy System', department: 'CSE', year: 'III YEAR', shortName: 'RES' },
        { code: 'CCS360', name: 'Recommender Systems', department: 'CSE', year: 'III YEAR', shortName: 'RS' },
        { code: 'CCS362', name: 'Security and Privacy in Cloud', department: 'CSE', year: 'III YEAR', shortName: 'SPC' },
        { code: 'CCS370', name: 'UI and UX Design', department: 'CSE', year: 'III YEAR', shortName: 'UI & UX' },
        { code: 'CCS368', name: 'Stream Processing', department: 'CSE', year: 'III YEAR', shortName: 'SP' },
        { code: 'MX3089', name: 'Industrial Safety', department: 'CSE', year: 'III YEAR', shortName: 'IS' },
        { code: '24CSPC401', name: 'Design and Analysis of Algorithms', department: 'CSE', year: 'II YEAR', shortName: 'DAA' },
        { code: '24CSPC402', name: 'Operating Systems', department: 'CSE', year: 'II YEAR', shortName: 'OS' },
        { code: '24CSPC403', name: 'Object Oriented Software Engineering', department: 'CSE', year: 'II YEAR', shortName: 'OOSE' },
        { code: '24CSPC404', name: 'Artificial Intelligence and Machine Learning', department: 'CSE', year: 'II YEAR', shortName: 'AIML' },
        { code: '24CSPC405', name: 'Full Stack Technologies', department: 'CSE', year: 'II YEAR', shortName: 'FST' },
        { code: '24SHHS401', name: 'Universal Human Values-II', department: 'CSE', year: 'II YEAR', shortName: 'UHV' }
    ];

    if (dbStatus.connected) {
        try {
            const Subject = (await import('./models/Subject.js')).default;
            for (const s of subjects) {
                await Subject.findOneAndUpdate({ code: s.code }, s, { upsert: true });
            }
            console.log('✅ 3rd Year CSE Subjects Seeded to DB');
        } catch (e) { console.error('❌ Seeding failed:', e); }
    } else {
        mockDb.subjects = subjects;
        console.log('✅ Subjects Seeded to Mock DB (Demo Mode)');
    }

    const cseA_II_Students = [
        { rollNumber: "821124104001", name: "AARTHI SREE R N" },
        { rollNumber: "821124104002", name: "ADHITHYA B" },
        { rollNumber: "821124104003", name: "ABDUL WAHID T" },
        { rollNumber: "821124104004", name: "ABHISHEK C K" },
        { rollNumber: "821124104005", name: "ABINASH I" },
        { rollNumber: "821124104006", name: "ABINAYA P" },
        { rollNumber: "821124104007", name: "ABISHEK V" },
        { rollNumber: "821124104008", name: "AJAYARAJ M" },
        { rollNumber: "821124104009", name: "AKASH C" },
        { rollNumber: "821124104010", name: "ANUSHA T" },
        { rollNumber: "821124104011", name: "ARAVINDHA KUMAR A" },
        { rollNumber: "821124104012", name: "ARKEMEDES K" },
        { rollNumber: "821124104013", name: "ARUNA RANI R" },
        { rollNumber: "821124104014", name: "ASWATHI FARHAN A M" },
        { rollNumber: "821124104015", name: "ASWIN T R" },
        { rollNumber: "821124104016", name: "ATHIYASRI B" },
        { rollNumber: "821124104017", name: "BALAKRITHIKA B" },
        { rollNumber: "821124104018", name: "BALUPRIYAM N" },
        { rollNumber: "821124104019", name: "BHAVASHREE A" },
        { rollNumber: "821124104020", name: "BOWTHAN G R" },
        { rollNumber: "821124104021", name: "DARSHINI" },
        { rollNumber: "821124104022", name: "DEEPADHARSHINI G" },
        { rollNumber: "821124104023", name: "DEEPIKA S (10.3.2007)" },
        { rollNumber: "821124104024", name: "DEEPIKA S (27.6.2007)" },
        { rollNumber: "821124104025", name: "DEEKSHIDHA J" },
        { rollNumber: "821124104026", name: "DEVADHARSHINI R" },
        { rollNumber: "821124104027", name: "DHARANIKA B" },
        { rollNumber: "821124104028", name: "DHARANIKA K" },
        { rollNumber: "821124104029", name: "DHARSHINI R M" },
        { rollNumber: "821124104030", name: "DHATCHAYANI K" },
        { rollNumber: "821124104031", name: "DIVYAPRAKASH K" },
        { rollNumber: "821124104032", name: "DURGADHARSHINI R" },
        { rollNumber: "821124104033", name: "GIRIJ A K" },
        { rollNumber: "821124104034", name: "GIRIJAM" },
        { rollNumber: "821124104035", name: "GIRIJ A S" },
        { rollNumber: "821124104036", name: "GNANALEKA K" },
        { rollNumber: "821124104037", name: "GOKUL S" },
        { rollNumber: "821124104038", name: "GOKULAVANAN R" },
        { rollNumber: "821124104039", name: "GOKULVARTHAN R" },
        { rollNumber: "821124104040", name: "GOPIKA V" },
        { rollNumber: "821124104041", name: "GOWRISH A" },
        { rollNumber: "821124104042", name: "GURUKRISHNAN V" },
        { rollNumber: "821124104043", name: "HARI PRAGADESH S S" },
        { rollNumber: "821124104044", name: "HARI PRASATH S" },
        { rollNumber: "821124104045", name: "JAYA PRAKASH K" },
        { rollNumber: "821124104046", name: "JEGABAR NISHAY" },
        { rollNumber: "821124104047", name: "JOEYAL A" },
        { rollNumber: "821124104048", name: "JOSPHIN HEPSIBA G" },
        { rollNumber: "821124104049", name: "JOY SWEETY J" },
        { rollNumber: "821124104050", name: "KABILAN K" },
        { rollNumber: "821124104051", name: "KALAIVANAN S" },
        { rollNumber: "821124104052", name: "KAMALAVARTHINI S" },
        { rollNumber: "821124104053", name: "KAMATCHI M" },
        { rollNumber: "821124104054", name: "KARTHIKEYAN U" },
        { rollNumber: "821124104055", name: "KATHISH R" },
        { rollNumber: "821124104056", name: "KAVIPRIYAN S" },
        { rollNumber: "821124104057", name: "KAVYA DHARSHINI M" },
        { rollNumber: "821124104058", name: "KIRUTHIKA S" },
        { rollNumber: "821124104059", name: "LAKSHANA S" },
        { rollNumber: "821124104060", name: "LEKHA G" },
        { rollNumber: "LE", name: "DASARATHY .M" },
        { rollNumber: "LE ", name: "HARISH.R" },
        { rollNumber: "LE  ", name: "CHARLES .T" },
        { rollNumber: "LE   ", name: "RAJALAKSHMI.S" },
        { rollNumber: "LE    ", name: "UTHRA.R" }
    ];

    const cseB_II_Students = [
        { rollNumber: "821124104061", name: "MADHAN KUMAR P" },
        { rollNumber: "821124104062", name: "MADHUKRISHNA S" },
        { rollNumber: "821124104063", name: "MITHUN R K" },
        { rollNumber: "821124104064", name: "MUGUNDHAN T" },
        { rollNumber: "821124104065", name: "NAVEEN G R" },
        { rollNumber: "821124104066", name: "NAVEEN KUMAR R" },
        { rollNumber: "821124104067", name: "NAVINKUMAR S" },
        { rollNumber: "821124104068", name: "NEHA P" },
        { rollNumber: "821124104069", name: "NISHANTHI S" },
        { rollNumber: "821124104070", name: "NITINRAM K S" },
        { rollNumber: "821124104071", name: "PAVALAN K" },
        { rollNumber: "821124104072", name: "PAVITHRA D" },
        { rollNumber: "821124104074", name: "PRABHAVATHI P" },
        { rollNumber: "821124104075", name: "PRAKSHITHA S" },
        { rollNumber: "821124104076", name: "PRASANTH J" },
        { rollNumber: "821124104077", name: "PREETHI M" },
        { rollNumber: "821124104078", name: "PREETHI V" },
        { rollNumber: "821124104079", name: "PRETHIKA S" },
        { rollNumber: "821124104081", name: "PRIYANKA S" },
        { rollNumber: "821124104082", name: "PUSHPA P" },
        { rollNumber: "821124104083", name: "RAGAVI R" },
        { rollNumber: "821124104084", name: "RAGUL N" },
        { rollNumber: "821124104085", name: "RAJASRI V" },
        { rollNumber: "821124104086", name: "RAMAKRISHNAN K" },
        { rollNumber: "821124104087", name: "RAMESH R" },
        { rollNumber: "821124104088", name: "RANJITH R" },
        { rollNumber: "821124104089", name: "RITHIKA S" },
        { rollNumber: "821124104090", name: "RUBAN K" },
        { rollNumber: "821124104091", name: "SAKKTHI A" },
        { rollNumber: "821124104092", name: "SANJAY S" },
        { rollNumber: "821124104093", name: "SANTHIYA MEENA E" },
        { rollNumber: "821124104094", name: "SANTHOSH K" },
        { rollNumber: "821124104095", name: "SARABESWARI B" },
        { rollNumber: "821124104096", name: "SASHWITHA G" },
        { rollNumber: "821124104097", name: "SHANTHINI PRIYA M" },
        { rollNumber: "821124104098", name: "SHARUN S" },
        { rollNumber: "821124104099", name: "SHIVANI SRI B" },
        { rollNumber: "821124104100", name: "SHRI LAKSHANA S K" },
        { rollNumber: "821124104101", name: "SINDHUJA S" },
        { rollNumber: "821124104102", name: "SOWNDARYA P" },
        { rollNumber: "821124104103", name: "SRI HARSHINI K" },
        { rollNumber: "821124104104", name: "SRIDHARSHAN S" },
        { rollNumber: "821124104105", name: "SUBASH CHANDRA BOSE K" },
        { rollNumber: "821124104106", name: "SUBHA DHARSHINI G" },
        { rollNumber: "821124104107", name: "SUBHASHINI N" },
        { rollNumber: "821124104108", name: "SYED FATHIMA K" },
        { rollNumber: "821124104109", name: "TAMIL NANGAI K" },
        { rollNumber: "821124104110", name: "THAMARAI SELVI D" },
        { rollNumber: "821124104111", name: "THARUN M" },
        { rollNumber: "821124104112", name: "VARSHINI G" },
        { rollNumber: "821124104113", name: "VARSHINI S" },
        { rollNumber: "821124104114", name: "VASANTH B" },
        { rollNumber: "821124104115", name: "VIGNESH S M" },
        { rollNumber: "821124104116", name: "VISHNU PRASATH S" },
        { rollNumber: "821124104117", name: "VISHVAKKANNAN S" },
        { rollNumber: "821124104118", name: "YAMUNA R" },
        { rollNumber: "821124104119", name: "YOGARATHNA E" },
        { rollNumber: "LE      ", name: "CHATRAPATHI U" },
        { rollNumber: "LE       ", name: "MAZEED AHAMED S" },
        { rollNumber: "LE        ", name: "NITHISH R P" },
        { rollNumber: "LE         ", name: "SAITHARUN D" },
        { rollNumber: "RA", name: "SIVASANMUGAM S" }
    ];

    const cseB_Students = [
        { rollNumber: "821123104062", name: "PARKAVI B" },
        { rollNumber: "821123104063", name: "PAVIDHARAN D" },
        { rollNumber: "821123104064", name: "PILIRAJ G" },
        { rollNumber: "821123104065", name: "PRAKASH K" },
        { rollNumber: "821123104066", name: "PRASANNA B" },
        { rollNumber: "821123104067", name: "PRITHVI RAJ T" },
        { rollNumber: "821123104068", name: "PRIYADHARSHINI S" },
        { rollNumber: "821123104069", name: "RAHUL GANTHI M" },
        { rollNumber: "821123104070", name: "RAJA K" },
        { rollNumber: "821123104071", name: "RAJA MANIKANDAN V" },
        { rollNumber: "821123104072", name: "RAMAKAVI S" },
        { rollNumber: "821123104074", name: "RASUL MOHAMED H" },
        { rollNumber: "821123104075", name: "RATHINA PRAGADESH D" },
        { rollNumber: "821123104076", name: "RUHIYA V" },
        { rollNumber: "821123104077", name: "SAAIKIRTHIGA L" },
        { rollNumber: "821123104078", name: "SABAREESH M" },
        { rollNumber: "821123104079", name: "SAMINATHAN R" },
        { rollNumber: "821123104080", name: "SANDHIYA A" },
        { rollNumber: "821123104081", name: "SANDHIYA J" },
        { rollNumber: "821123104082", name: "SANJAY B" },
        { rollNumber: "821123104084", name: "SANTHOSH K" },
        { rollNumber: "821123104085", name: "SARVESH R" },
        { rollNumber: "821123104086", name: "SEDHURAMAN V" },
        { rollNumber: "821123104087", name: "SEVANTHI K" },
        { rollNumber: "821123104088", name: "SHANMATHI S" },
        { rollNumber: "821123104089", name: "SINDHUJA G" },
        { rollNumber: "821123104090", name: "SIVASAKTHI T" },
        { rollNumber: "821123104092", name: "SORNA LAKSHMI S" },
        { rollNumber: "821123104093", name: "SRIHARINI C" },
        { rollNumber: "821123104094", name: "SRUTHIKA S" },
        { rollNumber: "821123104095", name: "SUBAIR N" },
        { rollNumber: "821123104096", name: "SUBALAKSHMI E" },
        { rollNumber: "821123104097", name: "SUBASRI B S" },
        { rollNumber: "821123104098", name: "SUGAMITHA S" },
        { rollNumber: "821123104099", name: "SUGANTHIRAN K" },
        { rollNumber: "821123104100", name: "SUJITHA R" },
        { rollNumber: "821123104101", name: "SWATHI M" },
        { rollNumber: "821123104102", name: "SWATHI R" },
        { rollNumber: "821123104103", name: "SWATHI S" },
        { rollNumber: "821123104104", name: "THENNARASI K" },
        { rollNumber: "821123104105", name: "THILAGANRAM M" },
        { rollNumber: "821123104106", name: "THIYANESWARAN V" },
        { rollNumber: "821123104107", name: "VAISHNAVI P" },
        { rollNumber: "821123104108", name: "VENKADESAKUMAR S" },
        { rollNumber: "821123104109", name: "VENKATESWARAN G" },
        { rollNumber: "821123104110", name: "VERNICA S" },
        { rollNumber: "821123104111", name: "VIGARTHAN M" },
        { rollNumber: "821123104112", name: "VIGNESH C" },
        { rollNumber: "821123104113", "name": "VIGNESHWARI R" },
        { rollNumber: "821123104114", "name": "VIJAY KUMAR K" },
        { rollNumber: "821123104115", "name": "VINITH KUMAR S" },
        { rollNumber: "821123104116", "name": "VISHNU S" },
        { rollNumber: "821123104117", "name": "VISHNUVARTHAN K" },
        { rollNumber: "821123104118", "name": "VISVANANTHINI N" },
        { rollNumber: "821123104119", "name": "YALINI SRIMATHI S" },
        { rollNumber: "821123104120", "name": "YASMIN BANU M" },
        { rollNumber: "821123104121", "name": "YAZHINI A" },
        { rollNumber: "821123104122", "name": "YAZHINI S" },
        { rollNumber: "821123104501", "name": "KANNA N" }
    ];

    const cseA_Students = [
        { rollNumber: "821123104001", name: "ABINESH A" },
        { rollNumber: "821123104002", name: "ABIRAMI M" },
        { rollNumber: "821123104003", name: "ABIRAMI N" },
        { rollNumber: "821123104004", name: "ABIRAMI P" },
        { rollNumber: "821123104005", name: "ABISHAK W" },
        { rollNumber: "821123104006", name: "ADHIGA M" },
        { rollNumber: "821123104007", name: "ADHITYA G" },
        { rollNumber: "821123104008", name: "AJAY V" },
        { rollNumber: "821123104009", name: "AKASH G" },
        { rollNumber: "821123104010", name: "AKASH K (11.03.2006)" },
        { rollNumber: "821123104011", name: "AKASH K (25.09.2006)" },
        { rollNumber: "821123104012", name: "AKASH R" },
        { rollNumber: "821123104013", name: "AMARNATH T" },
        { rollNumber: "821123104014", name: "ANJEL T" },
        { rollNumber: "821123104015", name: "ARAVINTH R" },
        { rollNumber: "821123104016", name: "ATCHAYASRI D" },
        { rollNumber: "821123104017", name: "BHARANITHARAN R" },
        { rollNumber: "821123104019", name: "CHANDRA MUKILAN V" },
        { rollNumber: "821123104020", name: "DAKSHNA R" },
        { rollNumber: "821123104021", name: "DEERGA THARSAN A V" },
        { rollNumber: "821123104023", name: "DHARUN M" },
        { rollNumber: "821123104024", name: "DHINESH KARTHIK P" },
        { rollNumber: "821123104025", name: "DIVYA G" },
        { rollNumber: "821123104026", name: "GUNANATHAN G S" },
        { rollNumber: "821123104027", name: "GURUDEV N" },
        { rollNumber: "821123104028", name: "HAMSAVARTHINI M" },
        { rollNumber: "821123104029", name: "HARIHARAN M" },
        { rollNumber: "821123104030", name: "HARIHARAN N" },
        { rollNumber: "821123104031", name: "HARIHARAPERUMAL R S" },
        { rollNumber: "821123104032", name: "HARINI E" },
        { rollNumber: "821123104033", name: "INBAN E" },
        { rollNumber: "821123104034", name: "INDUPRIYAN S" },
        { rollNumber: "821123104035", name: "JAGADEESHWARAN" },
        { rollNumber: "821123104036", name: "JAYA PRAKASH J" },
        { rollNumber: "821123104037", name: "JEEVAJOTHI P" },
        { rollNumber: "821123104039", name: "JERRYN JEFFERSON P" },
        { rollNumber: "821123104040", name: "KABILAN P" },
        { rollNumber: "821123104041", name: "KALANITHI U" },
        { rollNumber: "821123104042", name: "KARAN K" },
        { rollNumber: "821123104043", name: "KARISHMA R" },
        { rollNumber: "821123104044", name: "KARTHIKEYAN S" },
        { rollNumber: "821123104045", name: "KAVITHA S" },
        { rollNumber: "821123104046", name: "LAKSHMI PRIYA M" },
        { rollNumber: "821123104047", name: "LAVANYA K" },
        { rollNumber: "821123104048", name: "LAVANYA K" },
        { rollNumber: "821123104049", name: "MAHESWARAN M" },
        { rollNumber: "821123104050", name: "MANIMARAN M" },
        { rollNumber: "821123104051", name: "MELVINANTO A" },
        { rollNumber: "821123104052", name: "MERUDULA S" },
        { rollNumber: "821123104053", name: "MOHAMED ABDUL RAHIM S" },
        { rollNumber: "821123104054", name: "MOHAMED FURZEES M" },
        { rollNumber: "821123104055", name: "MOHANDOSS R" },
        { rollNumber: "821123104057", name: "MONIKA P" },
        { rollNumber: "821123104058", name: "MUBASHIR M" },
        { rollNumber: "821123104059", name: "NARMATHA G" },
        { rollNumber: "821123104060", name: "NAVIN KUMAR G" },
        { rollNumber: "821123104061", name: "NITHISHKUMAR S" }
    ];

    if (dbStatus.connected) {
        const Student = (await import('./models/Student.js')).default;
        for (const s of cseB_Students) {
            await Student.findOneAndUpdate(
                { rollNumber: s.rollNumber },
                { ...s, department: 'CSE', year: 'III YEAR', section: 'B', academicYear: '2024-2025' },
                { upsert: true }
            );
        }
        for (const s of cseA_Students) {
            await Student.findOneAndUpdate(
                { rollNumber: s.rollNumber },
                { ...s, department: 'CSE', year: 'III YEAR', section: 'A', academicYear: '2024-2025' },
                { upsert: true }
            );
        }
        for (const s of cseA_II_Students) {
            await Student.findOneAndUpdate(
                { rollNumber: s.rollNumber },
                { ...s, department: 'CSE', year: 'II YEAR', section: 'A', academicYear: '2025-2026' },
                { upsert: true }
            );
        }
        for (const s of cseB_II_Students) {
            await Student.findOneAndUpdate(
                { rollNumber: s.rollNumber },
                { ...s, department: 'CSE', year: 'II YEAR', section: 'B', academicYear: '2025-2026' },
                { upsert: true }
            );
        }
        console.log('✅ All students seeded with academicYear tags');
    } else {
        const seedIfEmpty = (studentList, yr, dept, sec, acYear) => {
            const existing = mockDb.students.filter(ms => ms.year === yr && ms.department === dept && ms.section === sec && ms.academicYear === acYear);
            if (existing.length === 0) {
                studentList.forEach(s => {
                    mockDb.students.push({ ...s, department: dept, year: yr, section: sec, academicYear: acYear });
                });
                console.log(`✅ Seeded ${studentList.length} students for ${yr} CSE ${sec} (${acYear})`);
            }
        };

        // III YEAR batch 2023-2027 -> academic year 2024-2025
        seedIfEmpty(cseB_Students, 'III YEAR', 'CSE', 'B', '2024-2025');
        seedIfEmpty(cseA_Students, 'III YEAR', 'CSE', 'A', '2024-2025');
        // II YEAR batch 2024-2028 -> academic year 2025-2026
        seedIfEmpty(cseA_II_Students, 'II YEAR', 'CSE', 'A', '2025-2026');
        seedIfEmpty(cseB_II_Students, 'II YEAR', 'CSE', 'B', '2025-2026');

        console.log('✅ Demo Seed Verification Complete (with academicYear tags)');
    }
};


const migrateMockData = async () => {
    if (!fs.existsSync(DB_PATH)) return;
    
    try {
        const SectionMarks = (await import('./models/SectionMark.js')).default;
        const Student = (await import('./models/Student.js')).default;
        const Subject = (await import('./models/Subject.js')).default;
        
        const localData = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
        
        // Migrate Students
        if (localData.students && localData.students.length > 0) {
            console.log(`🔄 Syncing ${localData.students.length} students to MongoDB...`);
            for (let s of localData.students) {
                const { _id, ...studentData } = s; // Strip invalid _id
                await Student.findOneAndUpdate({ rollNumber: s.rollNumber }, studentData, { upsert: true });
            }
            console.log('✅ Students migrated');
        }

        // Migrate Subjects
        if (localData.subjects && localData.subjects.length > 0) {
            console.log(`🔄 Syncing ${localData.subjects.length} subjects to MongoDB...`);
            for (let s of localData.subjects) {
                const { _id, ...subjectData } = s; // Strip invalid _id
                await Subject.findOneAndUpdate({ code: s.code }, subjectData, { upsert: true });
            }
            console.log('✅ Subjects migrated');
        }

        // Migrate Marks
        if (localData.marks && Object.keys(localData.marks).length > 0) {
            console.log('🔄 Syncing local marks to MongoDB...');
            for (let [key, data] of Object.entries(localData.marks)) {
                const { _id, ...marksData } = data; // Strip invalid _id
                await SectionMarks.findOneAndUpdate(
                    { 
                        academicYear: marksData.academicYear, 
                        year: marksData.year, 
                        department: marksData.department, 
                        section: marksData.section, 
                        catType: marksData.catType 
                    },
                    marksData,
                    { upsert: true }
                );
            }
            console.log('✅ Local marks successfully migrated to MongoDB');
        }

        // Rename to prevent re-migration
        fs.renameSync(DB_PATH, `${DB_PATH}.backup_${Date.now()}`);
        console.log('📦 Migration Complete. local db.json backed up.');
    } catch (e) {
        console.error('⚠️ Migration error:', e.message);
    }
};

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');
        dbStatus.connected = true;
    } catch (err) {
        console.warn('⚠️ MongoDB connection failed. Switching to [OFFLINE DEMO MODE]');
    }
    if (dbStatus.connected) {
        await seedAdmin();
        await migrateMockData();
    }
    await seedSubjects();
};

app.locals.mockDb = mockDb;
app.locals.dbStatus = dbStatus;

// Start server
const PORT = process.env.PORT || 5000; 
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 KCE Server Securely Running on Port ${PORT}`);
    connectDB(); // Call connectDB here
});
