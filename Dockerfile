# Use Node.js 20 LTS (stable)
FROM node:20-alpine

# Set working directory
WORKDIR /portal

# Copy package files first
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application source
COPY . .

# Expose Vite dev server port
EXPOSE 5174

# Run Vite with proper host binding
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
