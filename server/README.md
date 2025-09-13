# Quizzy - Quiz App API

A simple, shareable quiz application built with Flask and SQLAlchemy.

## Features

- **User Management**: Create, read, update, and delete users
- **Quiz Management**: Create, read, update, and delete quizzes
- **Question Management**: Add, edit, and remove questions from quizzes
- **Shareable Quizzes**: Each quiz gets a unique share code for easy sharing
- **Multiple Question Types**: Support for multiple choice, true/false, and text questions

## Setup

1. **Activate the virtual environment**:
   ```bash
   source env/bin/activate
   ```

2. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Run the application**:
   ```bash
   python app.py
   ```

The server will start on `http://localhost:5000`

## Flask CLI Commands

The app includes several CLI commands for easy data management:

### Create Dummy Data
```bash
# Create default dummy data (3 users, 5 quizzes, 4 questions each)
flask create-dummy-data

# Customize the amount of dummy data
flask create-dummy-data --users 5 --quizzes 10 --questions-per-quiz 6
```

### List All Data
```bash
# View all users, quizzes, and questions in the database
flask list-data
```

### Clear All Data
```bash
# Remove all data and recreate empty tables
flask clear-data
```

### View Quiz Responses
```bash
# View summary of all quiz responses
flask view-responses

# View detailed responses for a specific quiz
flask view-responses --quiz-id <quiz_id>
```

**Note**: Make sure to activate your virtual environment before running Flask CLI commands:
```bash
source env/bin/activate
```

## API Endpoints

### Users

#### Create User
```http
POST /api/users
Content-Type: application/json

{
  "username": "john_doe",
  "email": "john@example.com"
}
```

#### Get User
```http
GET /api/users/{user_id}
```

#### Update User
```http
PUT /api/users/{user_id}
Content-Type: application/json

{
  "username": "new_username",
  "email": "newemail@example.com"
}
```

#### Delete User
```http
DELETE /api/users/{user_id}
```

### Quizzes

#### Create Quiz
```http
POST /api/quizzes
Content-Type: application/json

{
  "title": "General Knowledge Quiz",
  "description": "Test your general knowledge",
  "is_public": true,
  "user_id": "user-uuid-here"
}
```

#### Get Quizzes
```http
GET /api/quizzes                    # Get all public quizzes
GET /api/quizzes?user_id={user_id} # Get quizzes by specific user
```

#### Get Quiz
```http
GET /api/quizzes/{quiz_id}
```

#### Get Quiz by Share Code
```http
GET /api/quizzes/share/{share_code}
```

#### Update Quiz
```http
PUT /api/quizzes/{quiz_id}
Content-Type: application/json

{
  "title": "Updated Quiz Title",
  "description": "Updated description",
  "is_public": false
}
```

#### Delete Quiz
```http
DELETE /api/quizzes/{quiz_id}
```

### Questions

#### Create Question
```http
POST /api/quizzes/{quiz_id}/questions
Content-Type: application/json

{
  "text": "What is the capital of France?",
  "question_type": "multiple_choice",
  "options": ["London", "Paris", "Berlin", "Madrid"],
  "correct_answer": "Paris",
  "points": 2,
  "order": 1
}
```

#### Get Questions
```http
GET /api/quizzes/{quiz_id}/questions
```

#### Update Question
```http
PUT /api/questions/{question_id}
Content-Type: application/json

{
  "text": "Updated question text",
  "points": 3
}
```

#### Delete Question
```http
DELETE /api/questions/{question_id}
```

## Data Models

### User
- `id`: Unique identifier (UUID)
- `username`: Unique username
- `email`: Unique email address
- `created_at`: Timestamp when user was created

### Quiz
- `id`: Unique identifier (UUID)
- `title`: Quiz title
- `description`: Quiz description
- `is_public`: Whether the quiz is publicly visible
- `share_code`: Unique 8-character code for sharing
- `created_at`: Timestamp when quiz was created
- `updated_at`: Timestamp when quiz was last updated
- `user_id`: Reference to the user who created the quiz

### Question
- `id`: Unique identifier (UUID)
- `text`: Question text
- `question_type`: Type of question (multiple_choice, true_false, text)
- `options`: Array of options for multiple choice questions
- `correct_answer`: The correct answer
- `points`: Points awarded for correct answer
- `order`: Question order in the quiz
- `quiz_id`: Reference to the quiz this question belongs to

## Question Types

### Multiple Choice
```json
{
  "text": "What is 2 + 2?",
  "question_type": "multiple_choice",
  "options": ["3", "4", "5", "6"],
  "correct_answer": "4"
}
```

### True/False
```json
{
  "text": "The Earth is round.",
  "question_type": "true_false",
  "correct_answer": "true"
}
```

### Text
```json
{
  "text": "What is the largest planet in our solar system?",
  "question_type": "text",
  "correct_answer": "Jupiter"
}
```

## Example Usage

### 1. Create a User
```bash
curl -X POST http://localhost:5000/api/users \
  -H "Content-Type: application/json" \
  -d '{"username": "quizmaster", "email": "quiz@example.com"}'
```

### 2. Create a Quiz
```bash
curl -X POST http://localhost:5000/api/quizzes \
  -H "Content-Type: application/json" \
  -d '{"title": "Science Quiz", "description": "Test your science knowledge", "user_id": "USER_ID_FROM_STEP_1"}'
```

### 3. Add Questions
```bash
curl -X POST http://localhost:5000/api/quizzes/QUIZ_ID_FROM_STEP_2/questions \
  -H "Content-Type: application/json" \
  -d '{"text": "What is the chemical symbol for gold?", "question_type": "multiple_choice", "options": ["Au", "Ag", "Fe", "Cu"], "correct_answer": "Au"}'
```

### 4. Share the Quiz
Use the `share_code` from the quiz response to share it with others:
```
http://localhost:5000/api/quizzes/share/SHARE_CODE
```

## Health Check

```http
GET /health
```

Returns the server status and confirms it's running.

## Database

The application uses SQLite by default, which creates a `quizzy.db` file in the server directory. For production, consider using PostgreSQL or MySQL.

## Error Handling

All endpoints return appropriate HTTP status codes:
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `404`: Not Found
- `500`: Internal Server Error

Error responses include an `error` field with a description of what went wrong. 