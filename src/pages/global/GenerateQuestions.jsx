import React, { useState } from 'react';
import axios from 'axios';
import { CheckCircle, AlertCircle, Upload, Loader, XCircle } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

const GenerateQuestion = () => {
  const [questionType, setQuestionType] = useState('What');
  const [keywords, setKeywords] = useState('');
  const [generatedQuestions, setGeneratedQuestions] = useState([]);
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [uploadedQuestions, setUploadedQuestions] = useState(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });
  const [uploadProgress, setUploadProgress] = useState({});

  const questionTypes = [
    'What', 'Why', 'How', 'Can', 'Do', 'Which', 'Where', 'When', 
    'Explain', 'Describe', 'Discuss'
  ];

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type }), 3000);
  };

  const resetForm = () => {
    setKeywords('');
    setQuestionType('What');
    setGeneratedQuestions([]);
    setSelectedQuestions([]);
    setUploadedQuestions(new Set());
    setUploadProgress({});
  };

  const handleGenerate = async () => {
    const keywordList = keywords.split(',').map(kw => kw.trim()).filter(kw => kw);
    if (keywordList.length < 3) {
      showNotification('Please enter at least three keywords.', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_DOMAIN}/api/v1/questions/generate`,
        { params: { keywords, questionType, count: 5 } }
      );

      if (response.data.message) {
        showNotification(response.data.message, 'warning');
        setGeneratedQuestions([]);
        return;
      }

      setGeneratedQuestions(response.data.questions);
      setSelectedQuestions([]);
      setUploadedQuestions(new Set());
      setUploadProgress({});
      showNotification('Questions generated successfully!');
    } catch (err) {
      showNotification(err.response?.data?.message || 'Error generating questions.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectQuestion = (index) => {
    setSelectedQuestions(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const handleSelectAll = () => {
    if (selectedQuestions.length === generatedQuestions.length) {
      setSelectedQuestions([]);
    } else {
      setSelectedQuestions([...Array(generatedQuestions.length).keys()]);
    }
  };

  const handleUploadQuestion = async (index) => {
    if (uploadedQuestions.has(index)) {
      showNotification('Question already uploaded!', 'warning');
      return;
    }

    setUploadProgress(prev => ({ ...prev, [index]: 'uploading' }));
    try {
      const questionToUpload = generatedQuestions[index].question;
      const response = await axios.post(
        `${import.meta.env.VITE_DOMAIN}/api/v1/questions`,
        { text: questionToUpload }
      );

      if (response.data.success || response.status === 201) {
        setUploadedQuestions(prev => new Set([...prev, index]));
        setUploadProgress(prev => ({ ...prev, [index]: 'success' }));
        showNotification('Question uploaded successfully!');
        
        // Clear the success status after 2 seconds
        setTimeout(() => {
          setUploadProgress(prev => {
            const newProgress = { ...prev };
            delete newProgress[index];
            return newProgress;
          });
        }, 2000);
      }
    } catch (err) {
      setUploadProgress(prev => ({ ...prev, [index]: 'error' }));
      showNotification(err.response?.data?.message || 'Error uploading question.', 'error');
      
      // Clear the error status after 2 seconds
      setTimeout(() => {
        setUploadProgress(prev => {
          const newProgress = { ...prev };
          delete newProgress[index];
          return newProgress;
        });
      }, 2000);
    }
  };

  const handleUploadSelected = async () => {
    if (selectedQuestions.length === 0) {
      showNotification('No questions selected to upload.', 'error');
      return;
    }
  
    const unuploadedQuestions = selectedQuestions.filter(index => !uploadedQuestions.has(index));
    if (unuploadedQuestions.length === 0) {
      showNotification('All selected questions are already uploaded!', 'warning');
      return;
    }
  
    setIsUploading(true);
    try {
      const uploadPromises = unuploadedQuestions.map(async (index) => {
        setUploadProgress(prev => ({ ...prev, [index]: 'uploading' }));
        try {
          const response = await axios.post(
            `${import.meta.env.VITE_DOMAIN}/api/v1/questions`,
            { text: generatedQuestions[index].question }
          );
          if (response.data.success || response.status === 201) {
            setUploadedQuestions(prev => new Set([...prev, index]));
            setUploadProgress(prev => ({ ...prev, [index]: 'success' }));
          }
          
        } catch (err) {
          setUploadProgress(prev => ({ ...prev, [index]: 'error' }));
          throw err;
        }
      });
  
      await Promise.all(uploadPromises);
  
      showNotification('Selected questions uploaded successfully!');
      setSelectedQuestions([]);
    } catch (err) {
      showNotification('Some questions failed to upload. Please try again.', 'error');
    } finally {
      setTimeout(() => {
        setUploadProgress({});
      }, 2000);
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Notification Toast */}
      {notification.show && (
        <div className="fixed top-4 right-4 z-50">
          <Alert variant={notification.type === 'error' ? 'destructive' : 'default'}>
            <AlertTitle className="flex items-center gap-2">
              {notification.type === 'success' ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                <AlertCircle className="w-4 h-4" />
              )}
              {notification.type === 'success' ? 'Success' : 'Notification'}
            </AlertTitle>
            <AlertDescription>{notification.message}</AlertDescription>
          </Alert>
        </div>
      )}

      {/* Main Content */}
      <div className="bg-white rounded-xl shadow-lg p-6 space-y-6">
        <h2 className="text-3xl font-bold text-gray-800">
          Generate and Upload Questions
        </h2>

        {/* Controls */}
        <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="block text-gray-700 font-medium">
            Question Type
          </label>
          <select
            value={questionType}
            onChange={(e) => setQuestionType(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
            disabled={isLoading}
          >
            {questionTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

          <div className="space-y-2">
            <label className="block text-gray-700 font-medium">
              Keywords (at least 3, separated by commas)
            </label>
            <input
              type="text"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              placeholder="Enter keywords, separated by commas..."
              className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4">
          <button
            onClick={handleGenerate}
            disabled={isLoading || isUploading}
            className="flex items-center gap-2 px-6 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading && <Loader className="w-5 h-5 animate-spin" />}
            {isLoading ? 'Generating...' : 'Generate Questions'}
          </button>

          {generatedQuestions.length > 0 && (
            <>
              <button
                onClick={handleSelectAll}
                disabled={isUploading}
                className="px-6 py-2 rounded-lg bg-gray-600 text-white font-medium hover:bg-gray-700 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {selectedQuestions.length === generatedQuestions.length 
                  ? 'Deselect All' 
                  : 'Select All'}
              </button>

              <button
                onClick={handleUploadSelected}
                disabled={selectedQuestions.length === 0 || isUploading}
                className="flex items-center gap-2 px-6 py-2 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:bg-green-400 disabled:cursor-not-allowed transition-colors"
              >
                {isUploading && <Loader className="w-5 h-5 animate-spin" />}
                {isUploading ? 'Uploading...' : `Upload Selected (${selectedQuestions.length})`}
              </button>

              <button
                onClick={resetForm}
                disabled={isLoading || isUploading}
                className="px-6 py-2 rounded-lg bg-red-600 text-white font-medium hover:bg-gray-700 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                Reset
              </button>
            </>
          )}
        </div>
      </div>

      {/* Generated Questions */}
      {generatedQuestions.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6 space-y-4">
          <h3 className="text-2xl font-bold text-gray-800">
            Generated Questions
          </h3>

          <div className="space-y-4">
            {generatedQuestions.map((item, index) => (
              <div
                key={index}
                className={`group relative flex items-start gap-4 p-4 rounded-lg transition-colors ${
                  selectedQuestions.includes(index) 
                    ? 'bg-blue-50' 
                    : uploadedQuestions.has(index)
                    ? 'bg-green-50'
                    : 'bg-gray-50'
                } hover:bg-blue-50`}
              >
                <input
                  type="checkbox"
                  checked={selectedQuestions.includes(index)}
                  onChange={() => handleSelectQuestion(index)}
                  disabled={isUploading}
                  className="mt-1.5 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:cursor-not-allowed"
                />

                <div className="flex-1 space-y-2">
                  <p className="text-lg text-gray-800">
                    {item.question}
                  </p>

                  {item.plagiarismScore && (
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        item.plagiarismScore < 30 ? 'bg-green-500' :
                        item.plagiarismScore < 70 ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`} />
                      <span className="text-sm text-gray-600">
                        Plagiarism Score: 
                        <span className="ml-1 font-medium">
                          {item.plagiarismScore}%
                        </span>
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                {uploadedQuestions.has(index) ? (
                  <div className="flex items-center gap-1 text-green-600">
                    <CheckCircle className="w-5 h-5" />
                    <span className="text-sm font-medium">Uploaded</span>
                  </div>
                ) : uploadProgress[index] === 'uploading' ? (
                  <div className="flex items-center gap-1 text-blue-600">
                    <Loader className="w-5 h-5 animate-spin" />
                    <span className="text-sm font-medium">Uploading...</span>
                  </div>
                ) : uploadProgress[index] === 'error' ? (
                  <div className="flex items-center gap-1 text-red-600">
                    <XCircle className="w-5 h-5" />
                    <span className="text-sm font-medium">Failed</span>
                  </div>
                ) : (
                  <button
                    onClick={() => handleUploadQuestion(index)}
                    disabled={isUploading}
                    className="opacity-0 group-hover:opacity-100 flex items-center gap-1 px-3 py-1 rounded-lg bg-green-100 text-green-700 hover:bg-green-200 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed transition-all"
                  >
                    <Upload className="w-4 h-4" />
                    <span className="text-sm font-medium">Upload</span>
                  </button>
                )}
              </div>
                
              </div>
            ))}
          </div>

          {/* Summary Status */}
          {generatedQuestions.length > 0 && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-700">Total Questions:</span>
                  <span className="text-gray-600">{generatedQuestions.length}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-700">Selected:</span>
                  <span className="text-gray-600">{selectedQuestions.length}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-700">Uploaded:</span>
                  <span className="text-gray-600">{uploadedQuestions.size}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* No Questions State */}
      {!isLoading && generatedQuestions.length === 0 && (
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="space-y-4">
            <p className="text-gray-600">
              No questions generated yet. Enter at least three keywords and click "Generate Questions" to start.
            </p>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex flex-col items-center space-y-4">
            <Loader className="w-8 h-8 animate-spin text-blue-600" />
            <p className="text-gray-800 font-medium">Generating Questions...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default GenerateQuestion;