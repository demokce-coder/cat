import mongoose from 'mongoose';

const subjectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, required: true, unique: true },
  shortName: { type: String, default: "" },
  year: { type: String, enum: ['II YEAR', 'III YEAR'], default: 'III YEAR' },
  department: { type: String, default: 'CSE' }
});

export default mongoose.model('Subject', subjectSchema);
