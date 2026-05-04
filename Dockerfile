FROM 174671783765.dkr.ecr.ap-south-1.amazonaws.com/piramal/base/node/node18:18.20.8

# Install curl for health checks
RUN apk add --no-cache curl

# Set environment variables
ENV NODE_ENV=development
ENV VITE_API_URL=/api

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY frontend/package*.json ./frontend/
COPY backend/package*.json ./backend/

# Install dependencies
RUN npm install
RUN npm run install:all

# Copy source code
COPY . .

RUN chmod +x ./scripts/start.sh

# Expose ports (Frontend and Backend)
EXPOSE 8001 8002

CMD ["npm", "start"]
