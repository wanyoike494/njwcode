#!/usr/bin/env bash
# build.sh — Render runs this during every deployment

set -o errexit   # Exit immediately if any command fails

pip install -r requirements.txt

python manage.py collectstatic --no-input

python manage.py migrate