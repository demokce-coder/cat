import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema({
  rollNumber: { type: String, required: true },
  academicYear: { type: String, required: true, default: '2025-2026' },
  name: { type: String, default: "" },
  department: { type: String, enum: ['CSE', 'ECE', 'MECH', 'CIVIL', 'EEE'], required: true },
  year: { type: String, enum: ['I YEAR', 'II YEAR', 'III YEAR', 'IV YEAR', 'FIRST YEAR', 'SECOND YEAR', 'THIRD YEAR', 'FINAL YEAR'], required: true },
  section: { type: String, enum: ['A', 'B'], required: true },
  createdAt: { type: Date, default: Date.now }
});

// Compound unique index for student-academicYear
studentSchema.index({ rollNumber: 1, academicYear: 1 }, { unique: true });

export default mongoose.model('Student', studentSchema);
