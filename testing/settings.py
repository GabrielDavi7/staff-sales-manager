from config.settings import *

# Tests still use PostgreSQL and the complete middleware/authentication stack.
PASSWORD_HASHERS = ['django.contrib.auth.hashers.MD5PasswordHasher']
