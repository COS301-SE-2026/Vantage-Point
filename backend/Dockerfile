# Python base image
FROM python:3.11-slim

# Prevent Python from writing .pyc files and force unbuffered logging
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Install native system dependencies required for compilation
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Install Python requirements
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend application files
COPY . .

# Create a non-privileged security user to run the processes safely
RUN useradd -u 8888 pyrunner && chown -R pyrunner /app
USER pyrunner

EXPOSE 8000

# Execute using Gunicorn binding to all container interfaces
CMD ["gunicorn", "-b", "0.0.0.0:8000", "main:app", "-k", "uvicorn.workers.UvicornWorker"]
