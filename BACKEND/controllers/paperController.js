const mongoose = require('mongoose');
const Paper = require('../models/Paper');
const AgentOutput = require('../models/AgentOutput');
const Notification = require('../models/Notification');
const ActivityLog = require('../models/ActivityLog');
const User = require('../models/User');
const { uploadToCloudinary, deleteFromCloudinary } = require('../config/cloudinary');
const aiServiceClient = require('../utils/aiServiceClient');

// 1. Upload Paper
const uploadPaper = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded. Please select a PDF file.',
        code: 'VALIDATION_ERROR',
      });
    }

    const paperId = new mongoose.Types.ObjectId();

    // 1. Upload PDF buffer as raw to Cloudinary with inline content disposition (opens in new tab)
    let cloudinaryResult;
    try {
      cloudinaryResult = await uploadToCloudinary(req.file.buffer, {
        folder: `researchmind/papers/${req.user._id}`,
        public_id: `${paperId}.pdf`,
        resource_type: 'raw',
        content_disposition: 'inline',
      });
    } catch (uploadError) {
      console.error('Cloudinary upload failure:', uploadError.message);
      return res.status(503).json({
        success: false,
        message: 'Cloud storage upload failed',
        code: 'CLOUDINARY_UPLOAD_FAILED',
      });
    }

    // Parse additional metadata if provided
    let tags = [];
    if (req.body.tags) {
      try {
        tags = Array.isArray(req.body.tags)
          ? req.body.tags
          : JSON.parse(req.body.tags);
      } catch (e) {
        // Fallback for comma separated tags string
        tags = req.body.tags.split(',').map((t) => t.trim()).filter(Boolean);
      }
    }

    let projectId = null;
    if (req.body.projectId && mongoose.Types.ObjectId.isValid(req.body.projectId)) {
      projectId = req.body.projectId;
    }

    // 2. Create Paper document
    const paper = await Paper.create({
      _id: paperId,
      userId: req.user._id,
      title: req.body.title || req.file.originalname.replace('.pdf', ''),
      file: {
        cloudinaryUrl: cloudinaryResult.secure_url,
        cloudinaryPublicId: cloudinaryResult.public_id,
        originalFileName: req.file.originalname,
        fileSizeBytes: req.file.size,
        pageCount: req.body.pageCount ? parseInt(req.body.pageCount, 10) : undefined,
      },
      tags,
      projectId,
      status: 'uploading',
    });

    // 3. Create empty AgentOutput document
    const agentOutput = await AgentOutput.create({
      paperId: paper._id,
      userId: req.user._id,
    });

    // Link AgentOutput ref in paper
    paper.agentOutputRef = agentOutput._id;
    paper.status = 'processing';
    await paper.save();

    // 4. Update User stats
    await User.findByIdAndUpdate(req.user._id, { $inc: { papersUploaded: 1 } });

    // 5. Create Notification and Activity Log
    await Notification.create({
      userId: req.user._id,
      type: 'system',
      title: 'Processing Started',
      message: `Your paper "${req.file.originalname}" is being analysed by AI agents...`,
      metadata: { paperId: paper._id },
    });

    await ActivityLog.create({
      userId: req.user._id,
      action: 'paper_uploaded',
      description: `Uploaded paper: ${req.file.originalname}`,
      metadata: { paperId: paper._id },
      ipAddress: req.ip || '',
    });

    // 6. Trigger AI Processing Service asynchronously (fire-and-forget)
    aiServiceClient
      .post('/api/papers/process-paper', {
        paperId: paper._id.toString(),
        userId: req.user._id.toString(),
        cloudinaryUrl: cloudinaryResult.secure_url,
        fileName: req.file.originalname,
      })
      .then((aiRes) => {
        console.log(`AI Processing successfully triggered for paper ${paper._id}:`, aiRes.status);
      })
      .catch((aiError) => {
        console.error(`AI Processing failed to trigger for paper ${paper._id}:`, aiError.message);
        // We do not fail the upload request itself since the status callback will update failures
      });

    res.status(202).json({
      success: true,
      message: 'Paper uploaded. AI processing started.',
      data: {
        paperId: paper._id,
        status: 'processing',
        estimatedTimeSeconds: 60,
      },
    });
  } catch (error) {
    next(error);
  }
};

