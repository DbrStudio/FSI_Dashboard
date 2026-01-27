# Build
FROM node:20-alpine AS builder

WORKDIR /app

copy package*.json ./
RUN npm ci

ARG VITE_OPENWEATHERMAP_API_KEY
ENV VITE_OPENWEATHERMAP_API_KEY=$VITE_OPENWEATHERMAP_API_KEY

COPY . .

RUN npm run build

# Execute
FROM nginx:alpine

RUN rm /etc/nginx/conf.d/default.conf

COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
