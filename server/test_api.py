#!/usr/bin/env python3
"""
Test script for Quizzy API
Run this after starting the server to test all endpoints
"""

import requests
import json

BASE_URL = "http://localhost:5000"

def test_health():
    """Test health check endpoint"""
    print("Testing health check...")
    response = requests.get(f"{BASE_URL}/health")
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")
    print()

def test_user_crud():
    """Test user CRUD operations"""
    print("=== Testing User CRUD ===")
    
    # Create user
    print("Creating user...")
    user_data = {
        "username": "testuser",
        "email": "test@example.com"
    }
    response = requests.post(f"{BASE_URL}/api/users", json=user_data)
    print(f"Create user status: {response.status_code}")
    
    if response.status_code == 201:
        user = response.json()
        user_id = user['id']
        print(f"User created with ID: {user_id}")
        
        # Get user
        print("\nGetting user...")
        response = requests.get(f"{BASE_URL}/api/users/{user_id}")
        print(f"Get user status: {response.status_code}")
        if response.status_code == 200:
            print(f"User data: {response.json()}")
        
        # Update user
        print("\nUpdating user...")
        update_data = {"username": "updateduser"}
        response = requests.put(f"{BASE_URL}/api/users/{user_id}", json=update_data)
        print(f"Update user status: {response.status_code}")
        if response.status_code == 200:
            print(f"Updated user: {response.json()}")
        
        return user_id
    else:
        print(f"Failed to create user: {response.json()}")
        return None

def test_quiz_crud(user_id):
    """Test quiz CRUD operations"""
    if not user_id:
        print("Skipping quiz tests - no user ID")
        return None
    
    print("\n=== Testing Quiz CRUD ===")
    
    # Create quiz
    print("Creating quiz...")
    quiz_data = {
        "title": "Test Quiz",
        "description": "A test quiz for API testing",
        "is_public": True,
        "user_id": user_id
    }
    response = requests.post(f"{BASE_URL}/api/quizzes", json=quiz_data)
    print(f"Create quiz status: {response.status_code}")
    
    if response.status_code == 201:
        quiz = response.json()
        quiz_id = quiz['id']
        share_code = quiz['share_code']
        print(f"Quiz created with ID: {quiz_id}")
        print(f"Share code: {share_code}")
        
        # Get quiz
        print("\nGetting quiz...")
        response = requests.get(f"{BASE_URL}/api/quizzes/{quiz_id}")
        print(f"Get quiz status: {response.status_code}")
        if response.status_code == 200:
            print(f"Quiz data: {response.json()}")
        
        # Get quiz by share code
        print("\nGetting quiz by share code...")
        response = requests.get(f"{BASE_URL}/api/quizzes/share/{share_code}")
        print(f"Get quiz by share code status: {response.status_code}")
        if response.status_code == 200:
            print(f"Quiz by share code: {response.json()}")
        
        # Update quiz
        print("\nUpdating quiz...")
        update_data = {"title": "Updated Test Quiz"}
        response = requests.put(f"{BASE_URL}/api/quizzes/{quiz_id}", json=update_data)
        print(f"Update quiz status: {response.status_code}")
        if response.status_code == 200:
            print(f"Updated quiz: {response.json()}")
        
        return quiz_id
    else:
        print(f"Failed to create quiz: {response.json()}")
        return None

def test_question_crud(quiz_id):
    """Test question CRUD operations"""
    if not quiz_id:
        print("Skipping question tests - no quiz ID")
        return
    
    print("\n=== Testing Question CRUD ===")
    
    # Create question
    print("Creating question...")
    question_data = {
        "text": "What is 2 + 2?",
        "question_type": "multiple_choice",
        "options": ["3", "4", "5", "6"],
        "correct_answer": "4",
        "points": 2,
        "order": 1
    }
    response = requests.post(f"{BASE_URL}/api/quizzes/{quiz_id}/questions", json=question_data)
    print(f"Create question status: {response.status_code}")
    
    if response.status_code == 201:
        question = response.json()
        question_id = question['id']
        print(f"Question created with ID: {question_id}")
        
        # Get questions
        print("\nGetting questions...")
        response = requests.get(f"{BASE_URL}/api/quizzes/{quiz_id}/questions")
        print(f"Get questions status: {response.status_code}")
        if response.status_code == 200:
            print(f"Questions: {response.json()}")
        
        # Update question
        print("\nUpdating question...")
        update_data = {"points": 3}
        response = requests.put(f"{BASE_URL}/api/questions/{question_id}", json=update_data)
        print(f"Update question status: {response.status_code}")
        if response.status_code == 200:
            print(f"Updated question: {response.json()}")
        
        # Delete question
        print("\nDeleting question...")
        response = requests.delete(f"{BASE_URL}/api/questions/{question_id}")
        print(f"Delete question status: {response.status_code}")
        if response.status_code == 200:
            print("Question deleted successfully")

def test_get_quizzes():
    """Test getting quizzes"""
    print("\n=== Testing Get Quizzes ===")
    
    # Get all public quizzes
    print("Getting all public quizzes...")
    response = requests.get(f"{BASE_URL}/api/quizzes")
    print(f"Get quizzes status: {response.status_code}")
    if response.status_code == 200:
        quizzes = response.json()
        print(f"Found {len(quizzes)} public quizzes")
        for quiz in quizzes:
            print(f"- {quiz['title']} (Share code: {quiz['share_code']})")

def cleanup_test_data(user_id, quiz_id):
    """Clean up test data"""
    print("\n=== Cleaning Up Test Data ===")
    
    if quiz_id:
        print("Deleting quiz...")
        response = requests.delete(f"{BASE_URL}/api/quizzes/{quiz_id}")
        print(f"Delete quiz status: {response.status_code}")
    
    if user_id:
        print("Deleting user...")
        response = requests.delete(f"{BASE_URL}/api/users/{user_id}")
        print(f"Delete user status: {response.status_code}")

def main():
    """Main test function"""
    print("Starting Quizzy API tests...")
    print("Make sure the server is running on http://localhost:5000")
    print("=" * 50)
    
    try:
        # Test health check
        test_health()
        
        # Test user CRUD
        user_id = test_user_crud()
        
        # Test quiz CRUD
        quiz_id = test_quiz_crud(user_id)
        
        # Test question CRUD
        test_question_crud(quiz_id)
        
        # Test getting quizzes
        test_get_quizzes()
        
        # Clean up
        cleanup_test_data(user_id, quiz_id)
        
        print("\n" + "=" * 50)
        print("All tests completed!")
        
    except requests.exceptions.ConnectionError:
        print("Error: Could not connect to the server.")
        print("Make sure the Flask server is running on http://localhost:5000")
    except Exception as e:
        print(f"Error during testing: {e}")

if __name__ == "__main__":
    main() 