// 2. Get Papers List
const getPapers = async (req, res, next) => {
  try {
    const { status, isBookmarked, search, page = 1, limit = 12 } = req.query;

    const query = { userId: req.user._id };

    if (status) {
      query.status = status;
    }

    if (isBookmarked !== undefined) {
      query.isBookmarked = isBookmarked === 'true';
    }

    // Text search filter
    if (search) {
      query.$text = { $search: search };
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skipNum = (pageNum - 1) * limitNum;

    const totalCount = await Paper.countDocuments(query);
    const papers = await Paper.find(query)
      .select('title authors status isBookmarked file.originalFileName createdAt tags')
      .sort({ createdAt: -1 })
      .skip(skipNum)
      .limit(limitNum);

    const totalPages = Math.ceil(totalCount / limitNum);

    res.status(200).json({
      success: true,
      data: {
        papers,
        totalCount,
        page: pageNum,
        totalPages,
      },
    });
  } catch (error) {
    next(error);
  }
};

// 3. Get Paper By ID
const getPaperById = async (req, res, next) => {
  try {
    const paper = await Paper.findOne({
      _id: req.params.id,
      userId: req.user._id,
    }).populate('agentOutputRef');

    if (!paper) {
      return res.status(404).json({
        success: false,
        message: 'Paper not found or unauthorized',
        code: 'PAPER_NOT_FOUND',
      });
    }

    res.status(200).json({
      success: true,
      data: paper,
    });
  } catch (error) {
    next(error);
  }
};

// 4. Get Paper Status (Lightweight polling)
const getPaperStatus = async (req, res, next) => {
  try {
    const paper = await Paper.findOne({
      _id: req.params.id,
      userId: req.user._id,
    }).select('status processingError');

    if (!paper) {
      return res.status(404).json({
        success: false,
        message: 'Paper not found',
        code: 'PAPER_NOT_FOUND',
      });
    }

    res.status(200).json({
      success: true,
      paperId: paper._id,
      status: paper.status,
      processingError: paper.processingError,
    });
  } catch (error) {
    next(error);
  }
};

// 5. Delete Paper
const deletePaper = async (req, res, next) => {
  try {
    const paper = await Paper.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!paper) {
      return res.status(404).json({
        success: false,
        message: 'Paper not found or unauthorized',
        code: 'PAPER_NOT_FOUND',
      });
    }

    // 1. Delete from Cloudinary
    try {
      await deleteFromCloudinary(paper.file.cloudinaryPublicId, 'raw');
    } catch (cloudinaryError) {
      console.error('Failed to delete file from Cloudinary:', cloudinaryError.message);
    }

    // 2. Delete AgentOutput and Paper documents
    await AgentOutput.deleteOne({ paperId: paper._id });
    await Paper.deleteOne({ _id: paper._id });

    // 3. Decrement user uploaded stats
    await User.findByIdAndUpdate(req.user._id, { $inc: { papersUploaded: -1 } });

    // 4. Log action
    await ActivityLog.create({
      userId: req.user._id,
      action: 'paper_deleted',
      description: `Deleted paper: ${paper.title}`,
      metadata: { paperId: paper._id },
      ipAddress: req.ip || '',
    });

    res.status(200).json({
      success: true,
      message: 'Paper deleted',
    });
  } catch (error) {
    next(error);
  }
};

// 6. Toggle Bookmark
const toggleBookmark = async (req, res, next) => {
  try {
    const paper = await Paper.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!paper) {
      return res.status(404).json({
        success: false,
        message: 'Paper not found or unauthorized',
        code: 'PAPER_NOT_FOUND',
      });
    }

    paper.isBookmarked = !paper.isBookmarked;
    await paper.save();

    res.status(200).json({
      success: true,
      isBookmarked: paper.isBookmarked,
    });
  } catch (error) {
    next(error);
  }
};

