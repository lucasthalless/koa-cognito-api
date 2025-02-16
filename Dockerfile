# Build stage
FROM node:20.15.0-alpine AS builder

WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm i

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# # Production stage
# FROM node:20.15.0-alpine

# WORKDIR /usr/src/app

# # Copy package files
# COPY package*.json ./

# # Install production dependencies only
# RUN npm i --production

# # Copy built files from builder stage
# COPY --from=builder /usr/src/app/dist ./dist

# # Copy env files if needed
COPY .env* ./

EXPOSE 3000

CMD ["node", "dist/index.js"]