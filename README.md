# imagery-tasking-service

A React-based web application that visualizes and interacts with geospatial datasets. Users can view map clusters, select datasets, create shareable links of their current view, and download specific dataset tiles.

## Features

- **Map Visualization**: Uses Mapbox GL JS to render geospatial tiles and dataset clusters.
- **Clustering**: Automatically clusters dataset points based on zoom level, allowing users to see aggregated data at a glance.
- **Dataset Selection**: Easily switch between various pre-defined datasets.
- **Shareable Links**: Generate URLs that capture the current map state (zoom, position, selected dataset).
- **Download Tiles**: Download the visible tile area of the selected dataset.
- **Responsive UI**: Tailwind CSS for quick styling and responsive layouts.

## Directory Structure

- **`client/src/utils`**: Utility functions and data definitions.
- **`client/src/styles`**: Global styles.
- **`client/src/hooks`**: Custom React hooks for state management and logic extraction.
- **`client/src/components`**: Organized into `UI`, `Modals`, and `Map` directories for clarity and scalability.

## Prerequisites

- Node.js (LTS recommended)
- npm or yarn
- A valid Mapbox Access Token (define it in `.env`)
- API base URL for tiles (also define it in `.env`)

## Getting Started

1. **Clone the Repository**:
   ```bash
   git clone https://gitlab.com/albedo-geospatial-imagery/imagery-tasking-service.git 
   cd order-space-pix/client
   npm install
   
2. **Set Environment Variables**: Create a .env file in the client directory:
   ```bash
    REACT_APP_MAPBOX_TOKEN=your-mapbox-token
    REACT_APP_API_BASE_URL=https://api.example.com

Note: Make sure .env is listed in .gitignore to avoid committing sensitive information.

3. **Run the Development Server**:
    
```bash
npm start
The app is usually available at http://localhost:3000
