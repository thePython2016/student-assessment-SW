"""
Django settings for project.

Production preparation for Render deployment.
Database: Supabase PostgreSQL
Frontend: Angular on Vercel
"""

from pathlib import Path
from datetime import timedelta
import os

from dotenv import load_dotenv

# --------------------------------------------------
# BASE DIRECTORY AND ENVIRONMENT VARIABLES
# --------------------------------------------------

BASE_DIR = Path(__file__).resolve().parent.parent

# Load local environment variables
load_dotenv(BASE_DIR / '.env')


# --------------------------------------------------
# SECURITY SETTINGS
# --------------------------------------------------

SECRET_KEY = os.getenv('SECRET_KEY')


if not SECRET_KEY:
    raise ValueError("SECRET_KEY is missing from environment variables")

DEBUG = os.getenv('DEBUG', 'False').lower() == 'true'

ALLOWED_HOSTS = [
    'student-assessment-4ipf.onrender.com',
    'localhost',
    '127.0.0.1',
]

LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "handlers": {
        "console": {"class": "logging.StreamHandler"},
    },
    "loggers": {
        "django.request": {
            "handlers": ["console"],
            "level": "ERROR",
            "propagate": False,
        },
    },
}
# Render automatically provides this variable
render_hostname = os.getenv('RENDER_EXTERNAL_HOSTNAME')

if render_hostname and render_hostname not in ALLOWED_HOSTS:
    ALLOWED_HOSTS.append(render_hostname)

# Needed for Django admin / CSRF-protected requests over HTTPS
CSRF_TRUSTED_ORIGINS = [
    'https://student-assessment-4ipf.onrender.com',
    'https://student-assessment-zeta.vercel.app',
]

if render_hostname:
    render_origin = f'https://{render_hostname}'
    if render_origin not in CSRF_TRUSTED_ORIGINS:
        CSRF_TRUSTED_ORIGINS.append(render_origin)


# HTTPS security settings

SECURE_PROXY_SSL_HEADER = (
    'HTTP_X_FORWARDED_PROTO',
    'https'
)

SECURE_SSL_REDIRECT = not DEBUG

SESSION_COOKIE_SECURE = not DEBUG

CSRF_COOKIE_SECURE = not DEBUG

# Start low; raise to 31536000 (1 year) once you're sure HTTPS is permanent.
# Override with the HSTS_SECONDS environment variable on Render.
SECURE_HSTS_SECONDS = int(os.getenv('HSTS_SECONDS', '3600')) if not DEBUG else 0

SECURE_HSTS_INCLUDE_SUBDOMAINS = False

SECURE_HSTS_PRELOAD = False


# --------------------------------------------------
# APPLICATION DEFINITION
# --------------------------------------------------

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # Third-party applications
    'corsheaders',
    'rest_framework',
    'rest_framework.authtoken',
    'rest_framework_simplejwt',
    'rest_framework_simplejwt.token_blacklist',

    # Custom applications
    'account',
    'student',
    'instructor',
    'department',
    'course',
    'questions',
    'assessment',
    'exam',
    'resources',
]


# --------------------------------------------------
# MIDDLEWARE
# --------------------------------------------------

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',

    'whitenoise.middleware.WhiteNoiseMiddleware',

    'corsheaders.middleware.CorsMiddleware',

    'django.contrib.sessions.middleware.SessionMiddleware',

    'django.middleware.common.CommonMiddleware',

    'django.middleware.csrf.CsrfViewMiddleware',

    'django.contrib.auth.middleware.AuthenticationMiddleware',

    'django.contrib.messages.middleware.MessageMiddleware',

    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]


# --------------------------------------------------
# URL CONFIGURATION
# --------------------------------------------------

ROOT_URLCONF = 'project.urls'


# --------------------------------------------------
# TEMPLATES
# --------------------------------------------------

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',

        'DIRS': [],

        'APP_DIRS': True,

        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]


# --------------------------------------------------
# WSGI CONFIGURATION
# --------------------------------------------------

WSGI_APPLICATION = 'project.wsgi.application'


# --------------------------------------------------
# DATABASE CONFIGURATION
# --------------------------------------------------
# On Render, use the Supabase *pooler* connection details (IPv4 compatible):
#   DB_HOST = aws-0-<region>.pooler.supabase.com
#   DB_USER = postgres.<project-ref>
#   DB_PORT = 5432 (session pooler) or 6543 (transaction pooler)

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',

        'NAME': os.getenv('DB_NAME'),

        'USER': os.getenv('DB_USER'),

        'PASSWORD': os.getenv('DB_PASSWORD'),

        'HOST': os.getenv('DB_HOST'),

        'PORT': os.getenv('DB_PORT'),

        'CONN_MAX_AGE': 0,

        'OPTIONS': {
            'sslmode': 'require',
        },

        # Required for Supabase transaction pooler (port 6543);
        # harmless with the session pooler.
        'DISABLE_SERVER_SIDE_CURSORS': True,
    }
}

# Validate database environment variables
required_db_variables = [
    'DB_NAME',
    'DB_USER',
    'DB_PASSWORD',
    'DB_HOST',
    'DB_PORT',
]

missing_db_variables = [
    variable for variable in required_db_variables
    if not os.getenv(variable)
]

if missing_db_variables:
    raise ValueError(
        f"Missing database environment variables: {missing_db_variables}"
    )


# --------------------------------------------------
# CUSTOM USER MODEL
# --------------------------------------------------

AUTH_USER_MODEL = 'account.User'


# --------------------------------------------------
# REST FRAMEWORK
# --------------------------------------------------

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
}


# --------------------------------------------------
# JWT CONFIGURATION
# --------------------------------------------------

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(hours=1),

    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),

    'ROTATE_REFRESH_TOKENS': True,

    'BLACKLIST_AFTER_ROTATION': True,
}


# --------------------------------------------------
# PASSWORD VALIDATION
# --------------------------------------------------
# Make sure account/validators.py defines CommonPasswordValidator,
# otherwise Django raises an import error when validating passwords.

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'account.validators.CommonPasswordValidator',
    },
]


# --------------------------------------------------
# CORS CONFIGURATION
# --------------------------------------------------

CORS_ALLOWED_ORIGINS = [
    'http://localhost:4200',
    'http://127.0.0.1:4200',
    'https://student-assessment-zeta.vercel.app',
]

CORS_ALLOW_CREDENTIALS = True


# --------------------------------------------------
# INTERNATIONALIZATION
# --------------------------------------------------

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'Africa/Nairobi'

USE_I18N = True

USE_TZ = True


# --------------------------------------------------
# STATIC AND MEDIA FILES CONFIGURATION
# --------------------------------------------------

STATIC_URL = 'static/'

STATIC_ROOT = BASE_DIR / 'staticfiles'

# NOTE: Render's disk is ephemeral. Files uploaded to MEDIA_ROOT are lost on
# every deploy/restart. For persistent uploads use Supabase Storage, S3,
# or a Render persistent disk.
MEDIA_URL = '/media/'

MEDIA_ROOT = BASE_DIR / 'media'

STORAGES = {
    'default': {
        'BACKEND': 'django.core.files.storage.FileSystemStorage',
    },

    'staticfiles': {
        'BACKEND': 'whitenoise.storage.CompressedManifestStaticFilesStorage',
    },
}


# --------------------------------------------------
# EMAIL CONFIGURATION
# --------------------------------------------------

EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'


# --------------------------------------------------
# DEFAULT PRIMARY KEY
# --------------------------------------------------

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'