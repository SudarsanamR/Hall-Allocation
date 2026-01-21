# University Exam Seat Allotment System

A comprehensive web application designed to automate and optimize the process of allocating exam seats for university students. This system handles student data constraints, hall capacities, and specific seating patterns (like the "Vertical Snake") to ensure fair and organized exam conduct.

## 🚀 Features

- **Automated Seat Allotment**: 
  - Generates seating plans based on hall capacity and student subject registration.
  - Implements advanced seating logic (e.g., Vertical Snake pattern) to minimize adjacency conflicts between students of the same subject.
  - Supports "Spacer" logic to prevent side-by-side seating of same-subject students where possible.

- **Hall Management**:
  - dynamic configuration of exam halls (Block, Hall Number, Rows, Columns).
  - Visualization of hall status (Total capacity, allocated seats).

- **Data Processing**:
  - **PDF Parsing**: robust extraction of student registration data and exam timetables from university PDF documents.
  - **Excel/CSV Support**: Export and import capabilities for reporting.

- **Interactive Dashboard**:
  - Real-time statistics on allocated vs. pending seats.
  - Visual representation of seating grids.

## 🛠️ Technology Stack

### Frontend
- **Framework**: [React](https://react.dev/) (v18+) with [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) for modern, responsive design.
- **Icons**: [Lucide React](https://lucide.dev/).
- **Navigation**: React Router DOM.
- **HTTP Client**: Axios.

### Backend
- **Framework**: [Flask](https://flask.palletsprojects.com/) (Python).
- **Data Processing**: 
  - `pandas` for data manipulation.
  - `pdfplumber` for high-accuracy PDF text extraction.
  - `openpyxl` for Excel operations.
- **Project Structure**: Organized as a modular application with separate services for logic and routing.

## 📂 Project Structure

```
antigravity 3.0/
├── backend/               # Python/Flask Backend
│   ├── app/
│   │   ├── routes/        # API Endpoints (seating, upload, etc.)
│   │   ├── services/      # Business logic (allocation, parsing)
│   │   └── models/        # Database models (if applicable)
│   ├── requirements.txt   # Python dependencies
│   └── run.py             # Entry point
│
├── frontend/              # React Frontend
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Application pages
│   │   └── utils/         # Helper functions
│   ├── package.json       # Node.js dependencies
│   └── vite.config.ts     # Vite configuration
│
└── README.md              # Project Documentation
```

## ⚡ Getting Started

### Prerequisites
- **Node.js** (v18 or higher)
- **Python** (3.9 or higher)

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/SudarsanamR/Hall-Allocation.git
    cd Hall-Allocation
    ```

2.  **Backend Setup**
    ```bash
    cd backend
    python -m venv venv
    
    # Windows
    venv\Scripts\activate
    
    # macOS/Linux
    source venv/bin/activate
    
    pip install -r requirements.txt
    ```

3.  **Frontend Setup**
    ```bash
    cd ../frontend
    npm install
    ```

### Running the Application

1.  **Start the Backend** (from `backend/` directory)
    ```bash
    python run.py
    ```
    The server typically runs on `http://localhost:5000`.

2.  **Start the Frontend** (from `frontend/` directory)
    ```bash
    npm run dev
    ```
    Access the application at the URL provided by Vite (usually `http://localhost:5173`).

## 🤝 Contribution
Contributions are welcome! Please feel free to submit a Pull Request.
