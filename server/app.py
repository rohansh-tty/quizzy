from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import uuid
import click
from flask_cors import CORS
from sqlalchemy import text
from dotenv import load_dotenv
# from faker import Faker

app = Flask(__name__)
CLIENT_URL = load_dotenv('CLIENT_URL')
CORS(app, resources={
    # Health endpoints - allow ANY origin (*)
    r"/health/*": {
        "origins": "*",
        "methods": ["GET", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    },
    # All other endpoints - only specific client URLs
    r"/api/*": {
        "origins": [
            'https://quizzy-three-orcin.vercel.app/',
            'http://localhost:5173',
            'http://localhost:3000'
        ],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"],
        # "supports_credentials": True  # Allow cookies/auth headers
    }
})

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///quizzy.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# Models
class Event(db.Model):
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.String(36), db.ForeignKey('user.id'), nullable=False)
    user_email = db.Column(db.String(120), nullable=False)
    event_details = db.Column(db.String(120), nullable=False)
    status = db.Column(db.String(120), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)



class User(db.Model):
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    quizzes = db.relationship('Quiz', backref='creator', lazy=True)

class Quiz(db.Model):
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    is_public = db.Column(db.Boolean, default=True)
    share_code = db.Column(db.String(10), unique=True, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    user_id = db.Column(db.String(36), db.ForeignKey('user.id'), nullable=False)
    questions = db.relationship('Question', backref='quiz', lazy=True, cascade='all, delete-orphan')

class Question(db.Model):
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    text = db.Column(db.Text, nullable=False)
    question_type = db.Column(db.String(20), default='multiple_choice')  # multiple_choice, true_false, text
    options = db.Column(db.JSON)  # For multiple choice questions
    correct_answer = db.Column(db.String(500), nullable=False)
    points = db.Column(db.Integer, default=1)
    order = db.Column(db.Integer, default=0)
    quiz_id = db.Column(db.String(36), db.ForeignKey('quiz.id'), nullable=False)

class QuizResponse(db.Model):
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    quiz_id = db.Column(db.String(36), db.ForeignKey('quiz.id'), nullable=False)
    question_id = db.Column(db.String(36), db.ForeignKey('question.id'), nullable=False)
    user_name = db.Column(db.String(100), nullable=False)
    user_email = db.Column(db.String(120), nullable=False)
    user_phone = db.Column(db.String(20))  # Optional
    answer = db.Column(db.String(500), nullable=False)
    is_correct = db.Column(db.Boolean, nullable=False)
    points_earned = db.Column(db.Integer, default=0)
    submitted_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    quiz = db.relationship('Quiz', backref='responses')
    question = db.relationship('Question', backref='responses')

# Helper function to generate share codes
def generate_share_code():
    import random
    import string
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=8))

@app.route('/api/generate-username', methods=['POST'])
def generate_username():
    # fake = Faker()
    # username = fake.user_name()
    username = "test"
    return jsonify({'username': username})


@app.route('/api/event', methods=['POST'])
def update_event_details():
    data = request.get_json()
    
    # Parse created_at string to datetime object
    created_at = None
    if data.get('created_at'):
        try:
            created_at = datetime.fromisoformat(data['created_at'].replace('Z', '+00:00'))
        except (ValueError, AttributeError):
            # If parsing fails, use current time
            created_at = datetime.utcnow()
    else:
        created_at = datetime.utcnow()
    
    event = Event(
        user_id=data['user_id'],
        user_email=data['user_email'],
        event_details=data['event_details'],
        status=data['status'],
        created_at=created_at
    )
    db.session.add(event)
    db.session.commit()
    return jsonify({
        'id': event.id,
        'user_id': event.user_id,
        'user_email': event.user_email,
        'event_details': event.event_details,
        'status': event.status,
        'created_at': event.created_at.isoformat()
    })

# User CRUD endpoints
@app.route('/api/users', methods=['GET'])
def get_users():
    users = User.query.all()
    user_list = []  
    for user in users:
        user_list.append({
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'created_at': user.created_at.isoformat()
        })
    return jsonify(user_list)

