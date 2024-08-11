# syntax = docker/dockerfile:1

# Adjust NODE_VERSION as desired
ARG NODE_VERSION=20.14.0
FROM node:${NODE_VERSION}-slim as base

LABEL fly_launch_runtime="Node.js"

# Node.js app lives here
WORKDIR /app

# Set production environment
ENV NODE_ENV="production"

# Throw-away build stage to reduce size of final image
FROM base as build

# Install packages needed to build node modules
RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y \
    build-essential \
    node-gyp \
    pkg-config \
    python3 \
    python3-pip

# Install node modules
COPY --link package-lock.json package.json ./
RUN npm ci

# Copy application code
COPY --link . .

# Install Python dependencies with --break-system-packages flag
RUN pip3 install pandas --break-system-packages

# Final stage for app image
FROM base

# Install Python 3 in the final stage as well
RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y \
    python3 \
    python3-pip

# Copy built application
COPY --from=build /app /app

# Install Python dependencies in final image
RUN pip3 install pandas --break-system-packages

# Start the server by default, this can be overwritten at runtime
EXPOSE 3000
CMD [ "node", "src/server.js" ]
