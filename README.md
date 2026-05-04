# BYOT Template

A template project for full-stack applications with React (Vite) frontend and Node.js backend, featuring the Piramal Finance theme.

## Features

- **Frontend**: React with Vite for fast development
- **Backend**: Express.js server with modular architecture
- **Styling**: Tailwind CSS with Piramal Finance theme (orange/gold)
- **Theme**: Professional UI with consistent styling and components
- **Configuration**: Pre-configured proxy setup, ports, and environment variables
- **Development**: Hot reloading for both frontend and backend
- **Docker**: Ready to use Dockerfile for containerization
- **Concurrently**: Run frontend and backend with a single command

## Project Structure

```
byot-template/
├── frontend/                # React Vite frontend
│   ├── public/              # Static assets
│   ├── src/                 # Source code
│   │   ├── components/      # React components
│   │   ├── utils/           # Utility functions
│   │   ├── App.jsx          # Main App component
│   │   └── main.jsx         # Entry point
│   ├── .env.example         # Example environment variables
│   ├── index.html           # HTML template
│   ├── package.json         # Frontend dependencies
│   └── vite.config.js       # Vite configuration
│
├── backend/                 # Node.js Express backend
│   ├── routes/              # API routes
│   │   ├── index.js         # Routes index file
│   │   ├── health.js        # Health check routes
│   │   └── users.example.js # Example user routes
│   ├── models/              # Data models
│   │   ├── index.js         # Models index file
│   │   └── User.example.js  # Example user model
│   ├── middleware/          # Express middleware
│   │   ├── errorHandler.js  # Error handling middleware
│   ├── server.js            # Express server
│   ├── .env.example         # Example environment variables
│   └── package.json         # Backend dependencies
│
├── Dockerfile               # Docker configuration
├── .gitignore               # Git ignore file
├── package.json             # Root package.json with scripts
└── README.md                # This file
```

## Getting Started

### Prerequisites

- Node.js (v16+)
- npm or yarn

### Setup

1. Clone the repository
   ```
   git clone <repository-url>
   cd byot-template
   ```

2. Install dependencies
   ```
   npm run install:all
   ```

3. Set up environment variables
   ```
   cp frontend/.env.example frontend/.env
   cp backend/.env.example backend/.env
   ```

4. Start development servers
   ```
   npm run dev
   ```

### Frontend

The frontend is built with modern web development tools:

- **React**: Component-based UI library
- **Vite**: Fast build tool and development server
- **Tailwind CSS**: Utility-first CSS framework with Piramal Finance color palette
- **Custom Components**: Pre-styled components using the Piramal Finance theme
- **Responsive Design**: Mobile-friendly layouts that work on all devices
- **Axios**: Promise-based HTTP client for API requests

### Backend Architecture

The backend is structured with a modular architecture:

- **Routes**: API endpoints organized by feature
  - Health check endpoints are included by default
  - Example user routes are provided as a template
  
- **Models**: Data models for database interaction
  - Includes example MongoDB/Mongoose user model template
  
- **Middleware**: Reusable middleware functions
  - Error handling middleware for consistent error responses

You can easily extend the application by:
1. Adding new route files to the routes directory
2. Creating new models in the models directory
3. Importing and using these in the routes

## Development

- Frontend runs on: http://localhost:8001
- Backend runs on: http://localhost:8002
- Health check: http://localhost:8001/health and http://localhost:8002/api/health

## Available Scripts

- `npm run dev`: Start both frontend and backend in development mode
- `npm run start:frontend`: Start frontend only
- `npm run start:backend`: Start backend only
- `npm run build`: Build the frontend for production
- `npm run clean`: Remove build files

## Docker

Build the Docker image:
```
docker build -t byot-template .
```

Run the container:
```
docker run -p 8001:8001 -p 8002:8002 byot-template
```

## License

MIT
