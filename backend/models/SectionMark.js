import mongoose from 'mongoose';

const sectionMarkSchema = new mongoose.Schema({
    year: { type: String, required: true },
    academicYear: { type: String, required: true, default: '2025-2026' },
    department: { type: String, required: true },
    section: { type: String, required: true },
    catType: { type: String, required: true }, // CAT1, CAT2, CAT3
    subjects: [{
        code: String,
        name: String,
        shortName: String,
        examDate: String
    }],
    scores: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    subjectDates: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    updatedAt: { type: Date, default: Date.now }
}, { minimize: false });export default mongoose.model('SectionMark', sectionMarkSchema);
