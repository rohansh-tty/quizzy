#!/bin/bash

# Activate virtual environment
source env/bin/activate

# Install dependencies if needed
pip install -r requirements.txt

# Run the Flask application
python app.py 