// 7. Update Tags
const updateTags = async (req, res, next) => {
  try {
    const { tags } = req.body;

    if (!Array.isArray(tags)) {
      return res.status(400).json({
        success: false,
        message: 'Tags must be an array of strings',
        code: 'VALIDATION_ERROR',
      });
    }

    if (tags.length > 10) {
      return res.status(400).json({
        success: false,
        message: 'A paper cannot have more than 10 tags',
        code: 'VALIDATION_ERROR',
      });
    }

    const paper = await Paper.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { tags },
      { new: true }
    );

    if (!paper) {
      return res.status(404).json({
        success: false,
        message: 'Paper not found or unauthorized',
        code: 'PAPER_NOT_FOUND',
      });
    }

    res.status(200).json({
      success: true,
      tags: paper.tags,
    });
  } catch (error) {
    next(error);
  }
};

// 8. Get Agent Outputs
const getAgentOutputs = async (req, res, next) => {
  try {
    const paper = await Paper.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!paper) {
      return res.status(404).json({
        success: false,
        message: 'Paper not found or unauthorized',
        code: 'PAPER_NOT_FOUND',
      });
    }

    const agentOutput = await AgentOutput.findOne({ paperId: req.params.id });
    if (!agentOutput) {
      return res.status(404).json({
        success: false,
        message: 'AI agent outputs not found for this paper',
        code: 'AGENT_OUTPUTS_NOT_FOUND',
      });
    }

    res.status(200).json({
      success: true,
      data: agentOutput,
    });
  } catch (error) {
    next(error);
  }
};

// 9. Paper Status Callback (Webhook from AI Service)
const paperStatusCallback = async (req, res, next) => {
  try {
    // 1. Verify X-API-Key header matches AI_SERVICE_API_KEY
    const apiKey = req.headers['x-api-key'];
    if (apiKey !== process.env.AI_SERVICE_API_KEY) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized callback signature',
        code: 'AUTH_UNAUTHORIZED_CALLBACK',
      });
    }

    const { paperId, status, error, agentOutputs } = req.body;

    const paper = await Paper.findById(paperId);
    if (!paper) {
      return res.status(404).json({
        success: false,
        message: 'Paper not found',
        code: 'PAPER_NOT_FOUND',
      });
    }

    // Update status
    paper.status = status; // 'ready' or 'failed'
    if (error) {
      paper.processingError = error;
    }

    // If metadata was extracted during parsing, update Paper model fields
    if (agentOutputs && agentOutputs.paper_metadata) {
      const meta = agentOutputs.paper_metadata;
      paper.title = meta.title || paper.title;
      paper.authors = meta.authors || paper.authors;
      paper.abstract = meta.abstract || paper.abstract;
      paper.doi = meta.doi || paper.doi;
      paper.publicationYear = meta.year || paper.publicationYear;
      paper.journal = meta.journal || paper.journal;
      paper.keywords = meta.keywords || paper.keywords;
    }

    await paper.save();

    // Update AgentOutput
    if (status === 'ready' && agentOutputs) {
      const updateData = {};
      
      if (agentOutputs.summary) updateData.summary = agentOutputs.summary;
      if (agentOutputs.citations) updateData.citations = agentOutputs.citations;
      if (agentOutputs.research_gaps) updateData.researchGaps = agentOutputs.research_gaps;
      if (agentOutputs.future_work) updateData.futureWork = agentOutputs.future_work;
      if (agentOutputs.experiment_suggestions) updateData.experimentSuggestions = agentOutputs.experiment_suggestions;
      if (agentOutputs.keywords) updateData.keywords = agentOutputs.keywords;
      if (agentOutputs.mind_map) updateData.mindMap = agentOutputs.mind_map;
      if (agentOutputs.flashcards) updateData.flashcards = agentOutputs.flashcards;
      if (agentOutputs.quiz) updateData.quiz = agentOutputs.quiz;
      if (agentOutputs.research_ideas) updateData.researchIdeas = agentOutputs.research_ideas;
      
      if (agentOutputs.equations) {
        updateData.equations = {
          list: (agentOutputs.equations.equations || []).map(eq => ({
            latex: eq.equation || '',
            description: eq.description || eq.context || '',
            pageNumber: eq.pageNumber || 1
          }))
        };
      }
      if (agentOutputs.highlights) {
        updateData.highlights = {
          list: (agentOutputs.highlights.highlights || []).map(h => h.quote || h)
        };
      }
      if (agentOutputs.literature_review) updateData.literatureReview = agentOutputs.literature_review;
      if (agentOutputs.figures) updateData.figures = agentOutputs.figures;
      if (agentOutputs.writing_drafts) updateData.writingDrafts = agentOutputs.writing_drafts;
      
      if (Object.keys(updateData).length > 0) {
        await AgentOutput.findOneAndUpdate(
          { paperId },
          { $set: updateData },
          { upsert: true }
        );
      }
    }

    // Create Notification based on result
    await Notification.create({
      userId: paper.userId,
      type: status === 'ready' ? 'paper_ready' : 'processing_failed',
      title: status === 'ready' ? 'Analysis Complete' : 'Analysis Failed',
      message: status === 'ready'
        ? `Your paper "${paper.title}" is ready for reading and analysis.`
        : `AI analysis of your paper "${paper.file.originalFileName}" failed: ${error}`,
      metadata: { paperId, error },
    });

    res.status(200).json({
      success: true,
      message: 'Paper status callback logged successfully',
    });
  } catch (error) {
    next(error);
  }
};

