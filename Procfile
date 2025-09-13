web: gunicorn backend.main:app -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:$PORT --forwarded-allow-ips='*' --access-logfile -
