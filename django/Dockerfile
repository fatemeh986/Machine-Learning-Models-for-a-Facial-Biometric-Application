# django/Dockerfile

FROM python:3.11-slim


ENV PYTHONUNBUFFERED=1


WORKDIR /app

RUN apt-get update && \
    apt-get install -y --no-install-recommends \
      libgl1-mesa-glx \
      libglib2.0-0 && \
    rm -rf /var/lib/apt/lists/*
    
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt


COPY . .


EXPOSE 8000
CMD ["sh", "-c", "python manage.py migrate && uvicorn backend.asgi:application --host 0.0.0.0 --port 8000 --reload"]
