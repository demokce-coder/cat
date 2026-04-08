import mongoose from 'mongoose';

const timetableSchema = new mongoose.Schema({
  title: { type: String, required: true },
  batch: { type: String },
  strength: { type: String },
  hall: { type: String },
  coordinator: { type: String },
  chairperson: { type: String },
  schedule: [
    {
      day: { type: String, required: true },
      periods: [
        {
          s: { type: String, required: true },
          span: { type: Number, default: 1 }
        }
      ]
    }
  ]
});

export default mongoose.model('TimeTable', timetableSchema);
