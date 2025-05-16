# ─── Stage 1: Build the app ────────────────────────────────────────────────────
FROM node:20.9.0-bullseye-slim AS builder
WORKDIR /app

# Install all dependencies (including devDeps) in a deterministic way
COPY package*.json ./
RUN npm ci --legacy-peer-deps
# Copy source code and build
COPY . .
RUN npm run build

# ─── Stage 2: Assemble production image ───────────────────────────────────────
FROM node:20.9.0-bullseye-slim AS runner
WORKDIR /app

# Ensure frameworks run in production mode
ENV NODE_ENV=production

# Install only production dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy the built output from the builder
COPY --from=builder /app/.output ./.output

# Expose the port your app listens on
EXPOSE 3000

# Start the production server (uses `vinxi start` under the hood)
CMD ["npm", "run", "start"]
