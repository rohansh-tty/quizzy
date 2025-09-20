import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { RadioButton } from 'primereact/radiobutton';
import { InputText } from 'primereact/inputtext';
import { Dialog } from 'primereact/dialog';
import { Toast } from 'primereact/toast';
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
  questions: Question[];
}

interface Answer {
  questionId: string;
  answer: string;
}

interface UserInfo {
  name: string;
  email: string;
  phone: string;
}

const TakeQuiz = () => {
  const { shareCode } = useParams<{ shareCode: string }>();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [showUserInfoModal, setShowUserInfoModal] = useState(false);
  const [userInfo, setUserInfo] = useState<UserInfo>({
    name: '',
    email: '',
    phone: ''
  });
  const [userInfoSubmitted, setUserInfoSubmitted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  // const [quizCompleted, setQuizCompleted] = useState(false);
  const [score, setScore] = useState(0);
  const [totalPoints, setTotalPoints] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const toast = useRef<Toast>(null);

  useEffect(() => {
    if (shareCode) {
      fetchQuiz(shareCode);
    }
  }, [shareCode]);

  const fetchQuiz = async (code: string) => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:5000/api/quizzes/share/${code}`);
      const quizData = response.data;
      setQuiz(quizData);
      setTotalPoints(quizData.questions.reduce((sum: number, q: Question) => sum + q.points, 0));
      
      // Initialize answers array
      const initialAnswers = quizData.questions.map((q: Question) => ({
        questionId: q.id,
        answer: ''
      }));
      setAnswers(initialAnswers);
      
      // Show user info modal after quiz loads
      setShowUserInfoModal(true);
    } catch (error) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Quiz not found or no longer available',
        life: 3000
      });
      setTimeout(() => navigate('/create'), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers(prev => 
      prev.map(a => 
        a.questionId === questionId ? { ...a, answer } : a
      )
    );
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < (quiz?.questions.length || 0) - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const previousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const submitQuiz = async () => {
    if (!quiz) return;

    let correctAnswers = 0;
    let earnedPoints = 0;

    quiz.questions.forEach((question, index) => {
      const userAnswer = answers[index]?.answer;
      if (userAnswer === question.correct_answer) {
        correctAnswers++;
        earnedPoints += question.points;
      }
    });

    // Prepare responses data for backend
    const responsesData = quiz.questions.map((question, index) => ({
      question_id: question.id,
      answer: answers[index]?.answer || ''
    }));

    try {
      // Submit responses to backend
      const response = await axios.post('http://localhost:5000/api/quiz-responses', {
        quiz_id: quiz.id,
        user_name: userInfo.name,
        user_email: userInfo.email,
        user_phone: userInfo.phone,
        responses: responsesData
      });

      console.log('Quiz responses submitted:', response.data);
      
      toast.current?.show({
        severity: 'success',
        summary: 'Success',
        detail: 'Your quiz responses have been saved!',
        life: 3000
      });
    } catch (error) {
      console.error('Failed to submit quiz responses:', error);
      toast.current?.show({
        severity: 'warn',
        summary: 'Warning',
        detail: 'Quiz completed but responses could not be saved.',
        life: 3000
      });
    }

    setScore(earnedPoints);
    // setQuizCompleted(true);
    setShowResults(true);
  };

  const restartQuiz = () => {
    setCurrentQuestionIndex(0);
    setAnswers(quiz?.questions.map(q => ({ questionId: q.id, answer: '' })) || []);
    // setQuizCompleted(false);
    setScore(0);
    setShowResults(false);
  };

  const getCurrentQuestion = () => {
    if (!quiz || !quiz.questions[currentQuestionIndex]) return null;
    return quiz.questions[currentQuestionIndex];
  };

  const getProgressPercentage = () => {
    if (!quiz) return 0;
    return ((currentQuestionIndex + 1) / quiz.questions.length) * 100;
  };

  const getAnsweredCount = () => {
    return answers.filter(a => a.answer.trim() !== '').length;
  };

  const handleUserInfoSubmit = () => {
    if (!userInfo.name.trim() || !userInfo.email.trim()) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Please provide at least your name and email',
        life: 3000
      });
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userInfo.email)) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Please enter a valid email address',
        life: 3000
      });
      return;
    }

    setUserInfoSubmitted(true);
    setShowUserInfoModal(false);
    
    toast.current?.show({
      severity: 'success',
      summary: 'Welcome!',
      detail: `Hello ${userInfo.name}! You can now start the quiz.`,
      life: 3000
    });
  };

  const handleUserInfoChange = (field: keyof UserInfo, value: string) => {
    setUserInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // User Info Modal
  if (showUserInfoModal && quiz) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Toast ref={toast} />
        
        <Dialog
          visible={showUserInfoModal}
          onHide={() => {}} // Prevent closing by clicking outside
          header="Welcome to the Quiz!"
          footer={
            <div className="flex justify-end space-x-2">
              <Button
                label="Start Quiz"
                icon="pi pi-play"
                onClick={handleUserInfoSubmit}
                severity="success"
                disabled={!userInfo.name.trim() || !userInfo.email.trim()}
              />
            </div>
          }
          className="w-full max-w-md"
          closable={false}
          draggable={false}
        >
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">{quiz.title}</h2>
              {quiz.description && (
                <p className="text-gray-600">{quiz.description}</p>
              )}
              <p className="text-sm text-gray-500 mt-2">
                Please provide your information to start the quiz
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name *
              </label>
              <InputText
                value={userInfo.name}
                onChange={(e) => handleUserInfoChange('name', e.target.value)}
                placeholder="Enter your full name"
                className="w-full"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <InputText
                value={userInfo.email}
                onChange={(e) => handleUserInfoChange('email', e.target.value)}
                placeholder="Enter your email"
                className="w-full"
                type="email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number (Optional)
              </label>
              <InputText
                value={userInfo.phone}
                onChange={(e) => handleUserInfoChange('phone', e.target.value)}
                placeholder="Enter your phone number"
                className="w-full"
                type="tel"
              />
            </div>

            <div className="text-xs text-gray-500 text-center">
              * Required fields. Your information will only be used for quiz results.
            </div>
          </div>
        </Dialog>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Quiz Not Found</h2>
        <p className="text-gray-600 mb-6">The quiz you're looking for doesn't exist or is no longer available.</p>
        <Button label="Create Your Own Quiz" icon="pi pi-plus" onClick={() => navigate('/create')} />
      </div>
    );
  }

  if (showResults) {
    const percentage = Math.round((score / totalPoints) * 100);
    let grade = '';
    let gradeColor = '';

    if (percentage >= 90) {
      grade = 'A+';
      gradeColor = 'text-green-600';
    } else if (percentage >= 80) {
      grade = 'A';
      gradeColor = 'text-green-600';
    } else if (percentage >= 70) {
      grade = 'B';
      gradeColor = 'text-blue-600';
    } else if (percentage >= 60) {
      grade = 'C';
      gradeColor = 'text-yellow-600';
    } else if (percentage >= 50) {
      grade = 'D';
      gradeColor = 'text-orange-600';
    } else {
      grade = 'F';
      gradeColor = 'text-red-600';
    }

    return (
      <div className="max-w-2xl mx-auto">
        <Toast ref={toast} />
        
        <Card className="shadow-lg text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">Quiz Results</h1>
          
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-700 mb-2">{quiz.title}</h2>
            <p className="text-gray-600">{quiz.description}</p>
            {userInfoSubmitted && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-700">
                  <i className="pi pi-user mr-2"></i>
                  Completed by: <span className="font-semibold">{userInfo.name}</span>
                  {userInfo.email && (
                    <span className="block text-xs mt-1">Email: {userInfo.email}</span>
                  )}
                </p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{score}</div>
              <div className="text-sm text-blue-600">Points Earned</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{totalPoints}</div>
              <div className="text-sm text-green-600">Total Points</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className={`text-2xl font-bold ${gradeColor}`}>{grade}</div>
              <div className="text-sm text-gray-600">Grade</div>
            </div>
          </div>

          <div className="mb-8">
            <div className="text-4xl font-bold text-gray-800 mb-2">{percentage}%</div>
            <div className="text-gray-600">Overall Score</div>
          </div>

          <div className="space-y-3">
            <Button
              label="Take Quiz Again"
              icon="pi pi-refresh"
              onClick={restartQuiz}
              className="w-full"
            />
            <Button
              label="Create Your Own Quiz"
              icon="pi pi-plus"
              onClick={() => navigate('/create')}
              className="w-full p-button-outlined"
            />
          </div>
        </Card>
      </div>
    );
  }

  const currentQuestion = getCurrentQuestion();
  if (!currentQuestion) return null;

  return (
    <div className="max-w-4xl mx-auto">
      <Toast ref={toast} />
      
      {/* Quiz Header */}
      <Card className="shadow-lg mb-6">
        <div className="text-center mb-4">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">{quiz.title}</h1>
          <p className="text-gray-600">{quiz.description}</p>
          {userInfoSubmitted && (
            <div className="mt-3 p-3 bg-blue-50 rounded-lg inline-block">
              <p className="text-sm text-blue-700">
                <i className="pi pi-user mr-2"></i>
                Welcome, <span className="font-semibold">{userInfo.name}</span>!
              </p>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Question {currentQuestionIndex + 1} of {quiz.questions.length}</span>
            <span>{getAnsweredCount()} of {quiz.questions.length} answered</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${getProgressPercentage()}%` }}
            ></div>
          </div>
        </div>
      </Card>

      {/* Question Card */}
      <Card className="shadow-lg">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-gray-500">
              Question {currentQuestionIndex + 1} of {quiz.questions.length}
            </span>
            <span className="text-sm font-medium text-blue-600">
              {currentQuestion.points} point{currentQuestion.points !== 1 ? 's' : ''}
            </span>
          </div>
          
          <h2 className="text-xl font-semibold text-gray-800 mb-6">
            {currentQuestion.text}
          </h2>

          {/* Answer Options */}
          {currentQuestion.question_type === 'multiple_choice' && (
            <div className="space-y-3">
              {currentQuestion.options.map((option, index) => (
                <div key={index} className="flex items-center">
                  <RadioButton
                    inputId={`option-${index}`}
                    name={`question-${currentQuestion.id}`}
                    value={option}
                    onChange={(e) => handleAnswerChange(currentQuestion.id, e.value)}
                    checked={answers.find(a => a.questionId === currentQuestion.id)?.answer === option}
                  />
                  <label htmlFor={`option-${index}`} className="ml-3 text-gray-700 cursor-pointer">
                    {option}
                  </label>
                </div>
              ))}
            </div>
          )}

          {currentQuestion.question_type === 'true_false' && (
            <div className="space-y-3">
              {['true', 'false'].map((option) => (
                <div key={option} className="flex items-center">
                  <RadioButton
                    inputId={`option-${option}`}
                    name={`question-${currentQuestion.id}`}
                    value={option}
                    onChange={(e) => handleAnswerChange(currentQuestion.id, e.value)}
                    checked={answers.find(a => a.questionId === currentQuestion.id)?.answer === option}
                  />
                  <label htmlFor={`option-${option}`} className="ml-3 text-gray-700 cursor-pointer capitalize">
                    {option}
                  </label>
                </div>
              ))}
            </div>
          )}

          {currentQuestion.question_type === 'text' && (
            <div>
              <InputText
                value={answers.find(a => a.questionId === currentQuestion.id)?.answer || ''}
                onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                placeholder="Type your answer here..."
                className="w-full"
              />
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <Button
            label="Previous"
            icon="pi pi-chevron-left"
            onClick={previousQuestion}
            disabled={currentQuestionIndex === 0}
            className="p-button-outlined"
          />

          {currentQuestionIndex === quiz.questions.length - 1 ? (
            <Button
              label="Submit Quiz"
              icon="pi pi-check"
              onClick={submitQuiz}
              severity="success"
              disabled={getAnsweredCount() < quiz.questions.length}
            />
          ) : (
            <Button
              label="Next"
              icon="pi pi-chevron-right"
              iconPos="right"
              onClick={nextQuestion}
              disabled={!answers.find(a => a.questionId === currentQuestion.id)?.answer}
            />
          )}
        </div>
      </Card>

      {/* Question Navigation */}
      <Card className="shadow-lg mt-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Question Navigation</h3>
        <div className="grid grid-cols-5 gap-2">
          {quiz.questions.map((_, index) => (
            <Button
              key={index}
              label={String(index + 1)}
              onClick={() => setCurrentQuestionIndex(index)}
              className={`p-button-sm ${
                index === currentQuestionIndex
                  ? 'p-button-primary'
                  : answers[index]?.answer
                  ? 'p-button-success'
                  : 'p-button-outlined'
              }`}
            />
          ))}
        </div>
      </Card>
    </div>
  );
};

export default TakeQuiz; 