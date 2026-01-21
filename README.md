# Exam Hall Allotment System

A comprehensive web application for intelligent exam hall seat allocation with advanced alternating seating logic.

## Features

✨ **Smart Seating Algorithm**
- Alternating pattern using `(row + col) % 2` logic
- Multi-subject mode: No adjacent seats have the same subject
- Single-subject mode: No adjacent seats have the same department
- Ascending registration number sorting

🎨 **Modern UI**
- Glassmorphism design with Tailwind CSS
- Color-coded seat visualization
- Responsive dashboard with statistics
- Dark mode friendly

📊 **Hall Management**
- Pre-configured 30+ halls across 7 blocks
- Custom hall creation with variable dimensions
- CRUD operations for hall configuration

📁 **File Handling**
- Excel (.xlsx, .xls) and CSV upload support
- Automated data validation
- Hall-wise and student-wise Excel downloads

## Technology Stack

### Frontend
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS 3
- **Routing**: React Router DOM
- **HTTP Client**: Axios
- **Icons**: Lucide React
- **Excel Generation**: XLSX

### Backend
- **Framework**: Flask 3.0
- **CORS**: Flask-CORS
- **Data Processing**: Pandas
- **Excel Handling**: OpenPyXL
- **Language**: Python 3.8+

## Project Structure

```
exam-hall-allotment/
├── frontend/                 # React TypeScript application
│   ├── src/
│   │   ├── components/      # React components
│   │   │   ├── layout/      # Sidebar, TopBar, StatCards
│   │   │   ├── seating/     # SeatingGrid, SeatCell
│   │   │   └── halls/       # HallManager, HallForm
│   │   ├── pages/           # Dashboard, Upload, Results, HallManagement
│   │   ├── types/           # TypeScript interfaces
│   │   ├── utils/           # API client
│   │   ├── App.tsx          # Main app component
│   │   └── main.tsx         # Entry point
│   ├── package.json
│   └── tailwind.config.js
│
└── backend/                 # Flask Python application
    ├── app/
    │   ├── models/          # Data models
    │   ├── routes/          # API endpoints
    │   ├── services/        # Business logic
    │   │   ├── seating_algorithm.py
    │   │   ├── parser.py
    │   │   └── excel_generator.py
    │   └── __init__.py
    ├── requirements.txt
    ├── run.py
    └── sample_data.csv      # Test data
```

## Installation & Setup

### Prerequisites
- Node.js 18+ and npm
- Python 3.8+
- pip

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:5174`

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Create virtual environment (recommended):
```bash
python -m venv venv

# Windows
venv\Scripts\activate

# Mac/Linux
source venv/bin/activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Start Flask server:
```bash
python run.py
```

The backend API will be available at `http://localhost:5000`

## Usage Guide

### 1. Initialize Halls

Navigate to **Halls** page and click **Initialize Default Halls** to load 30 pre-configured halls, or create custom halls manually.

**Default Halls**:
- Maths / 1st Year Block: I1, I2, I5, I6, I7, I8
- Civil Block: T1, T2, T3, T6A, T6B
- EEE Block: EEE1, EEE2
- ECE Block: CT10, CT11, CT12
- Mech Block: M2, M3, M6, AH1, AH2, AH3
- Auto Block: A4
- Auditorium: AUD1, AUD2, AUD3, AUD4

### 2. Upload Student Data

Navigate to **Upload** page and upload an Excel or CSV file with the following columns:

| Column | Description | Example |
|--------|-------------|---------|
| Register Number | Student registration number | 21CSR001 |
| Subject Code | Exam subject code | CS101 |
| Department | Student department | CSE |
| Exam Date | Date of examination | 2026-02-10 |
| Session | FN (Forenoon) or AN (Afternoon) | FN |

**Sample file**: Use `backend/sample_data.csv` for testing.

### 3. Generate Seating

Click the **Generate Seating** button in the top bar or on the Dashboard. The system will:
- Group students by subject (if multiple subjects) or department (if single subject)
- Sort students by registration number
- Apply alternating seating pattern
- Display color-coded seating grid

### 4. View Results

Navigate to **Results** page to:
- View detailed hall-wise seating grids
- Download **Hall-wise Excel** (grid layout per hall)
- Download **Student-wise Excel** (allocation list)

## Seating Algorithm

### Pattern Logic

The algorithm uses `(row + col) % 2` to create a checkerboard pattern:

```
Example 5×5 Grid:
X Y X Y X    where X = Group X (even sum)
Y X Y X Y          Y = Group Y (odd sum)
X Y X Y X
Y X Y X Y
X Y X Y X
```

### Case 1: Multiple Subjects

When students have different subjects on the same exam date/session:
1. Group students by subject code
2. Split subjects into Group X and Group Y
3. Alternate subjects in the grid
4. **Result**: No two adjacent seats have the same subject

### Case 2: Single Subject

When all students have the same subject:
1. Group students by department
2. Split departments into Group X and Group Y
3. Alternate departments in the grid
4. **Result**: No two adjacent seats have the same department

### Allocation Process

1. **Sort** students by registration number (ascending)
2. **Group** by subject or department
3. **Distribute** into two alternating groups
4. **Fill halls** sequentially using the pattern
5. **Validate** no adjacent conflicts exist

## API Endpoints

### Halls
- `GET /api/halls` - Get all halls
- `POST /api/halls` - Create new hall
- `PUT /api/halls/:id` - Update hall
- `DELETE /api/halls/:id` - Delete hall
- `POST /api/halls/initialize` - Initialize default halls

### Upload
- `POST /api/upload` - Upload Excel/CSV file
- `GET /api/students` - Get current student data

### Seating
- `POST /api/generate` - Generate seating arrangement
- `GET /api/download/hall-wise` - Download hall-wise Excel
- `GET /api/download/student-wise` - Download student-wise Excel

## Development

### Frontend Build
```bash
cd frontend
npm run build
```

Output will be in `frontend/dist`

### Frontend Preview
```bash
npm run preview
```

### Type Checking
```bash
npm run type-check
```

## Troubleshooting

### Port Already in Use

**Frontend (5173):**
```bash
# The app will automatically try port 5174, 5175, etc.
```

**Backend (5000):**
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:5000 | xargs kill -9
```

### CORS Issues

Ensure backend is running and CORS is configured for `http://localhost:5174` in `backend/app/__init__.py`

### Excel Upload Fails

Check:
- File has required columns (case-insensitive)
- Session values are "FN" or "AN"
- File size is under 16MB

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## License

This project is created for educational purposes.

## Support

For issues and questions:
- Check the troubleshooting section
- Review API documentation above
- Verify sample data format matches requirements

---

Built with ❤️ using React, TypeScript, Flask, and Python
