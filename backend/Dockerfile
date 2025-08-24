FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

# deps first for cache
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# app
COPY . .

# create a writable data dir for SQLite and fix ownership
RUN mkdir -p /data && chown -R 1001:1001 /data /app

EXPOSE 8000
USER 1001

# pick ONE of these:
# CMD ["uvicorn","main:app","--host","0.0.0.0","--port","8000"]
CMD ["gunicorn","-k","uvicorn.workers.UvicornWorker","main:app","--bind","0.0.0.0:8000","--workers","1"]
