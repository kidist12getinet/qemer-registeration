const mongoose = require('mongoose');

const RegistrationSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Student reference is required']
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: [true, 'Course reference is required']
  },
  phone: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        return /^\+251[0-9]{9}$/.test(v);
      },
      message: 'Phone number must be in format +251xxxxxxxxx'
    }
  },
  gender: {
    type: String,
    required: true,
    enum: ['Male', 'Female']
  },
  registrationDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['Pending', 'Active', 'Inactive'],
    default: 'Pending'
  },
  schedule: {
    type: String,
    enum: ['Weekdays', 'Evenings', 'Weekends'],
    required: [true, 'Schedule is required']
  },
  mode: {
    type: String,
    enum: ['Online', 'In-Person'],
    required: [true, 'Mode is required']
  },
  location: {
    type: String,
    required: [true, 'Location is required']
  },
  referral: {
    type: String
  },
  hasPcDesktop: {
    type: String,
    enum: ['Yes', 'No'],
    required: [true, 'PC/Desktop availability is required']
  },
  dropReason: {
    type: String
  },
  dropDate: {
    type: Date
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvalDate: {
    type: Date
  },
  notes: {
    type: String
  }
}, {
  timestamps: true
});

// Create a compound index to prevent duplicate registrations
RegistrationSchema.index({ student: 1, course: 1 }, { unique: true });

module.exports = mongoose.model('Registration', RegistrationSchema);

