#!/bin/bash

# Setup script for Notion Activity Tracker
# This script creates a virtual environment and installs dependencies

echo "Setting up Notion Activity Tracker..."

# Create virtual environment
echo "Creating virtual environment..."
python3 -m venv venv

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Upgrade pip
echo "Upgrading pip..."
pip install --upgrade pip

# Install dependencies
echo "Installing dependencies..."
pip install -r requirements.txt

echo ""
echo "✅ Setup complete!"
echo ""
echo "To use the tracker:"
echo "1. Activate the virtual environment: source venv/bin/activate"
echo "2. Set your Notion token: export NOTION_TOKEN='your_token_here'"
echo "3. Run the tracker: python notion_activity_tracker.py"
echo ""
