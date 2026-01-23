import sys
import os

# Add the current directory to sys.path to ensure 'app' module is found
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, current_dir)

from app import create_app

# Create the application
app = create_app()

if __name__ == '__main__':
    # Run slightly differently for desktop:
    # 1. No debug mode
    # 2. Bind to localhost only (avoids firewall popups)
    # 3. Port 5000 (standard)
    print("Starting Desktop Backend on port 5000...")
    app.run(debug=False, host='127.0.0.1', port=5000)
