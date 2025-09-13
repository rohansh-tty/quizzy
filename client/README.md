# Quizzy React Client

A modern React application for creating and taking quizzes, built with React 18, TypeScript, Tailwind CSS, and PrimeReact.

## Features

### 🎯 **CreateQuiz Page** (`/create`)
- **Quiz Creation**: Build quizzes with title, description, and public/private settings
- **Question Builder**: Add multiple choice, true/false, and text questions
- **Dynamic Options**: Configure 4 options for multiple choice questions
- **Points System**: Assign points to each question (1-10)
- **Real-time Preview**: See all questions before saving
- **Share Code Display**: Get unique share code after creation
- **Auto-redirect**: Automatically goes to quiz list after creation

### 📋 **QuizList Page** (`/quizzes`)
- **Quiz Management**: View all your created quizzes
- **Quick Actions**: View details, copy share URLs, delete quizzes
- **Statistics**: See question count, total points, creation date
- **Search & Pagination**: Easy navigation through multiple quizzes
- **Empty State**: Helpful guidance when no quizzes exist

### 📊 **QuizDetail Page** (`/quiz/:quizId`)
- **Comprehensive Stats**: Total attempts, average score, average time
- **Score Distribution**: Visual breakdown of performance ranges
- **Questions Overview**: Detailed view of all questions and types
- **User Attempts Table**: Sortable table of quiz takers and results
- **Share Management**: Easy copying of share codes and URLs

### 🎮 **TakeQuiz Page** (`/take/:shareCode`)
- **Quiz Taking Interface**: Clean, intuitive question display
- **Progress Tracking**: Visual progress bar and question counter
- **Navigation**: Previous/Next buttons with validation
- **Question Types**: Support for all question types
- **Results Page**: Score calculation, grading, and statistics
- **Question Navigation**: Jump to any question with status indicators

## Technology Stack

- **React 18** with TypeScript
- **Vite** for fast development
- **Tailwind CSS** for styling
- **PrimeReact** for UI components
- **React Router** for navigation
- **Axios** for API calls

## Getting Started

### Prerequisites
- Node.js 16+ and npm
- Backend server running on `http://localhost:5000`

### Installation
```bash
cd client
npm install
```

### Development
```bash
npm run dev
```

The app will be available at `http://localhost:3000`

### Build for Production
```bash
npm run build
```

## Navigation Structure

```
/ (root) → /create (Create Quiz)
├── /create → Create and configure quizzes
├── /quizzes → View all your quizzes
├── /quiz/:quizId → Detailed quiz statistics
└── /take/:shareCode → Take a quiz (public)
```

## API Integration

The app connects to your Flask backend API:
- **Base URL**: `http://localhost:5000`
- **Endpoints**: All CRUD operations for quizzes, questions, and users
- **Authentication**: Currently uses mock user ID for demo purposes

## Key Components

- **Header**: Navigation between main sections
- **CreateQuiz**: Full quiz creation workflow
- **QuizList**: Quiz management and overview
- **QuizDetail**: Analytics and statistics
- **TakeQuiz**: Complete quiz-taking experience
- **Toast Notifications**: User feedback throughout the app

## User Experience Flow

1. **Creator Journey**:
   - Create quiz → Add questions → Get share code → View analytics
   
2. **User Journey**:
   - Receive share code → Take quiz → Get results → Option to retake

## Responsive Design

- **Mobile-first** approach
- **Tailwind CSS** for responsive layouts
- **PrimeReact components** with mobile optimization
- **Touch-friendly** interface elements

## Future Enhancements

- User authentication and profiles
- Real-time quiz results
- Advanced analytics and charts
- Quiz templates and categories
- Social sharing features
- Performance tracking over time
