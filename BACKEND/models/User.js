const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
    },
    role: {
      type: String,
      enum: ['student', 'admin'],
      default: 'student',
    },
    profileImage: {
      url: { type: String, default: '' },
      publicId: { type: String, default: '' },
    },
    institution: {
      type: String,
      trim: true,
      default: '',
    },
    researchDomain: {
      type: String,
      trim: true,
      default: '',
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    otp: {
      code: { type: String, default: '' },
      expiresAt: { type: Date },
      attempts: { type: Number, default: 0 },
    },
    passwordResetToken: {
      type: String,
      default: '',
    },
    passwordResetExpires: {
      type: Date,
    },
    papersUploaded: {
      type: Number,
      default: 0,
    },
    lastLogin: {
      type: Date,
    },
    preferences: {
      theme: {
        type: String,
        enum: ['light', 'dark'],
        default: 'light',
      },
      emailNotifications: {
        type: Boolean,
        default: true,
      },
      defaultCitationFormat: {
        type: String,
        enum: ['APA', 'BibTeX', 'IEEE', 'MLA'],
        default: 'APA',
      },
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
UserSchema.index({ role: 1 });
UserSchema.index({ createdAt: 1 });

module.exports = mongoose.model('User', UserSchema);
