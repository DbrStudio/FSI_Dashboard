FROM node:20-alpine

WORKDIR /app

copy package*.json ./
RUN npm ci

COPY . .

EXPOSE 5173

cmd ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]