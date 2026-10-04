# Claw Dashboard - Production Docker Image
# Multi-stage build for optimized image size

# Stage 1: Dependencies
FROM node:20-alpine AS dependencies

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install production dependencies only.
# --ignore-scripts skips the husky 'prepare' hook, which fails here
# because husky is a devDependency and absent with --omit=dev.
RUN npm ci --omit=dev --ignore-scripts && npm cache clean --force

# Stage 2: Production
FROM node:20-alpine AS production

# Add metadata labels
LABEL maintainer="Kevin Smith <kevin@example.com>"
LABEL org.opencontainers.image.title="Claw Dashboard"
LABEL org.opencontainers.image.description="A beautiful console dashboard for monitoring OpenClaw instances"
LABEL org.opencontainers.image.source="https://github.com/spleck/claw-dashboard"
LABEL org.opencontainers.image.licenses="MIT"

# Use the non-root user already provided by the node image (uid/gid 1000).
# Creating our own here collides with the built-in 'node' account on
# current node:20-alpine and fails with "gid '1000' in use".
WORKDIR /app

# Copy production dependencies from dependencies stage
COPY --from=dependencies /app/node_modules ./node_modules

# Copy application files
COPY --chown=node:node index.js ./
COPY --chown=node:node src ./src

# Switch to non-root user
USER node

# Expose any potential web interface port (for future use)
EXPOSE 18790

# Set environment variables
ENV NODE_ENV=production
ENV TERM=xterm-256color

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "console.log('healthy')" || exit 1

# Run the dashboard
ENTRYPOINT ["node", "index.js"]
CMD []