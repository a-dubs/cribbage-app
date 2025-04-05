# frontend/Dockerfile
FROM nginx:alpine

# Set timezone
ENV TZ=America/New_York

# Copy build files from the context directory (assumes `npm run build` already ran)
COPY build/ /usr/share/nginx/html

# Copy .env file into container if needed by frontend
COPY .env /usr/share/nginx/html/.env

# Use default nginx port
EXPOSE 80
