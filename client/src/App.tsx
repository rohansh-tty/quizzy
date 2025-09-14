import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { PrimeReactProvider } from 'primereact/api';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import CreateQuiz from './pages/CreateQuiz';
import TakeQuiz from './pages/TakeQuiz';
import QuizList from './pages/QuizList';
import QuizDetail from './pages/QuizDetail';
import Auth from './pages/Auth';
import Header from './components/Header';

function App() {
  return (
    <PrimeReactProvider>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route path="/" element={
                <ProtectedRoute>
                  <Header />
                  <main className="container mx-auto px-4 py-8">
                    <Navigate to="/create" replace />
                  </main>
                </ProtectedRoute>
              } />
              <Route path="/create" element={
                <ProtectedRoute>
                  <Header />
                  <main className="container mx-auto px-4 py-8">
                    <CreateQuiz />
                  </main>
                </ProtectedRoute>
              } />
              <Route path="/quizzes" element={
                <ProtectedRoute>
                  <Header />
                  <main className="container mx-auto px-4 py-8">
                    <QuizList />
                  </main>
                </ProtectedRoute>
              } />
              <Route path="/quiz/:quizId" element={
                <ProtectedRoute>
                  <Header />
                  <main className="container mx-auto px-4 py-8">
                    <QuizDetail />
                  </main>
                </ProtectedRoute>
              } />
              <Route path="/take/:shareCode" element={
                <div>
                  <main className="container mx-auto px-4 py-8">
                    <TakeQuiz />
                  </main>
                </div>
              } />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </PrimeReactProvider>
  );
}

export default App;
