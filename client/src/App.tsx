import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { PrimeReactProvider } from 'primereact/api';
import CreateQuiz from './pages/CreateQuiz';
import TakeQuiz from './pages/TakeQuiz';
import QuizList from './pages/QuizList';
import QuizDetail from './pages/QuizDetail';
import Header from './components/Header';

function App() {
  return (
    <PrimeReactProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Header />
          <main className="container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<Navigate to="/create" replace />} />
              <Route path="/create" element={<CreateQuiz />} />
              <Route path="/quizzes" element={<QuizList />} />
              <Route path="/quiz/:quizId" element={<QuizDetail />} />
              <Route path="/take/:shareCode" element={<TakeQuiz />} />
            </Routes>
          </main>
        </div>
      </Router>
    </PrimeReactProvider>
  );
}

export default App;