// 10. Trigger Agent Task (Regeneration / Literature Review forwarding)
const triggerAgentTask = async (req, res, next) => {
  try {
    const { agentType, additionalPaperIds, writingMode } = req.body;
    const paperId = req.params.id;

    const paper = await Paper.findOne({
      _id: paperId,
      userId: req.user._id,
    });

    if (!paper) {
      return res.status(404).json({
        success: false,
        message: 'Paper not found or unauthorized',
        code: 'PAPER_NOT_FOUND',
      });
    }

    // Forward the POST request to FastAPI service
    const axios = require('axios');
    const aiBaseURL = (process.env.AI_SERVICE_URL ? process.env.AI_SERVICE_URL.replace(/\/$/, '') : 'http://localhost:8080') + '/api';
    const apiKey = process.env.AI_SERVICE_API_KEY;

    axios.post(`${aiBaseURL}/papers/agent-task`, {
      paperId,
      userId: req.user._id.toString(),
      agentType,
      additionalPaperIds: additionalPaperIds || [],
      writingMode: writingMode || 'slides'   // ← forward mode to Python service
    }, {
      headers: {
        'X-API-Key': apiKey,
        'Content-Type': 'application/json'
      }
    }).catch(err => {
      console.error('Failed to trigger background agent task in Python service:', err.message);
    });

    res.status(202).json({
      success: true,
      message: `Agent task "${agentType}" trigger initiated.`,
    });
  } catch (error) {
    next(error);
  }
};

// 11. Query Grounded QA
const queryPaper = async (req, res, next) => {
  try {
    const { query } = req.query;
    const paperId = req.params.id;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Query parameter is required',
        code: 'VALIDATION_ERROR',
      });
    }

    const paper = await Paper.findOne({
      _id: paperId,
      userId: req.user._id,
    });

    if (!paper) {
      return res.status(404).json({
        success: false,
        message: 'Paper not found or unauthorized',
        code: 'PAPER_NOT_FOUND',
      });
    }

    const axios = require('axios');
    const aiBaseURL = (process.env.AI_SERVICE_URL ? process.env.AI_SERVICE_URL.replace(/\/$/, '') : 'http://localhost:8080') + '/api';

    const response = await axios.get(`${aiBaseURL}/papers/${paperId}/query`, {
      params: {
        query,
        userId: req.user._id.toString()
      }
    });

    res.status(200).json(response.data);
  } catch (error) {
    if (error.response) {
      return res.status(error.response.status).json(error.response.data);
    }
    next(error);
  }
};

module.exports = {
  uploadPaper,
  getPapers,
  getPaperById,
  getPaperStatus,
  deletePaper,
  toggleBookmark,
  updateTags,
  getAgentOutputs,
  paperStatusCallback,
  triggerAgentTask,
  queryPaper,
};
