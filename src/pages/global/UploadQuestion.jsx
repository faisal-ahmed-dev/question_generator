import React, { useState } from 'react';
import axios from 'axios';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Loader2, Upload, File, X } from 'lucide-react';
import QuestionList from './QuestionList';
import {
  Toast,
  ToastProvider,
  ToastViewport,
  ToastTitle,
  ToastDescription,
} from '@/components/ui/toast';

const UploadQuestion = () => {
  const [text, setText] = useState('');
  const [pdfFile, setPdfFile] = useState(null);
  const [detectedQuestions, setDetectedQuestions] = useState([]);
  const [uploadResult, setUploadResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessingPDF, setIsProcessingPDF] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!text.trim()) {
      showToast('Please enter a question.', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_DOMAIN}/api/v1/questions`,
        { text }
      );

      const data = response.data;
      setUploadResult(data);
      setText('');

      if (data.isPlagiarized) {
        showToast(`Plagiarism detected! Score: ${data.plagiarismScore}%`, 'warning');
      } else {
        showToast('Question uploaded successfully!');
      }
    } catch (err) {
      console.error(err);
      showToast('Error uploading question', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePDFUpload = async () => {
    if (!pdfFile) return;

    setIsProcessingPDF(true);
    try {
      const formData = new FormData();
      formData.append('pdf', pdfFile);

      const response = await axios.post(
        `${import.meta.env.VITE_DOMAIN}/api/v1/questions/upload-pdf`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      );

      if (response.data.questions?.length > 0) {
        setDetectedQuestions(response.data.questions);
        showToast('PDF processed successfully');
      } else {
        showToast('No questions detected in the PDF.', 'warning');
      }
    } catch (err) {
      console.error(err);
      showToast('Error processing PDF', 'error');
    } finally {
      setIsProcessingPDF(false);
    }
  };

  const handleSubmitDetectedQuestions = async () => {
    if (detectedQuestions.length === 0) {
      showToast('No questions to upload.', 'error');
      return;
    }

    setIsLoading(true);
    try {
      await axios.post(
        `${import.meta.env.VITE_DOMAIN}/api/v1/questions/upload-multiple`,
        { questions: detectedQuestions }
      );

      setDetectedQuestions([]);
      showToast('Questions uploaded successfully!');
    } catch (err) {
      console.error(err);
      showToast('Error uploading questions', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ToastProvider>
      <div className="max-w-4xl mx-auto p-6">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Upload Questions</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="single" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="single">Single Question</TabsTrigger>
                <TabsTrigger value="pdf">Upload PDF</TabsTrigger>
              </TabsList>

              <TabsContent value="single">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="relative">
                    <Textarea
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      placeholder="Enter the previous year's question here..."
                      className="min-h-[150px] resize-none bg-white"
                    />
                    <span className="absolute bottom-2 right-2 text-sm text-muted-foreground">
                      {text.length} characters
                    </span>
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        Upload Question
                      </>
                    )}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="pdf">
                <div className="space-y-6">
                  <div className="grid w-full items-center gap-4">
                    <label className="text-sm font-medium leading-none">
                      Upload a PDF file containing questions:
                    </label>
                    <div className="flex items-center gap-4">
                      <input
                        type="file"
                        accept="application/pdf"
                        onChange={(e) => setPdfFile(e.target.files[0])}
                        className="hidden"
                        id="pdf-upload"
                      />
                      <label
                        htmlFor="pdf-upload"
                        className="flex h-10 px-4 py-2 items-center gap-2 rounded-md border border-input bg-white text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 cursor-pointer"
                      >
                        <File className="h-4 w-4" />
                        Choose PDF
                      </label>
                      {pdfFile && (
                        <span className="text-sm text-muted-foreground">
                          {pdfFile.name}
                        </span>
                      )}
                    </div>
                  </div>
                  <Button
                    onClick={handlePDFUpload}
                    disabled={!pdfFile || isProcessingPDF}
                    className="w-full"
                  >
                    {isProcessingPDF ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing PDF...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        Process PDF
                      </>
                    )}
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {detectedQuestions.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Detected Questions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {detectedQuestions.map((question, index) => (
                <div key={index} className="flex items-start gap-2">
                  <Textarea
                    value={question.text}
                    onChange={(e) => {
                      const updatedQuestions = [...detectedQuestions];
                      updatedQuestions[index].text = e.target.value;
                      setDetectedQuestions(updatedQuestions);
                    }}
                    className="flex-1 bg-white"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setDetectedQuestions(detectedQuestions.filter((_, i) => i !== index));
                    }}
                  >
                    <X className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
              <Button
                onClick={handleSubmitDetectedQuestions}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  'Upload Questions'
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {uploadResult && uploadResult.question && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Upload Result</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium">Question:</h4>
                <p className="text-sm text-muted-foreground bg-white p-3 rounded-md border">
                  {uploadResult.question.text}
                </p>
              </div>

              {uploadResult.question.topics?.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium">Detected Topics:</h4>
                  <div className="flex flex-wrap gap-2">
                    {uploadResult.question.topics.map((topic, index) => (
                      <Badge key={index} variant="secondary">
                        {topic}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {uploadResult.isPlagiarized && (
                <Alert variant="destructive">
                  <AlertDescription>
                    This question is similar to existing ones.
                    Score: {uploadResult.plagiarismScore}%
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        )}

        <div className="mt-8">
          <QuestionList />
        </div>

        {toast && (
          <Toast
            variant={toast.type === 'error' ? 'destructive' : undefined}
            className="fixed bottom-4 right-4"
          >
            <ToastDescription>{toast.message}</ToastDescription>
          </Toast>
        )}
        <ToastViewport />
      </div>
    </ToastProvider>
  );
};

export default UploadQuestion;