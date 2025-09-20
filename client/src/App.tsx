import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { PrimeReactProvider } from 'primereact/api';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import { lazy, Suspense } from 'react';

// Lazy load components
const Header = lazy(() => import('./components/Header'));
const Auth = lazy(() => import('./pages/Auth'));
const CreateQuiz = lazy(() => import('./pages/CreateQuiz'));
const TakeQuiz = lazy(() => import('./pages/TakeQuiz'));
const QuizList = lazy(() => import('./pages/QuizList'));
const QuizDetail = lazy(() => import('./pages/QuizDetail'));

const PageLoader = () => {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
    </div>
  );
};

function App() {
  return (
    <PrimeReactProvider>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <Suspense fallback={<PageLoader />}>
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
            </Suspense>
          </div>
        </Router>
      </AuthProvider>
    </PrimeReactProvider>
  );
}

export default App;
