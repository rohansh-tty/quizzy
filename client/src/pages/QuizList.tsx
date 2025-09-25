import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { DataView } from 'primereact/dataview';
import { Tag } from 'primereact/tag';
import { Toast } from 'primereact/toast';
import { useRef } from 'react';
import axios from 'axios';
import { API_URL } from '../apis';
import { useAuth } from '../contexts/AuthContext';
interface Question {
  id: string;
  text: string;
  question_type: string;
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
  questions: Question[];
}

const QuizList = () => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const toast = useRef<Toast>(null);
  const { user } = useAuth();
  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      // For demo purposes, using a mock user ID
      // const mockUserId = 'a5140530-3ed6-4b97-ae3b-75c61744c7ad';
      const response = await axios.get(`${API_URL}/api/quizzes`, {
        params: {
          user_id: user?.id
        }
      });
      console.log(response.data);
      setQuizzes(response.data);
    } catch (error) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to fetch quizzes',
        life: 3000
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteQuiz = async (quizId: string) => {
    try {
      await axios.delete(`${API_URL}/api/quizzes/${quizId}`);
      setQuizzes(quizzes.filter(q => q.id !== quizId));
      toast.current?.show({
        severity: 'success',
        summary: 'Success',
        detail: 'Quiz deleted successfully',
        life: 3000
      });
    } catch (error) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to delete quiz',
        life: 3000
      });
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

  const getTotalPoints = (questions: Question[]) => {
    return questions?.reduce((sum, q) => sum + (q.points || 0), 0) || 0;
  };

  const itemTemplate = (quiz: Quiz) => {
    const totalPoints = getTotalPoints(quiz?.questions || []);
    const shareUrl = `${API_URL}/take/${quiz.share_code}`;

    return (
      <Card className="mb-4 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div className="flex-1 mb-4 md:mb-0">
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-xl font-semibold text-gray-800">{quiz.title}</h3>
              <div className="flex items-center space-x-2">
                <Tag 
                  value={quiz.is_public ? 'Public' : 'Private'} 
                  severity={quiz.is_public ? 'success' : 'warning'}
                />
                <span className="text-sm text-gray-500">
                  {quiz?.questions?.length} questions
                </span>
              </div>
            </div>
            
            {quiz.description && (
              <p className="text-gray-600 mb-3">{quiz.description}</p>
            )}
            
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
              <span>Created: {formatDate(quiz.created_at)}</span>
              <span>Total Points: {totalPoints}</span>
              <span>Share Code: <code className="bg-gray-100 px-2 py-1 rounded">{quiz.share_code}</code></span>
            </div>
          </div>
          
          <div className="flex flex-col space-y-2 min-w-fit">
            <Button
              label="View Details"
              icon="pi pi-eye"
              onClick={() => navigate(`/quiz/${quiz.id}`)}
              className="p-button-outlined"
            />
            <Button
              label="Copy Share URL"
              icon="pi pi-copy"
              onClick={() => copyShareCode(shareUrl)}
              className="p-button-secondary p-button-outlined"
            />
            <Button
              label="Delete"
              icon="pi pi-trash"
              onClick={() => deleteQuiz(quiz.id)}
              className="p-button-danger p-button-outlined"
            />
          </div>
        </div>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your quizzes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <Toast ref={toast} />
      
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">My Quizzes</h1>
        <p className="text-gray-600">Manage and view all your created quizzes</p>
      </div>

      {quizzes.length === 0 ? (
        <Card className="text-center py-12">
          <div className="text-gray-500 mb-6">
            <i className="pi pi-inbox text-6xl mb-4 block"></i>
            <h3 className="text-xl font-semibold mb-2">No quizzes yet</h3>
            <p>Create your first quiz to get started!</p>
          </div>
          <Button
            label="Create Your First Quiz"
            icon="pi pi-plus"
            onClick={() => navigate('/create')}
            severity="success"
          />
        </Card>
      ) : (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800">
              Total Quizzes: {quizzes.length}
            </h2>
            <Button
              label="Create New Quiz"
              icon="pi pi-plus"
              onClick={() => navigate('/create')}
              severity="success"
            />
          </div>
          
          <DataView
            value={quizzes}
            itemTemplate={itemTemplate}
            paginator
            rows={5}
            className="bg-white rounded-lg shadow-sm"
          />
        </div>
      )}
    </div>
  );
};

export default QuizList; 