import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { CalendarDays, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const QuestionList = () => {
  const [questions, setQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const questionsPerPage = 10;

  const fetchQuestions = async (page) => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_DOMAIN}/api/v1/questions/uploaded-questions?page=${page}&limit=${questionsPerPage}`
      );
      setQuestions(response.data.questions);
      setTotalPages(Math.ceil(response.data.total / questionsPerPage));
      setError(null);
    } catch (err) {
      setError('Failed to load questions. Please try again later.');
      console.error('Error fetching questions:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions(currentPage);
  }, [currentPage]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const LoadingSkeleton = () => (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <Card key={i}>
          <CardContent className="p-4">
            <div className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <div className="flex gap-2">
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Uploaded Questions</CardTitle>
        </CardHeader>
        <CardContent>
          <LoadingSkeleton />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  const PaginationSection = () => {
    // Calculate the range of pages to show
    const getPageRange = () => {
      const range = [];
      const maxPagesToShow = 5;
      
      let start = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
      let end = Math.min(totalPages, start + maxPagesToShow - 1);
      
      if (end - start + 1 < maxPagesToShow) {
        start = Math.max(1, end - maxPagesToShow + 1);
      }
      
      for (let i = start; i <= end; i++) {
        range.push(i);
      }
      
      return range;
    };

    return (
      <div className="flex items-center justify-center space-x-2">
        <Button
          variant="outline"
          size="icon"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        {getPageRange().map((pageNum) => (
          <Button
            key={pageNum}
            variant={currentPage === pageNum ? "default" : "outline"}
            size="sm"
            onClick={() => handlePageChange(pageNum)}
          >
            {pageNum}
          </Button>
        ))}
        
        <Button
          variant="outline"
          size="icon"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Uploaded Questions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {questions.map((question, index) => (
            <Card key={question.id || index}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1 space-y-3">
                    <p className="text-sm text-card-foreground leading-relaxed">
                      {question.text}
                    </p>
                    
                    {question.topics && question.topics.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {question.topics.map((topic, topicIndex) => (
                          <Badge 
                            key={topicIndex}
                            variant="secondary"
                            className="hover:bg-secondary/80 transition-colors"
                          >
                            {topic}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center text-sm text-muted-foreground whitespace-nowrap">
                    <CalendarDays className="h-4 w-4 mr-1" />
                    {new Date(question.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {totalPages > 1 && (
          <div className="mt-6">
            <PaginationSection />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default QuestionList;