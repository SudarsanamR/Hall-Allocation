# Installation Guide

Follow these steps to set up the University Exam Seat Allotment System on your local machine.

## Prerequisites

Ensure you have the following installed:
*   **Git**: [Download Git](https://git-scm.com/downloads)
*   **Python (v3.9+)**: [Download Python](https://www.python.org/downloads/)
*   **Node.js (v18+)**: [Download Node.js](https://nodejs.org/)

## 1. Clone the Repository

Open your terminal (Command Prompt, PowerShell, or Bash) and run:

```bash
git clone https://github.com/SudarsanamR/Hall-Allocation.git
cd Hall-Allocation
```

## 2. Backend Setup

Navigate to the backend directory and set up the Python environment.

```bash
cd backend
```

### Create Virtual Environment
*   **Windows**: `python -m venv venv`
*   **Mac/Linux**: `python3 -m venv venv`

### Activate Environment
*   **Windows**: `venv\Scripts\activate`
*   **Mac/Linux**: `source venv/bin/activate`

### Install Dependencies
```bash
pip install -r requirements.txt
```

## 3. Frontend Setup

Navigate to the frontend directory and install Node packages.

```bash
cd ../frontend
npm install
```

## 4. Running the Application

You need to run both the backend and frontend servers simultaneously (using two terminal windows).

### Terminal 1: Backend
```bash
cd backend
# Ensure venv is active
python run.py
```
*   Backend will start at `http://localhost:5000`

### Terminal 2: Frontend
```bash
cd frontend
npm run dev
```
*   Frontend will start at `http://localhost:5173` (or similar)

## Troubleshooting

*   **Port In Use**: If port 5000 is taken, kill the existing process or modify `run.py`.
*   **Missing Modules**: Ensure you activated the virtual environment before installing `requirements.txt`.
