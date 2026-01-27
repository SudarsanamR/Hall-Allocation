# API Reference

The backend is built with Flask and exposes a RESTful API.

## Base URL
`http://localhost:5000/api`

## Endpoints

### 1. Seating
*   **POST** `/generate`
    *   **Description**: Triggers the seating allocation algorithm.
    *   **Body**: `{}` (options can be added)
    *   **Response**: `200 OK` with summary stats.

*   **GET** `/allocations`
    *   **Description**: Returns the JSON of the current seating plan.

### 2. Halls
*   **GET** `/halls`
    *   **Description**: Get list of all halls.
*   **POST** `/halls`
    *   **Description**: Create a hall.
    *   **Body**: `{ "name": "A1", "block": "Main", "rows": 5, "columns": 5 }`
*   **POST** `/halls/reorder_blocks`
    *   **Description**: Reorder priority of blocks.
    *   **Body**: `["Auditorium", "Main Block", "Civil Block"]` (List of strings)

### 3. Upload
*   **POST** `/upload`
    *   **Description**: Upload file (PDF or Excel).
    *   **Form-Data**: `file: (binary)`
