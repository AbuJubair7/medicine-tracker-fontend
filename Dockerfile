# 1. Base Stage
FROM node:18-alpine as base
WORKDIR /app
COPY package*.json ./

# 2. Development Stage
FROM base as development
RUN npm install
COPY . .
# Expose port (Vite default is 5173, but we configured 8000)
EXPOSE 8000
CMD ["npm", "run", "dev"]

# 3. Builder Stage (for Production)
FROM base as builder
RUN npm ci
COPY . .
# Pass environment variables during build time
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_GOOGLE_CLIENT_ID
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_GOOGLE_CLIENT_ID=$NEXT_PUBLIC_GOOGLE_CLIENT_ID
RUN npm run build

# 4. Production Stage
FROM nginx:alpine as production
# Copy the build output to replace default nginx contents
COPY --from=builder /app/dist /usr/share/nginx/html
# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
