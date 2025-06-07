# Webimar React Frontend Dockerfile
FROM node:18-alpine

# Set work directory
WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Set environment variables
ENV REACT_APP_API_BASE_URL=http://localhost:8001/api
ENV NODE_ENV=production

# Build the app
RUN npm run build

# Install serve to run the production build
RUN npm install -g serve

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000 || exit 1

# Serve the production build
CMD ["serve", "-s", "build", "-l", "3000"]
