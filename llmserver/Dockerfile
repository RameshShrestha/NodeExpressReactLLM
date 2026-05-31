# Use a slim Node.js image for a smaller footprint
FROM node:22-slim

# Create and set the working directory
WORKDIR /usr/src/app

# Copy package files first to leverage Docker caching
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy the rest of your source code
COPY . .

# Create the uploads folder (since your code uses it)
RUN mkdir -p uploads

# The port your app listens on
EXPOSE 5000

# Set environment variables (OLLAMA_HOST is crucial if Ollama is in another container)
ENV PORT=5000
ENV OLLAMA_HOST=http://host.docker.internal:11434

# Start the application
CMD ["node", "index.js"]
