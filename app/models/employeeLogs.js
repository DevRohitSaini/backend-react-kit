import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const activityLogSchema  = new Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  action: { type: String, enum: ['Punch In', 'Punch Out'], required: true },
  timestamp: { type: Date, required: true, default: Date.now },
});

const activityLogModel = mongoose.model('ActivityLog', activityLogSchema);
export default activityLogModel;