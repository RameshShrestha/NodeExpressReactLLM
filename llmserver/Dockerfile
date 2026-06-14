FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --only=production
COPY . .
EXPOSE 5000

# Bypasses the shell string parser entirely
ENTRYPOINT ["node", "index.js"]
