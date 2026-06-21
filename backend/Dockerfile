# Python base image
FROM python:3.11-slim

# Prevent Python from writing .pyc files and force unbuffered logging
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Tell Python where the application root is
ENV PYTHONPATH=/app

RUN groupadd -r pyrunner && useradd -r -g pyrunner pyrunner

WORKDIR /app

# Install native system dependencies required for compilation
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Install Python requirements
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy backend application files
COPY . .

# Change ownership of the app directory to pyrunner
RUN chown -R pyrunner:pyrunner /app

USER pyrunner

EXPOSE 8000

# Execute using Gunicorn binding to all container interfaces
CMD ["gunicorn", "-b", "0.0.0.0:8000", "app.main:app", "-k", "uvicorn.workers.UvicornWorker"]
