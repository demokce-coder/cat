import mongoose from 'mongoose';

const markSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
  score: { type: Number, required: true },
  assessment: { type: String, default: 'CAT' },
  createdAt: { type: Date, default: Date.now }
});

// Compound unique index for student-subject-assessment to prevent duplicates
markSchema.index({ student: 1, subject: 1, assessment: 1 }, { unique: true });

export default mongoose.model('Mark', markSchema);