@app.route('/api/users', methods=['POST'])
def create_user():
    data = request.get_json()
    
    if not data or not data.get('username') or not data.get('email'):
        return jsonify({'error': 'Username and email are required'}), 400
    
    # Check if user already exists

    # if User.query.filter_by(id=data['id']).first():
    #     return jsonify({'error': 'User already exists'}), 400
    
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Email already exists'}), 400
    
    user = User(username=data['username'], email=data['email'])
    db.session.add(user)
    db.session.commit()
    
    return jsonify({
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'created_at': user.created_at.isoformat()
    }), 201

@app.route('/api/users', methods=['GET'])
def get_user():
    user_email = request.args.get('user_email')
    user = User.query.filter_by(email=user_email).first()
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    return jsonify({
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'created_at': user.created_at.isoformat()
    })

@app.route('/api/users/<user_email>', methods=['PUT'])
def update_user(user_email):
    user = User.query.filter_by(email=user_email).first()
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    data = request.get_json()
    if data.get('username'):
        user.username = data['username']
    if data.get('email'):
        user.email = data['email']
    
    db.session.commit()
    
    return jsonify({
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'created_at': user.created_at.isoformat()
    })

@app.route('/api/users', methods=['DELETE'])
def delete_user():
    user_email = request.args.get('user_email')
    force = request.args.get('force', 'false').lower() == 'true'
    
    if not user_email:
        return jsonify({'error': 'User email is required'}), 400
    
    user = User.query.filter_by(email=user_email).first()
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    # Check if user has associated quizzes
    user_quizzes = Quiz.query.filter_by(user_id=user.id).all()
    user_responses = QuizResponse.query.filter_by(user_email=user.email).all()

    quiz_count = len(user_quizzes)
    response_count = len(user_responses)
    print(f'user_quizzes: {user_quizzes}')
    print(f'user_responses: {user_responses}')
    print(f'quiz_count: {quiz_count}')
    print(f'response_count: {response_count}')
    print(f'force: {force}')
    
    if quiz_count > 0 and not force:
        # Return warning with details about what will be deleted
        quiz_titles = [quiz.title for quiz in user_quizzes]
        return jsonify({
            'warning': f'User has {quiz_count} associated quiz(es) that will be deleted',
            'user_email': user.email,
            'user_id': user.id,
            'quizzes_to_delete': quiz_titles,
            'quiz_count': quiz_count,
            'message': 'Add ?force=true to confirm deletion with cascade'
        }), 409  # Conflict status code


    try:
        # Delete user (this will cascade to quizzes due to the relationship)
        db.session.delete(user)
        db.session.commit()
        
        return jsonify({
            'message': 'User deleted successfully',
            'cascaded_deletions': {
                'quizzes_deleted': quiz_count,
                'quiz_titles': [quiz.title for quiz in user_quizzes] if user_quizzes else []
            }
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to delete user: {str(e)}'}), 500

# Quiz CRUD endpoints
@app.route('/api/quizzes', methods=['POST'])
def create_quiz():
    data = request.get_json()

    
    if not data or not data.get('title') or not data.get('user_id'):
        return jsonify({'error': 'Title and user_id are required'}), 400
    
    # Check if user exists
    user = User.query.get(data['user_id'])
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    # Generate unique share code
    share_code = generate_share_code()
    while Quiz.query.filter_by(share_code=share_code).first():
        share_code = generate_share_code()
    
    quiz = Quiz(
        title=data['title'],
        description=data.get('description', ''),
        is_public=data.get('is_public', True),
        share_code=share_code,
        user_id=data['user_id']
    )
    
    db.session.add(quiz)
    db.session.commit()
    
    return jsonify({
        'id': quiz.id,
        'title': quiz.title,
        'description': quiz.description,
        'is_public': quiz.is_public,
        'share_code': quiz.share_code,
        'user_id': quiz.user_id,
        'created_at': quiz.created_at.isoformat()
    }), 201

@app.route('/api/quizzes', methods=['GET'])
def get_quizzes():
    user_id = request.args.get('user_id')
    if user_id:
        quizzes = Quiz.query.filter_by(user_id=user_id).all()
    else:
        quizzes = Quiz.query.filter_by(is_public=True).all()
    
    return jsonify([{
        'id': quiz.id,
        'title': quiz.title,
        'description': quiz.description,
        'is_public': quiz.is_public,
        'share_code': quiz.share_code,
        'user_id': quiz.user_id,
        'created_at': quiz.created_at.isoformat(),
        'question_count': len(quiz.questions)
    } for quiz in quizzes])

@app.route('/api/quizzes/<quiz_id>', methods=['GET'])
def get_quiz(quiz_id):
    quiz = Quiz.query.get(quiz_id)
    if not quiz:
        return jsonify({'error': 'Quiz not found'}), 404
    
    quiz_responses = QuizResponse.query.filter_by(quiz_id=quiz_id).group_by(QuizResponse.user_email).all()
    print(f"quiz_responses: {[quiz_response.user_email for quiz_response in quiz_responses]}")
    
    return jsonify({
        'id': quiz.id,
        'title': quiz.title,
        'description': quiz.description,
        'is_public': quiz.is_public,
        'share_code': quiz.share_code,
        'user_id': quiz.user_id,
        'created_at': quiz.created_at.isoformat(),
        'questions': [{
            'id': q.id,
            'text': q.text,
            'question_type': q.question_type,
            'options': q.options,
            'points': q.points,
            'order': q.order
        } for q in quiz.questions]

    })

@app.route('/api/quizzes/<quiz_id>', methods=['PUT'])
def update_quiz(quiz_id):
    quiz = Quiz.query.get(quiz_id)
    if not quiz:
        return jsonify({'error': 'Quiz not found'}), 404
    
    data = request.get_json()
    if data.get('title'):
        quiz.title = data['title']
    if data.get('description') is not None:
        quiz.description = data['description']
    if data.get('is_public') is not None:
        quiz.is_public = data['is_public']
    
    db.session.commit()
    
    return jsonify({
        'id': quiz.id,
        'title': quiz.title,
        'description': quiz.description,
        'is_public': quiz.is_public,
        'share_code': quiz.share_code,
        'user_id': quiz.user_id,
        'created_at': quiz.created_at.isoformat()
    })

@app.route('/api/quizzes/<quiz_id>', methods=['DELETE'])
def delete_quiz(quiz_id):
    quiz = Quiz.query.get(quiz_id)
    if not quiz:
        return jsonify({'error': 'Quiz not found'}), 404
    
    db.session.delete(quiz)
    db.session.commit()
    
    return jsonify({'message': 'Quiz deleted successfully'})

# Get quiz by share code
@app.route('/api/quizzes/share/<share_code>', methods=['GET'])
def get_quiz_by_share_code(share_code):
    quiz = Quiz.query.filter_by(share_code=share_code).first()
    if not quiz:
        return jsonify({'error': 'Quiz not found'}), 404
    
    return jsonify({
        'id': quiz.id,
        'title': quiz.title,
        'description': quiz.description,
        'is_public': quiz.is_public,
        'share_code': quiz.share_code,
        'user_id': quiz.user_id,
        'created_at': quiz.created_at.isoformat(),
        'questions': [{
            'id': q.id,
            'text': q.text,
            'question_type': q.question_type,
            'options': q.options,
            'points': q.points,
            'order': q.order
        } for q in quiz.questions]
    })

# Question CRUD endpoints
@app.route('/api/quizzes/<quiz_id>/questions', methods=['POST'])
def create_question(quiz_id):
    quiz = Quiz.query.get(quiz_id)
    if not quiz:
        return jsonify({'error': 'Quiz not found'}), 404
    
    data = request.get_json()
    if not data or not data.get('text') or not data.get('correct_answer'):
        return jsonify({'error': 'Text and correct_answer are required'}), 400
    
    question = Question(
        text=data['text'],
        question_type=data.get('question_type', 'multiple_choice'),
        options=data.get('options', []),
        correct_answer=data['correct_answer'],
        points=data.get('points', 1),
        order=data.get('order', len(quiz.questions) + 1),
        quiz_id=quiz_id
    )
    
    db.session.add(question)
    db.session.commit()
    
    return jsonify({
        'id': question.id,
        'text': question.text,
        'question_type': question.question_type,
        'options': question.options,
        'correct_answer': question.correct_answer,
        'points': question.points,
        'order': question.order,
        'quiz_id': question.quiz_id
    }), 201

@app.route('/api/quizzes/<quiz_id>/questions', methods=['GET'])
def get_questions(quiz_id):
    quiz = Quiz.query.get(quiz_id)
    if not quiz:
        return jsonify({'error': 'Quiz not found'}), 404
    
    questions = Question.query.filter_by(quiz_id=quiz_id).order_by(Question.order).all()
    
    return jsonify([{
        'id': q.id,
        'text': q.text,
        'question_type': q.question_type,
        'options': q.options,
        'correct_answer': q.correct_answer,
        'points': q.points,
        'order': q.order,
        'quiz_id': q.quiz_id
    } for q in questions])

@app.route('/api/questions/<question_id>', methods=['PUT'])
def update_question(question_id):
    question = Question.query.get(question_id)
    if not question:
        return jsonify({'error': 'Question not found'}), 404
    
    data = request.get_json()
    if data.get('text'):
        question.text = data['text']
    if data.get('question_type'):
        question.question_type = data['question_type']
    if data.get('options') is not None:
        question.options = data['options']
    if data.get('correct_answer'):
        question.correct_answer = data['correct_answer']
    if data.get('points') is not None:
        question.points = data['points']
    if data.get('order') is not None:
        question.order = data['order']
    
    db.session.commit()
    
    return jsonify({
        'id': question.id,
        'text': question.text,
        'question_type': question.question_type,
        'options': question.options,
        'correct_answer': question.correct_answer,
        'points': question.points,
        'order': question.order,
        'quiz_id': question.quiz_id
    })

@app.route('/api/questions/<question_id>', methods=['DELETE'])
def delete_question(question_id):
    question = Question.query.get(question_id)
    if not question:
        return jsonify({'error': 'Question not found'}), 404
    
    db.session.delete(question)
    db.session.commit()
    
    return jsonify({'message': 'Question deleted successfully'})

# Quiz Response endpoints
@app.route('/api/quiz-responses', methods=['POST'])
def submit_quiz_responses():
    data = request.get_json()
    
    if not data or not data.get('quiz_id') or not data.get('user_name') or not data.get('user_email') or not data.get('responses'):
        return jsonify({'error': 'Quiz ID, user name, email, and responses are required'}), 400
    
    quiz_id = data['quiz_id']
    user_name = data['user_name']
    user_email = data['user_email']
    user_phone = data.get('user_phone', '')
    responses = data['responses']
    
    # Check if quiz exists
    quiz = Quiz.query.get(quiz_id)
    if not quiz:
        return jsonify({'error': 'Quiz not found'}), 404
    
    # Check if responses array is not empty
    if not responses or len(responses) == 0:
        return jsonify({'error': 'At least one response is required'}), 400
    
    try:
        # Store each response
        stored_responses = []
        total_points = 0
        correct_answers = 0
        
        for response_data in responses:
            question_id = response_data.get('question_id')
            answer = response_data.get('answer')
            
            if not question_id or answer is None:
                continue
            
            # Get the question to check if answer is correct
            question = Question.query.get(question_id)
            if not question:
                continue
            
            is_correct = answer.lower().strip() == question.correct_answer.lower().strip()
            points_earned = question.points if is_correct else 0
            print(f"question: {question}, answer: {answer}, correct_answer: {question.correct_answer}, is_correct: {is_correct}, points_earned: {points_earned}")
            if is_correct:
                correct_answers += 1
                total_points += points_earned
            
            # Create and store the response
            quiz_response = QuizResponse(
                quiz_id=quiz_id,
                question_id=question_id,
                user_name=user_name,
                user_email=user_email,
                user_phone=user_phone,
                answer=answer,
                is_correct=is_correct,
                points_earned=question.points
            )
            
            db.session.add(quiz_response)
            stored_responses.append(quiz_response)
        
        db.session.commit()
        
        # Calculate percentage
        total_questions = len(responses)
        percentage = round((correct_answers / total_questions) * 100) if total_questions > 0 else 0
        
        return jsonify({
            'message': 'Quiz responses submitted successfully',
            'total_questions': total_questions,
            'correct_answers': correct_answers,
            'total_points': total_points,
            'percentage': percentage,
            'responses_stored': len(stored_responses)
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to store quiz responses: {str(e)}'}), 500

@app.route('/api/quizzes/<quiz_id>/responses', methods=['GET'])
def get_quiz_responses(quiz_id):
    """Get all responses for a specific quiz"""
    quiz = Quiz.query.get(quiz_id)
    if not quiz:
        return jsonify({'error': 'Quiz not found'}), 404
    
    unique_users_query = """
    select user_name, user_email, user_phone, quiz_response.quiz_id, quiz.title,
SUM(quiz_response.points_earned) as points_earned,
SUM(quiz_response.is_correct) as correct_answers,
SUM(question.points) as total_points,
COUNT(quiz_response.question_id) as total_questions
from quiz_response 
join question on quiz_response.question_id = question.id 
join quiz on quiz_response.quiz_id = quiz.id
where quiz_response.quiz_id = :quiz_id
group by user_email, user_name, user_phone, quiz_response.quiz_id, quiz.title
    """


    unique_users = db.session.execute(text(unique_users_query), {'quiz_id': quiz_id}).fetchall()
    
    user_responses = {}
    for user in unique_users:
        user_key = f"{user.user_email}_{datetime.now().isoformat()}"
        user_responses[user_key] = {
            'user_name': user.user_name,
            'user_email': user.user_email,
            'user_phone': user.user_phone,
            'submitted_at': datetime.now().isoformat(),
            'responses': [],
            'total_points': user.total_points,
            'points_earned': user.points_earned,
            'correct_answers': user.correct_answers,
            'total_questions': user.total_questions,
            'percentage': round((user.correct_answers / user.total_questions) * 100) if user.total_questions > 0 else 0
        }
    
    return jsonify({
        'quiz_id': quiz_id,
        'quiz_title': quiz.title,
        'total_attempts': len(unique_users),
        'user_responses': list(user_responses.values())
    })

# Health check endpoint
@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy', 'message': 'Quizzy server is running'})

# Flask CLI Commands
@app.cli.command("create-dummy-data")
@click.option('--users', default=3, help='Number of dummy users to create')
@click.option('--quizzes', default=5, help='Number of dummy quizzes to create')
@click.option('--questions-per-quiz', default=4, help='Number of questions per quiz')
def create_dummy_data(users, quizzes, questions_per_quiz):
    """Create dummy data for testing the quiz app"""
    with app.app_context():
        # Create dummy users
        dummy_users = []
        for i in range(users):
            user = User(
                username=f"user{i+1}",
                email=f"user{i+1}@example.com"
            )
            db.session.add(user)
            dummy_users.append(user)
        
        db.session.commit()
        click.echo(f"✅ Created {users} dummy users")
        
        # Create dummy quizzes
        quiz_titles = [
            "General Knowledge Quiz",
            "Science Quiz", 
            "History Quiz",
            "Geography Quiz",
            "Math Quiz",
            "Literature Quiz",
            "Sports Quiz",
            "Music Quiz",
            "Technology Quiz",
            "Art Quiz"
        ]
        
        quiz_descriptions = [
            "Test your general knowledge with these interesting questions",
            "Explore the world of science with this comprehensive quiz",
            "Travel through time with these historical questions",
            "Discover the world with geography questions",
            "Challenge your mathematical skills",
            "Test your knowledge of classic literature",
            "Sports enthusiasts, this quiz is for you!",
            "How well do you know music? Find out here!",
            "Stay updated with technology questions",
            "Appreciate art through these creative questions"
        ]
        
        dummy_quizzes = []
        for i in range(quizzes):
            user = dummy_users[i % len(dummy_users)]
            quiz = Quiz(
                title=quiz_titles[i],
                description=quiz_descriptions[i],
                is_public=True,
                share_code=generate_share_code(),
                user_id=user.id
            )
            db.session.add(quiz)
            dummy_quizzes.append(quiz)
        
        db.session.commit()
        click.echo(f"✅ Created {quizzes} dummy quizzes")
        
        # Create dummy questions
        question_data = [
            # General Knowledge
            {
                "text": "What is the capital of France?",
                "type": "multiple_choice",
                "options": ["London", "Paris", "Berlin", "Madrid"],
                "answer": "Paris"
            },
            {
                "text": "Which planet is known as the Red Planet?",
                "type": "multiple_choice", 
                "options": ["Earth", "Mars", "Jupiter", "Venus"],
                "answer": "Mars"
            },
            {
                "text": "What is the largest ocean on Earth?",
                "type": "multiple_choice",
                "options": ["Atlantic", "Indian", "Arctic", "Pacific"],
                "answer": "Pacific"
            },
            {
                "text": "Who painted the Mona Lisa?",
                "type": "multiple_choice",
                "options": ["Van Gogh", "Da Vinci", "Picasso", "Monet"],
                "answer": "Da Vinci"
            },
            # Science
            {
                "text": "What is the chemical symbol for gold?",
                "type": "multiple_choice",
                "options": ["Au", "Ag", "Fe", "Cu"],
                "answer": "Au"
            },
            {
                "text": "What is the hardest natural substance on Earth?",
                "type": "multiple_choice",
                "options": ["Iron", "Diamond", "Granite", "Steel"],
                "answer": "Diamond"
            },
            {
                "text": "What is the largest organ in the human body?",
                "type": "multiple_choice",
                "options": ["Heart", "Brain", "Liver", "Skin"],
                "answer": "Skin"
            },
            {
                "text": "What is the speed of light?",
                "type": "multiple_choice",
                "options": ["300,000 km/s", "150,000 km/s", "450,000 km/s", "600,000 km/s"],
                "answer": "300,000 km/s"
            },
            # History
            {
                "text": "In which year did World War II end?",
                "type": "multiple_choice",
                "options": ["1943", "1944", "1945", "1946"],
                "answer": "1945"
            },
            {
                "text": "Who was the first President of the United States?",
                "type": "multiple_choice",
                "options": ["John Adams", "Thomas Jefferson", "George Washington", "Benjamin Franklin"],
                "answer": "George Washington"
            },
            {
                "text": "Which ancient wonder was located in Alexandria?",
                "type": "multiple_choice",
                "options": ["Colossus", "Lighthouse", "Pyramids", "Gardens"],
                "answer": "Lighthouse"
            },
            {
                "text": "What year did Columbus discover America?",
                "type": "multiple_choice",
                "options": ["1492", "1498", "1500", "1502"],
                "answer": "1492"
            },
            # Geography
            {
                "text": "What is the largest country in the world?",
                "type": "multiple_choice",
                "options": ["China", "USA", "Canada", "Russia"],
                "answer": "Russia"
            },
            {
                "text": "Which river is the longest in the world?",
                "type": "multiple_choice",
                "options": ["Amazon", "Nile", "Yangtze", "Mississippi"],
                "answer": "Nile"
            },
            {
                "text": "What is the smallest continent?",
                "type": "multiple_choice",
                "options": ["Europe", "Asia", "Australia", "Antarctica"],
                "answer": "Australia"
            },
            {
                "text": "Which mountain range is the longest in the world?",
                "type": "multiple_choice",
                "options": ["Rocky Mountains", "Himalayas", "Andes", "Alps"],
                "answer": "Andes"
            },
            # Math
            {
                "text": "What is 15 × 7?",
                "type": "multiple_choice",
                "options": ["95", "100", "105", "110"],
                "answer": "105"
            },
            {
                "text": "What is the square root of 144?",
                "type": "multiple_choice",
                "options": ["10", "11", "12", "13"],
                "answer": "12"
            },
            {
                "text": "What is 25% of 80?",
                "type": "multiple_choice",
                "options": ["15", "20", "25", "30"],
                "answer": "20"
            },
            {
                "text": "What is the next number in the sequence: 2, 4, 8, 16, __?",
                "type": "multiple_choice",
                "options": ["24", "32", "30", "28"],
                "answer": "32"
            }
        ]
        
        questions_created = 0
        for i, quiz in enumerate(dummy_quizzes):
            for j in range(questions_per_quiz):
                question_index = (i * questions_per_quiz + j) % len(question_data)
                q_data = question_data[question_index]
                
                question = Question(
                    text=q_data["text"],
                    question_type=q_data["type"],
                    options=q_data["options"],
                    correct_answer=q_data["answer"],
                    points=1 + (j % 3),  # 1, 2, or 3 points
                    order=j + 1,
                    quiz_id=quiz.id
                )
                db.session.add(question)
                questions_created += 1
        
        db.session.commit()
        click.echo(f"✅ Created {questions_created} dummy questions")
        
        # Display summary
        click.echo("\n" + "="*50)
        click.echo("🎉 DUMMY DATA CREATION COMPLETE!")
        click.echo("="*50)
        click.echo(f"👥 Users created: {users}")
        click.echo(f"📝 Quizzes created: {quizzes}")
        click.echo(f"❓ Questions created: {questions_created}")
        click.echo(f"🔗 Total questions: {questions_created}")
        click.echo("\n💡 You can now test the API with this data!")
        click.echo("🌐 Start the server with: python app.py")
        click.echo("🧪 Test with: python test_api.py")

@app.cli.command("clear-data")
@click.confirmation_option(prompt='Are you sure you want to delete all data? This cannot be undone!')
def clear_data():
    """Clear all data from the database"""
    with app.app_context():
        db.drop_all()
        db.create_all()
        click.echo("🗑️  All data cleared! Database tables recreated.")

@app.cli.command("list-data")
def list_data():
    """List all data in the database"""
    with app.app_context():
        users = User.query.all()
        quizzes = Quiz.query.all()
        questions = Question.query.all()
        quiz_responses = QuizResponse.query.all()
        
        click.echo("📊 DATABASE CONTENTS")
        click.echo("="*30)
        
        click.echo(f"\n👥 USERS ({len(users)}):")
        for user in users:
            click.echo(f"  - {user.username} ({user.email}) - ID: {user.id}")
        
        click.echo(f"\n📝 QUIZZES ({len(quizzes)}):")
        for quiz in quizzes:
            creator = User.query.get(quiz.user_id)
            creator_name = creator.username if creator else "Unknown"
            click.echo(f"  - {quiz.title} by {creator_name} - Share: {quiz.share_code}")
        
        click.echo(f"\n❓ QUESTIONS ({len(questions)}):")
        for question in questions:
            quiz = Quiz.query.get(question.quiz_id)
            quiz_title = quiz.title if quiz else "Unknown Quiz"
            click.echo(f"  - {question.text[:50]}... ({quiz_title})")
        
        click.echo(f"\n📊 QUIZ RESPONSES ({len(quiz_responses)}):")
        for response in quiz_responses[:10]:  # Show first 10 responses
            quiz = Quiz.query.get(response.quiz_id)
            quiz_title = quiz.title if quiz else "Unknown Quiz"
            click.echo(f"  - {response.user_name} ({response.user_email}) - {quiz_title} - {'✓' if response.is_correct else '✗'}")
        if len(quiz_responses) > 10:
            click.echo(f"  ... and {len(quiz_responses) - 10} more responses")

@app.cli.command("view-responses")
@click.option('--quiz-id', help='Quiz ID to view responses for')
def view_responses(quiz_id):
    """View quiz responses for a specific quiz or all quizzes"""
    with app.app_context():
        if quiz_id:
            # View responses for specific quiz
            quiz = Quiz.query.get(quiz_id)
            if not quiz:
                click.echo(f"❌ Quiz with ID {quiz_id} not found")
                return
            
            responses = QuizResponse.query.filter_by(quiz_id=quiz_id).all()
            click.echo(f"\n📊 RESPONSES FOR QUIZ: {quiz.title}")
            click.echo("="*50)
            
            if not responses:
                click.echo("No responses found for this quiz.")
                return
            
            # Group by user
            user_responses = {}
            for response in responses:
                user_key = response.user_email
                if user_key not in user_responses:
                    user_responses[user_key] = {
                        'name': response.user_name,
                        'email': response.user_email,
                        'phone': response.user_phone,
                        'responses': [],
                        'total_points': 0,
                        'correct_answers': 0
                    }
                
                user_responses[user_key]['responses'].append({
                    'question_id': response.question_id,
                    'answer': response.answer,
                    'is_correct': response.is_correct,
                    'points': response.points_earned
                })
                
                if response.is_correct:
                    user_responses[user_key]['correct_answers'] += 1
                user_responses[user_key]['total_points'] += response.points_earned
            
            for user_email, user_data in user_responses.items():
                click.echo(f"\n👤 {user_data['name']} ({user_data['email']})")
                if user_data['phone']:
                    click.echo(f"   📱 Phone: {user_data['phone']}")
                
                total_questions = len(user_data['responses'])
                percentage = round((user_data['correct_answers'] / total_questions) * 100) if total_questions > 0 else 0
                
                click.echo(f"   📊 Score: {user_data['total_points']} points")
                click.echo(f"   ✅ Correct: {user_data['correct_answers']}/{total_questions} ({percentage}%)")
                
                for i, resp in enumerate(user_data['responses'], 1):
                    question = Question.query.get(resp['question_id'])
                    question_text = question.text[:60] + "..." if question and len(question.text) > 60 else (question.text if question else "Unknown question")
                    status = "✓" if resp['is_correct'] else "✗"
                    click.echo(f"   {i}. {status} {question_text}")
                    click.echo(f"      Answer: {resp['answer']}")
        else:
            # View all quiz responses summary
            quizzes = Quiz.query.all()
            click.echo("\n📊 QUIZ RESPONSES SUMMARY")
            click.echo("="*40)
            
            for quiz in quizzes:
                responses = QuizResponse.query.filter_by(quiz_id=quiz.id).all()
                if responses:
                    unique_users = len(set([r.user_email for r in responses]))
                    total_responses = len(responses)
                    correct_responses = len([r for r in responses if r.is_correct])
                    
                    click.echo(f"\n📝 {quiz.title}")
                    click.echo(f"   👥 Users: {unique_users}")
                    click.echo(f"   📊 Responses: {total_responses}")
                    click.echo(f"   ✅ Correct: {correct_responses}")
                    click.echo(f"   🔗 Share Code: {quiz.share_code}")

# Root route for domain access
@app.route('/')
def index():
    return jsonify({
        'message': 'Welcome to Quizzy API!',
        'status': 'running',
        'endpoints': {
            'health': '/health',
            'api_docs': 'All API endpoints are under /api/',
            'quizzes': '/api/quizzes',
            'users': '/api/users'
        }
    })


@app.after_request
def add_cors_headers(response):
    from flask import request
    
    origin = request.headers.get('Origin')
    
    # Health endpoints - allow any origin
    if request.path.startswith('/health/'):
        response.headers['Access-Control-Allow-Origin'] = '*'
        response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
        response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
    
    # All other endpoints - only allow specific origins
    elif origin in ['https://quizzy-three-orcin.vercel.app/', 'http://localhost:5173']:
        response.headers['Access-Control-Allow-Origin'] = origin
        response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
        response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
        response.headers['Access-Control-Allow-Credentials'] = 'true'
    
    return response

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True, host='0.0.0.0', port=5000)
