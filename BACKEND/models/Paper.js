const mongoose = require('mongoose');

const PaperSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Owner userId is required'],
      index: true,
    },
    title: {
      type: String,
      trim: true,
      default: '',
    },
    authors: {
      type: [String],
      default: [],
    },
    abstract: {
      type: String,
      default: '',
    },
    doi: {
      type: String,
      trim: true,
      default: '',
    },
    publicationYear: {
      type: Number,
    },
    journal: {
      type: String,
      trim: true,
      default: '',
    },
    keywords: {
      type: [String],
      default: [],
    },
    file: {
      cloudinaryUrl: {
        type: String,
        required: [true, 'Cloudinary secure URL is required'],
      },
      cloudinaryPublicId: {
        type: String,
        required: [true, 'Cloudinary public ID is required'],
      },
      originalFileName: {
        type: String,
        default: '',
      },
      fileSizeBytes: {
        type: Number,
      },
      pageCount: {
        type: Number,
      },
    },
    status: {
      type: String,
      enum: ['uploading', 'processing', 'ready', 'failed'],
      default: 'uploading',
      index: true,
    },
    processingError: {
      type: String,
      default: '',
    },
    chromaCollectionId: {
      type: String,
      default: '',
    },
    tags: {
      type: [String],
      default: [],
    },
    isBookmarked: {
      type: Boolean,
      default: false,
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      default: null,
    },
    agentOutputRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AgentOutput',
    },
  },
  {
    timestamps: true,
  }
);

// Compound Index for user dashboard queries
PaperSchema.index({ userId: 1, createdAt: -1 });

// Text Index for semantic search fallback keywords search
PaperSchema.index({ keywords: 'text' });

module.exports = mongoose.model('Paper', PaperSchema);
