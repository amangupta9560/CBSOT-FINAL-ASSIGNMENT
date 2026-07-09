const mongoose = require('mongoose');

const AgentOutputSchema = new mongoose.Schema(
  {
    paperId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Paper',
      required: true,
      unique: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    summary: {
      simple: { type: String, default: '' },
      technical: { type: String, default: '' },
      keyContributions: { type: [String], default: [] },
      methodology: { type: String, default: '' },
      results: { type: String, default: '' },
      limitations: { type: String, default: '' },
      generatedAt: { type: Date },
    },
    citations: {
      apa: { type: String, default: '' },
      bibtex: { type: String, default: '' },
      ieee: { type: String, default: '' },
      mla: { type: String, default: '' },
      generatedAt: { type: Date },
    },
    researchGaps: {
      gaps: { type: [String], default: [] },
      opportunities: { type: [String], default: [] },
      unexploredAreas: { type: [String], default: [] },
      generatedAt: { type: Date },
    },
    futureWork: {
      suggestions: [
        {
          direction: { type: String, default: '' },
          rationale: { type: String, default: '' },
          difficulty: { type: String, default: '' },
        },
      ],
      generatedAt: { type: Date },
    },
    experimentSuggestions: {
      experiments: [
        {
          title: { type: String, default: '' },
          hypothesis: { type: String, default: '' },
          methodology: { type: String, default: '' },
          expectedOutcome: { type: String, default: '' },
        },
      ],
      generatedAt: { type: Date },
    },
    keywords: {
      technical: { type: [String], default: [] },
      general: { type: [String], default: [] },
      generatedAt: { type: Date },
    },
    mindMap: {
      root: { type: mongoose.Schema.Types.Mixed, default: null },
      generatedAt: { type: Date },
    },
    equations: {
      list: [
        {
          latex: { type: String, default: '' },
          description: { type: String, default: '' },
          pageNumber: { type: Number },
        },
      ],
      generatedAt: { type: Date },
    },
    highlights: {
      list: { type: [String], default: [] },
      generatedAt: { type: Date },
    },
    flashcards: [
      {
        question: { type: String, default: '' },
        answer: { type: String, default: '' },
        difficulty: { type: String, default: '' },
        topic: { type: String, default: '' },
      },
    ],
    quiz: [
      {
        question: { type: String, default: '' },
        options: { type: [String], default: [] },
        correctAnswer: { type: String, default: '' },
        explanation: { type: String, default: '' },
      },
    ],
    researchIdeas: [
      {
        title: { type: String, default: '' },
        description: { type: String, default: '' },
        potentialImpact: { type: String, default: '' },
      },
    ],
    literatureReview: { type: String, default: '' },
    figures: [
      {
        id: { type: String, default: '' },
        title: { type: String, default: '' },
        description: { type: String, default: '' },
        analysis: { type: String, default: '' },
      },
    ],
    writingDrafts: {
      patent: { type: String, default: '' },
      grant: { type: String, default: '' },
      slides: { type: String, default: '' },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('AgentOutput', AgentOutputSchema);
