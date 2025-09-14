import { Link, useLocation } from 'react-router-dom';
import { Button } from 'primereact/button';
import { useAuth } from '../contexts/AuthContext';

const Header = () => {
  const location = useLocation();
  const { user, logout } = useAuth();

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-blue-600">Quizzy</h1>
            <nav className="flex space-x-2">
              <Link to="/create">
                <Button 
                  label="Create Quiz" 
                  icon="pi pi-plus" 
                  className={`p-button-text ${location.pathname === '/create' ? 'p-button-primary' : ''}`}
                />
              </Link>
              <Link to="/quizzes">
                <Button 
                  label="My Quizzes" 
                  icon="pi pi-list" 
                  className={`p-button-text ${location.pathname === '/quizzes' ? 'p-button-primary' : ''}`}
                />
              </Link>
            </nav>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="text-sm text-gray-600">
                Share your quiz with the share code!
              </div>
              <div className="flex items-center space-x-2">
                <img 
                  src={user?.picture} 
                  alt={user?.name} 
                  className="w-8 h-8 rounded-full"
                />
                <span className="text-sm font-medium text-gray-700">
                  {user?.name}
                </span>
                <Button
                  label="Logout"
                  icon="pi pi-sign-out"
                  className="p-button-text p-button-sm"
                  onClick={logout}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
