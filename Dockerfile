# Node base image
FROM node:24.11.1-bookworm-slim

# Set the working directory (creates if doesn't exist)
WORKDIR /app

# Copy Node.js package files and install dependencies
COPY package*.json ./
RUN npm install

# Install python and pip 
# Wearipedia package used to access cronometer requires python version 3.10 - 3.12 to work properly
# rm -rf removes files and directories from the path provided
# -y automatically answers yes to any confirmation prompts during the installation process
RUN apt-get update && apt-get install -y python3.12 python3.12-pip && rm -rf /var/lib/apt/lists/*

# Python script requires wearipedia package to be installed (all others used are native packages)
RUN pip install --no-cache-dir wearipedia

# Copy the rest of the application code
COPY . .

# Expose the port the Node.js app runs on
EXPOSE 8080

# Command to start node backend
CMD ["npm", "start"]