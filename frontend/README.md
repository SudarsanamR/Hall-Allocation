# Exam Allocation Frontend

The user interface for the Seat Allotment System, built with **React**, **TypeScript**, and **Tailwind CSS**. It provides a modern, responsive dashboard for administrators to manage exams, halls, and view allocation results.

## 🏗️ Architecture

-   **Build Tool**: [Vite](https://vitejs.dev/) for fast development and optimized production builds.
-   **Routing**: `react-router-dom` handles navigation between Dashboard, Upload, and Management pages.
-   **Styling**:
    -   **Tailwind CSS**: Utility-first styling for layout and responsiveness.
    -   **Lucide React**: Consistent and clean icon set.
-   **Interactivity**:
    -   **@dnd-kit**: Powered the Drag-and-Drop block reordering interface.
-   **API Integration**: Custom `api.ts` utility using `axios` to communicate with the Flask backend.

## 📱 Page Overview

### 1. Dashboard (`/`)
-   **Overview Cards**: Displays real-time metrics (Total Students, Available Halls, Total Capacity).
-   **Quick Actions**: Shortcuts to common tasks like "Add Hall" or "Upload Data".
-   **Recent Activity**: Shows the status of recent allocations.

### 2. Upload Data (`/upload`)
-   **File Dropzone**: Drag-and-drop interface for uploading University PDF timetables or Student Excel sheets.
-   **Parsing Feedback**: Shows status of the file upload and parsing process (Success/Error counts).

### 3. Hall Management (`/halls`)
-   **Block Reordering**: Drag blocks (e.g., Auditorium, Civil Block) to prioritize order of allocation.
-   **Visual Grid Builder**: Validates hall configuration (Rows x Columns).
-   **Capacity Calculation**: Automatically calculates total capacity based on dimensions.
-   **Hall List**: View, edit, or delete existing hall configurations.

### 4. Allocation Results (`/results`)
-   **Seating Grid Visualization**: Renders the actual layout of the hall.
    -   **Color Coding**: Different colors represent different Subjects or Departments.
    -   **Tooltips**: Hover over a seat to see Student Name, Reg No, and Department.
-   **Export**: Options to download the seating plan as an Excel file.

## 📂 Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── layout/       # Shared UI (Sidebar, TopBar)
│   │   ├── seating/      # Grid visualization components
│   │   └── halls/        # Hall form, list, and DnD components
│   ├── pages/            # Main Route Views
│   │   ├── Dashboard.tsx
│   │   ├── Upload.tsx
│   │   ├── HallManagement.tsx
│   │   └── Results.tsx
│   ├── utils/
│   │   └── api.ts        # Axios instance & API methods
│   └── App.tsx           # Route definitions
├── public/               # Static assets
└── vite.config.ts        # Bundler config
```

## 💻 Development

1.  **Install Dependencies**:
    ```bash
    npm install
    ```

2.  **Start Dev Server**:
    ```bash
    npm run dev
    ```
    Access at `http://localhost:5173`.

## 🎨 Key Features

-   **Responsive Design**: Works on Desktop and Tablets.
-   **Drag & Drop**: Intuitive sorting for Hall Blocks to set allocation priority.
-   **Real-time Validation**: Form inputs for Hall dimensions and capacities are validated instantly.
-   **Grid Visualization**: Dynamic rendering of seating grids based on matrix data from the backend.
