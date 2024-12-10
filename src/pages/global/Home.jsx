import React, { useState } from 'react';
import UploadQuestion from './UploadQuestion';
import GenerateQuestions from './GenerateQuestions';
import PlagiarismChecker from './PlagiarismChecker'; // Import the PlagiarismChecker component

const Home = () => {
  const [activeTab, setActiveTab] = useState('generate'); // 'generate', 'upload', or 'plagiarism-checker'

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="mb-4 sm:mb-0">
              <h1 className="text-3xl font-bold text-gray-900">Question Generator</h1>
              <p className="mt-1 text-sm text-gray-500">
                Generate, upload, or check plagiarism for your questions
              </p>
            </div>

          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="flex space-x-1 rounded-xl bg-gray-200 p-1 mb-8">
        <button
            onClick={() => setActiveTab('plagiarism-checker')}
            className={`w-full rounded-lg py-2.5 text-sm font-medium leading-5 ${
              activeTab === 'plagiarism-checker'
                ? 'bg-white text-blue-700 shadow'
                : 'text-gray-700 hover:bg-white/[0.12] hover:text-gray-900'
            } transition-all duration-200 ease-in-out`}
          >
            Plagiarism Checker
          </button>
          <button
            onClick={() => setActiveTab('generate')}
            className={`w-full rounded-lg py-2.5 text-sm font-medium leading-5 ${
              activeTab === 'generate'
                ? 'bg-white text-blue-700 shadow'
                : 'text-gray-700 hover:bg-white/[0.12] hover:text-gray-900'
            } transition-all duration-200 ease-in-out`}
          >
            Generate Questions
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            className={`w-full rounded-lg py-2.5 text-sm font-medium leading-5 ${
              activeTab === 'upload'
                ? 'bg-white text-blue-700 shadow'
                : 'text-gray-700 hover:bg-white/[0.12] hover:text-gray-900'
            } transition-all duration-200 ease-in-out`}
          >
            Upload Questions
          </button>
        
        </div>

        {/* Quick Tips */}
        <div className="bg-blue-50 rounded-xl p-4 mb-8">
          <h2 className="text-lg font-semibold text-blue-800 mb-2">
            {activeTab === 'generate'
              ? 'Generation Tips'
              : activeTab === 'upload'
              ? 'Upload Guidelines'
              : 'Plagiarism Tips'}
          </h2>
          <ul className="text-sm text-blue-700 space-y-1">
            {activeTab === 'generate' ? (
              <>
                <li>• Use specific keywords for better results</li>
                <li>• Separate multiple topics with commas</li>
                <li>• Include difficulty level in keywords</li>
              </>
            ) : activeTab === 'upload' ? (
              <>
                <li>• Ensure questions are clear and concise</li>
                <li>• Include any relevant context</li>
                <li>• Check for proper formatting</li>
              </>
            ) : (
              <>
                <li>• Ensure the question text is complete</li>
                <li>• Avoid unnecessary special characters</li>
                <li>• Review results for accuracy</li>
              </>
            )}
          </ul>
        </div>

        {/* Components */}
        <div className="transition-all duration-300 ease-in-out">
          {activeTab === 'generate' && (
            <div className="animate-fadeIn">
              <GenerateQuestions />
            </div>
          )}
          {activeTab === 'upload' && (
            <div className="animate-fadeIn">
              <UploadQuestion />
            </div>
          )}
          {activeTab === 'plagiarism-checker' && (
            <div className="animate-fadeIn">
              <PlagiarismChecker />
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <p className="text-sm text-gray-500 mb-4 sm:mb-0">
              Need help? Check out our{' '}
              <a href="#" className="text-blue-600 hover:text-blue-700">
                documentation
              </a>{' '}
              or{' '}
              <a href="#" className="text-blue-600 hover:text-blue-700">
                contact support
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
