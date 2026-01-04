# Node base image
FROM node:24.11.1-bookworm-slim

# Set the working directory (creates if doesn't exist)
WORKDIR /app

# Copy Node.js package files and install dependencies
COPY package*.json ./
RUN npm install

# Install python and pip 
# Wearipedia package used to access cronometer requires python version 3.10 - 3.12 to work properly
# rm -rf reduces package lists to reduce image size
# -y automatically answers yes to any confirmation prompts during the installation process
# install venc -> module for virtual environment for python 3.12
RUN apt-get update && apt-get install -y python3.11 python3-pip python3.11-venv && rm -rf /var/lib/apt/lists/*

# Create a virtual environment for python and set PATH to use it for Python packages
# Avoid conflicts with system packages
RUN python3.11 -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Python script requires wearipedia package to be installed (all others used are native packages)
RUN pip install --no-cache-dir wearipedia

# Wearipedia is for some reason mising two import statements in cronometer_fetch.py, so need to add them
ENV NEW_LINES="import re\\nimport pandas as pd\\n"
ENV TARGET_FILE="/opt/venv/lib/python3.11/site-packages/wearipedia/devices/cronometer/cronometer_fetch.py"

RUN sed -i "1i\\$NEW_LINES" "$TARGET_FILE"

# Copy the rest of the application code
COPY . .

# Expose the port the Node.js app runs on
EXPOSE 8080

# Command to start node backend
CMD ["npm", "start"]