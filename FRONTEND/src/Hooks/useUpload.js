import { useState, useRef, useEffect } from 'react';
import usePaper from './usePaper';

/**
 * Custom hook to manage PDF upload page state, tag list, and stepper progress polling.
 * @param {Function} onSuccess - Callback when polling finishes successfully (status: ready)
 * @param {Function} onError - Callback when upload or processing fails
 */
const useUpload = (onSuccess, onError) => {
  const [file, setFile] = useState(null);
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [paperId, setPaperId] = useState(null);
  
  // Stepper states
  const [processingStatus, setProcessingStatus] = useState(null); // 'processing' | 'ready' | 'failed'
  const [currentStep, setCurrentStep] = useState(0); // 0 to 4
  const [processingError, setProcessingError] = useState('');
  
  const { uploadPaper, getPaperStatus } = usePaper();
  const pollingIntervalRef = useRef(null);

  const steps = [
    { title: 'Uploading PDF to Cloud', desc: 'Securely transmitting document to Cloudinary CDN.' },
    { title: 'Extracting Layout & Text', desc: 'Parsing structure, paragraphs, tables, and DOI metadata.' },
    { title: 'Generating Vector Embeddings', desc: 'Slicing text and compiling 384-dim semantic models.' },
    { title: 'Running 14 AI Agents', desc: 'Collaborating summaries, citations, quiz generation, and gaps.' },
    { title: 'Analysis Complete!', desc: 'Redirecting to your analysis detail dashboard...' },
  ];

  const validateAndSetFile = (selectedFile) => {
    if (selectedFile.type !== 'application/pdf') {
      throw new Error('Only PDF files are accepted');
    }
    if (selectedFile.size > 25 * 1024 * 1024) {
      throw new Error('File size exceeds 25MB limit');
    }
    setFile(selectedFile);
  };

  const removeFile = () => {
    setFile(null);
    setTags([]);
    setTagInput('');
    setProcessingStatus(null);
    setCurrentStep(0);
    setProcessingError('');
  };

  const addTag = (tagText) => {
    const val = tagText.trim().toLowerCase();
    if (val && !tags.includes(val)) {
      if (tags.length >= 10) {
        throw new Error('A paper cannot have more than 10 tags');
      }
      setTags([...tags, val]);
      setTagInput('');
    }
  };

  const removeTag = (indexToRemove) => {
    setTags(tags.filter((_, idx) => idx !== indexToRemove));
  };

  const startStatusPolling = (id) => {
    setCurrentStep(1); // Set to step 1 (Extracting) immediately upon API trigger

    pollingIntervalRef.current = setInterval(async () => {
      try {
        const res = await getPaperStatus(id);
        setProcessingStatus(res.status);

        if (res.status === 'processing') {
          // Increment steps over time to simulate progress
          setCurrentStep((prev) => {
            if (prev < 3) return prev + 1;
            return prev; // Lock at step 3 (Running AI Agents) until ready callback updates status
          });
        } else if (res.status === 'ready') {
          clearInterval(pollingIntervalRef.current);
          setCurrentStep(4); // Verification complete step
          if (onSuccess) onSuccess(id);
        } else if (res.status === 'failed') {
          clearInterval(pollingIntervalRef.current);
          setProcessingError(res.processingError || 'An error occurred during AI processing.');
          if (onError) onError(res.processingError || 'AI processing failed');
        }
      } catch (err) {
        console.error('Polling error:', err.message);
      }
    }, 3000);
  };

  const executeUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setCurrentStep(0); // Start at step 0 (Uploading)
    setProcessingError('');

    try {
      const response = await uploadPaper(file, tags);
      if (response && response.success) {
        const uploadedPaperId = response.data.paperId || response.data._id;
        setPaperId(uploadedPaperId);
        startStatusPolling(uploadedPaperId);
      } else {
        throw new Error(response.message || 'Upload failed');
      }
    } catch (err) {
      setIsUploading(false);
      setProcessingError(err.message || 'Upload failed');
      if (onError) onError(err.message || 'Upload failed');
    }
  };

  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);

  return {
    file,
    tagInput,
    setTagInput,
    tags,
    isUploading,
    paperId,
    processingStatus,
    currentStep,
    processingError,
    steps,
    validateAndSetFile,
    removeFile,
    addTag,
    removeTag,
    executeUpload,
  };
};

export default useUpload;
