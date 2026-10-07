"""Local test settings when the Docker PostgreSQL service is unavailable."""
from testing.settings import *

DATABASES = {'default': {'ENGINE': 'django.db.backends.sqlite3', 'NAME': ':memory:'}}
SECRET_KEY = 'local-tests-only'
ALLOWED_HOSTS = ['testserver', 'localhost']
EMAIL_BACKEND = 'django.core.mail.backends.locmem.EmailBackend'
STORAGES = {'staticfiles': {'BACKEND': 'django.contrib.staticfiles.storage.StaticFilesStorage'}}
