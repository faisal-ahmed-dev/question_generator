import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, AlertCircle, CheckCircle2, AlertTriangle } from "lucide-react";

const PlagiarismChecker = () => {
  const [question, setQuestion] = useState('');
  const [plagiarismScore, setPlagiarismScore] = useState(null);
  const [mostSimilarQuestion, setMostSimilarQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type });
    }, 3000);
  };

  const handleCheckPlagiarism = async () => {
    if (!question.trim()) {
      showNotification("Please enter a question to check.", "error");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_DOMAIN}/api/v1/questions/check-plagiarism`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ text: question })
        }
      );

      const data = await response.json();

      if (data.message) {
        setPlagiarismScore(data.plagiarismScore);
        setMostSimilarQuestion(data.mostSimilarQuestion);
        showNotification("Plagiarism check completed successfully.", "success");
      }
    } catch (err) {
      console.error(err);
      showNotification("Failed to check plagiarism. Please try again.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const getPlagiarismSeverity = (score) => {
    if (score < 30) return { color: "success", icon: CheckCircle2, text: "Low" };
    if (score < 70) return { color: "warning", icon: AlertTriangle, text: "Moderate" };
    return { color: "destructive", icon: AlertCircle, text: "High" };
  };

  return (
    <div className="container max-w-4xl mx-auto p-4 space-y-6">
      {/* Notification */}
      {notification.show && (
        <div
          className={`fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg text-white ${
            notification.type === 'success' ? 'bg-green-500' :
            notification.type === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
          }`}
        >
          {notification.message}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Plagiarism Checker</CardTitle>
          <CardDescription>
            Check your question for potential similarities with existing content
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Enter your question here..."
            className="min-h-[150px] resize-none"
          />
          <Button 
            onClick={handleCheckPlagiarism} 
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Checking...
              </>
            ) : (
              'Check Plagiarism'
            )}
          </Button>
        </CardContent>
      </Card>

      {plagiarismScore !== null && (
        <Card>
          <CardHeader>
            <CardTitle>Plagiarism Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  Similarity Score
                </span>
                <span className="text-sm font-medium">
                  {plagiarismScore}%
                </span>
              </div>
              <Progress value={plagiarismScore} />
            </div>

            <Alert variant={getPlagiarismSeverity(plagiarismScore).color}>
              {React.createElement(getPlagiarismSeverity(plagiarismScore).icon, {
                className: "h-4 w-4"
              })}
              <AlertTitle>
                {getPlagiarismSeverity(plagiarismScore).text} Similarity Detected
              </AlertTitle>
              <AlertDescription>
                The content shows a {plagiarismScore}% similarity with existing questions.
              </AlertDescription>
            </Alert>

            {mostSimilarQuestion && (
              <div className="space-y-2">
                <h4 className="font-medium">Most Similar Question Found:</h4>
                <p className="text-sm text-muted-foreground">
                  {mostSimilarQuestion}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PlagiarismChecker;
