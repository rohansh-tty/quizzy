import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Tag } from 'primereact/tag';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Dropdown } from 'primereact/dropdown';
import { useRef } from 'react';
import axios from 'axios';

interface Question {
  id: string;
  text: string;
  question_type: string;
  options: string[];
  correct_answer: string;
  points: number;
  order: number;
}

interface Quiz {
  id: string;
  title: string;
  description: string;
  is_public: boolean;
  share_code: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  questions: Question[];
}

interface QuizAttempt {
  id: string;
  user_name: string;
  score: number;
  total_points: number;
  percentage: number;
  completed_at: string;
  time_taken: number; // in minutes
}

const QuizDetail = () => {
  const { quizId } = useParams<{ quizId: string }>();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [quizAttempts, setQuizAttempts] = useState<QuizAttempt[]>([]);
  const [showQuestionDialog, setShowQuestionDialog] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [questionForm, setQuestionForm] = useState({
    text: '',
    question_type: 'multiple_choice',
    options: ['', '', '', ''],
    correct_answer: '',
    points: 1,
    order: 0
  });
  const toast = useRef<Toast>(null);

  useEffect(() => {
    if (quizId) {
      fetchQuizDetails();
    }
  }, [quizId]);

  useEffect(() => {
    if (quiz) {
      fetchQuizAttempts();
    }
  }, [quiz]);

  const fetchQuizDetails = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/quizzes/${quizId}`);
      setQuiz(response.data);
    } catch (error) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to fetch quiz details',
        life: 3000
      });
      navigate('/quizzes');
    } finally {
      setLoading(false);
    }
  };

  const fetchQuizAttempts = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/quizzes/${quizId}/responses`);
      const data = response.data;
      
      // Transform API data to match our interface
      console.log('data: ',data);
      console.log('response: ',response);
      const transformedAttempts = data.user_responses 
      // console.log('quiz responses: ',quizId, data.user_responses.filter((userResponse: any) => userResponse.quiz_id === quizId));
      // const transformedAttempts: QuizAttempt[] = data.user_responses.filter((userResponse: any) => userResponse.quiz_id === quizId).map((userResponse: any, index: number) => ({
      //   id: (index + 1).toString(),
      //   user_name: userResponse.user_name,
      //   score: userResponse.points_earned,
      //   total_points: getTotalPoints(),
      //   percentage: (userResponse.points_earned / getTotalPoints()) * 100,
      //   completed_at: userResponse.submitted_at,
      //   time_taken: Math.floor(Math.random() * 20) + 5 // Mock time for now
      // }));
      
      setQuizAttempts(transformedAttempts);
    } catch (error) {
      console.error('Failed to fetch quiz attempts:', error);
      // Fallback to empty array if API fails
      setQuizAttempts([]);
    }
  };

  const copyShareCode = (shareCode: string) => {
    navigator.clipboard.writeText(shareCode);
    toast.current?.show({
      severity: 'success',
      summary: 'Copied!',
      detail: 'Share code copied to clipboard',
      life: 2000
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTotalPoints = () => {
    if (!quiz) return 0;
    console.log('quiz:', quiz.questions.map(q => q.points));
    return quiz.questions.reduce((sum, q) => sum + q.points, 0);
  };

  const getAverageScore = () => {
    if (quizAttempts.length === 0) return 0;
    const totalPercentage = quizAttempts.reduce((sum, attempt) => sum + attempt.percentage, 0);
    return Math.round(totalPercentage / quizAttempts.length);
  };

  const getAverageTime = () => {
    if (quizAttempts.length === 0) return 0;
    const totalTime = quizAttempts.reduce((sum, attempt) => sum + attempt.time_taken, 0);
    return Math.round(totalTime / quizAttempts.length);
  };

  const getScoreDistribution = () => {
    const distribution = {
      '90-100%': 0,
      '80-89%': 0,
      '70-79%': 0,
      '60-69%': 0,
      'Below 60%': 0
    };

    quizAttempts.forEach(attempt => {
      if (attempt.percentage >= 90) distribution['90-100%']++;
      else if (attempt.percentage >= 80) distribution['80-89%']++;
      else if (attempt.percentage >= 70) distribution['70-79%']++;
      else if (attempt.percentage >= 60) distribution['60-69%']++;
      else distribution['Below 60%']++;
    });

    return distribution;
  };

  const questionTypes = [
    { label: 'Multiple Choice', value: 'multiple_choice' },
    { label: 'True/False', value: 'true_false' },
    { label: 'Text', value: 'text' }
  ];

  const getGradeColor = (percentage: number) => {
    if (percentage >= 90) return 'success';
    if (percentage >= 80) return 'info';
    if (percentage >= 70) return 'warning';
    if (percentage >= 60) return 'secondary';
    return 'danger';
  };

  const openAddQuestionDialog = () => {
    setEditingQuestion(null);
    setQuestionForm({
      text: '',
      question_type: 'multiple_choice',
      options: ['', '', '', ''],
      correct_answer: '',
      points: 1,
      order: quiz ? quiz.questions.length + 1 : 1
    });
    setShowQuestionDialog(true);
  };

  const openEditQuestionDialog = (question: Question) => {
    setEditingQuestion(question);
    setQuestionForm({
      text: question.text,
      question_type: question.question_type,
      options: question.options || ['', '', '', ''],
      correct_answer: question.correct_answer,
      points: question.points,
      order: question.order
    });
    setShowQuestionDialog(true);
  };

  useEffect(() => {
    console.log('quiz attempts: ',quizAttempts);
  }, [quizAttempts]);


  const handleQuestionSubmit = async () => {
    if (!quiz || !questionForm.text.trim() || !questionForm.correct_answer.trim()) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Please fill in all required fields',
        life: 3000
      });
      return;
    }

    if (questionForm.question_type === 'multiple_choice' && 
        questionForm.options.some(opt => !opt.trim())) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Please fill in all options for multiple choice questions',
        life: 3000
      });
      return;
    }

    try {
      if (editingQuestion) {
        // Update existing question
        await axios.put(`http://localhost:5000/api/questions/${editingQuestion.id}`, {
          text: questionForm.text,
          question_type: questionForm.question_type,
          options: questionForm.question_type === 'multiple_choice' ? questionForm.options : [],
          correct_answer: questionForm.correct_answer,
          points: questionForm.points,
          order: questionForm.order
        });
        
        toast.current?.show({
          severity: 'success',
          summary: 'Success',
          detail: 'Question updated successfully!',
          life: 3000
        });
      } else {
        // Add new question
        await axios.post(`http://localhost:5000/api/quizzes/${quiz.id}/questions`, {
          text: questionForm.text,
          question_type: questionForm.question_type,
          options: questionForm.question_type === 'multiple_choice' ? questionForm.options : [],
          correct_answer: questionForm.correct_answer,
          points: questionForm.points,
          order: questionForm.order
        });
        
        toast.current?.show({
          severity: 'success',
          summary: 'Success',
          detail: 'Question added successfully!',
          life: 3000
        });
      }

      // Refresh quiz data
      fetchQuizDetails();
      setShowQuestionDialog(false);
      setEditingQuestion(null);
      
    } catch (error) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to save question. Please try again.',
        life: 3000
      });
    }
  };

  const deleteQuestion = async (questionId: string) => {
    if (!quiz) return;
    
    if (!window.confirm('Are you sure you want to delete this question? This action cannot be undone.')) {
      return;
    }
    
    try {
      await axios.delete(`http://localhost:5000/api/questions/${questionId}`);
      
      toast.current?.show({
        severity: 'success',
        summary: 'Success',
        detail: 'Question deleted successfully!',
        life: 3000
      });
      
      // Refresh quiz data
      fetchQuizDetails();
    } catch (error) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to delete question. Please try again.',
        life: 3000
      });
    }
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...questionForm.options];
    newOptions[index] = value;
    setQuestionForm({ ...questionForm, options: newOptions });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading quiz details...</p>
        </div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Quiz Not Found</h2>
        <p className="text-gray-600 mb-6">The quiz you're looking for doesn't exist.</p>
        <Button label="Back to Quizzes" icon="pi pi-arrow-left" onClick={() => navigate('/quizzes')} />
      </div>
    );
  }

  const totalPoints = getTotalPoints();
  const averageScore = getAverageScore();
  const averageTime = getAverageTime();
  const scoreDistribution = getScoreDistribution();
  return (
    <div className="max-w-7xl mx-auto">
      <Toast ref={toast} />
      
      {/* Quiz Header */}
      <Card className="shadow-lg mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div className="flex-1 mb-4 md:mb-0">
            <div className="flex items-center space-x-3 mb-2">
              <h1 className="text-3xl font-bold text-gray-800">{quiz.title}</h1>
              <Tag 
                value={quiz.is_public ? 'Public' : 'Private'} 
                severity={quiz.is_public ? 'success' : 'warning'}
              />
            </div>
            
            {quiz.description && (
              <p className="text-gray-600 mb-3">{quiz.description}</p>
            )}
            
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
              <span>Created: {formatDate(quiz.created_at)}</span>
              <span>Updated: {formatDate(quiz.updated_at)}</span>
              <span>Questions: {quiz.questions.length}</span>
              <span>Total Points: {totalPoints}</span>
              <span>Share Code: <code className="bg-gray-100 px-2 py-1 rounded">{quiz.share_code}</code></span>
            </div>
          </div>
          
          <div className="flex flex-col space-y-2 min-w-fit">
            <Button
              label="Copy Share URL"
              icon="pi pi-copy"
              onClick={() => copyShareCode(`http://localhost:3000/take/${quiz.share_code}`)}
              className="p-button-secondary"
            />
            <Button
              label="Back to Quizzes"
              icon="pi pi-arrow-left"
              onClick={() => navigate('/quizzes')}
              className="p-button-outlined"
            />
          </div>
        </div>
      </Card>

      {/* Statistics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="text-center">
          <div className="text-3xl font-bold text-blue-600 mb-2">{quizAttempts.length}</div>
          <div className="text-gray-600">Total Attempts</div>
        </Card>
        
        <Card className="text-center">
          <div className="text-3xl font-bold text-green-600 mb-2">{averageScore}%</div>
          <div className="text-gray-600">Average Score</div>
        </Card>
        
        <Card className="text-center">
          <div className="text-3xl font-bold text-purple-600 mb-2">{averageTime} min</div>
          <div className="text-gray-600">Average Time</div>
        </Card>
        
        <Card className="text-center">
          <div className="text-3xl font-bold text-orange-600 mb-2">{totalPoints}</div>
          <div className="text-gray-600">Total Points</div>
        </Card>
      </div>

      {/* Score Distribution */}
      <Card className="shadow-lg mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Score Distribution</h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {Object.entries(scoreDistribution).map(([range, count]) => (
            <div key={range} className="text-center">
              <div className="text-2xl font-bold text-gray-800 mb-1">{count}</div>
              <div className="text-sm text-gray-600">{range}</div>
            </div>
          ))}
        </div>
      </Card>

      {/* Questions Overview */}
      <Card className="shadow-lg mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Questions Overview</h2>
          <Button
            label="Add Question"
            icon="pi pi-plus"
            onClick={openAddQuestionDialog}
            severity="success"
          />
        </div>
        <div className="space-y-3">
          {quiz.questions.map((question, index) => (
            <div key={question.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-medium text-gray-500">Q{index + 1}</span>
                  <span className="font-medium text-gray-800">{question.text}</span>
                </div>
                <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                  <span>Type: {question.question_type}</span>
                  <span>Points: {question.points}</span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Tag 
                  value={question.question_type} 
                  severity="info"
                />
                <Button
                  icon="pi pi-pencil"
                  className="p-button-text p-button-sm"
                  onClick={() => openEditQuestionDialog(question)}
                  tooltip="Edit Question"
                />
                <Button
                  icon="pi pi-trash"
                  className="p-button-danger p-button-text p-button-sm"
                  onClick={() => deleteQuestion(question.id)}
                  tooltip="Delete Question"
                />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Quiz Attempts Table */}
      <Card className="shadow-lg">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Attempts</h2>
        
        {quizAttempts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <i className="pi pi-users text-4xl mb-2 block"></i>
            <p>No attempts yet. Share your quiz to see results!</p>
          </div>
        ) : (
          <DataTable
            value={quizAttempts}
            paginator
            rows={10}
            className="bg-white rounded-lg"
            emptyMessage="No attempts found"
          >
            <Column field="user_name" header="User" sortable />
            <Column 
              field="score" 
              header="Score" 
              sortable 
              body={(rowData) => `${rowData.score}/${rowData.total_points}`}
            />
            <Column 
              field="percentage" 
              header="Percentage" 
              sortable 
              body={(rowData) => (
                <Tag 
                  value={`${rowData.percentage}%`} 
                  severity={getGradeColor(rowData.percentage)}
                />
              )}
            />
            <Column 
              field="time_taken" 
              header="Time Taken" 
              sortable 
              body={(rowData) => `${rowData.time_taken} min`}
            />
            <Column 
              field="completed_at" 
              header="Completed" 
              sortable 
              body={(rowData) => formatDate(rowData.completed_at)}
            />
          </DataTable>
        )}
      </Card>

      {/* Question Add/Edit Dialog */}
      <Dialog
        visible={showQuestionDialog}
        onHide={() => setShowQuestionDialog(false)}
        header={editingQuestion ? 'Edit Question' : 'Add New Question'}
        footer={
          <div className="flex justify-end space-x-2">
            <Button
              label="Cancel"
              icon="pi pi-times"
              onClick={() => setShowQuestionDialog(false)}
              className="p-button-outlined"
            />
            <Button
              label={editingQuestion ? 'Update Question' : 'Add Question'}
              icon="pi pi-check"
              onClick={handleQuestionSubmit}
              severity="success"
            />
          </div>
        }
        className="w-full max-w-2xl"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Question Text *
            </label>
            <InputTextarea
              value={questionForm.text}
              onChange={(e) => setQuestionForm({ ...questionForm, text: e.target.value })}
              placeholder="Enter your question"
              rows={3}
              className="w-full"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Question Type
              </label>
              <Dropdown
                value={questionForm.question_type}
                options={questionTypes}
                onChange={(e) => setQuestionForm({ ...questionForm, question_type: e.value })}
                placeholder="Select question type"
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Points
              </label>
              <InputText
                type="number"
                value={questionForm.points.toString()}
                onChange={(e) => setQuestionForm({ ...questionForm, points: parseInt(e.target.value) || 1 })}
                min="1"
                max="10"
                className="w-full"
              />
            </div>
          </div>

          {questionForm.question_type === 'multiple_choice' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Options *
              </label>
              <div className="grid grid-cols-2 gap-2">
                {questionForm.options.map((option, index) => (
                  <InputText
                    key={index}
                    value={option}
                    onChange={(e) => updateOption(index, e.target.value)}
                    placeholder={`Option ${index + 1}`}
                    className="w-full"
                  />
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Correct Answer *
            </label>
            <InputText
              value={questionForm.correct_answer}
              onChange={(e) => setQuestionForm({ ...questionForm, correct_answer: e.target.value })}
              placeholder="Enter correct answer"
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Question Order
            </label>
            <InputText
              type="number"
              value={questionForm.order.toString()}
              onChange={(e) => setQuestionForm({ ...questionForm, order: parseInt(e.target.value) || 1 })}
              min="1"
              className="w-full"
            />
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default QuizDetail; 