# Webimar API Backend

Django REST API backend for the Webimar system.

## Environment Configuration

### Required Environment Variables

The application uses environment variables for configuration. Copy `.env.production.template` to `.env` and configure the following variables:

#### Core Django Settings
- `DEBUG` (bool): Set to `False` in production
- `SECRET_KEY` (string): Django secret key (minimum 50 characters)
- `ALLOWED_HOSTS` (comma-separated): Domains allowed to access the API
  - Example: `localhost,127.0.0.1,your-domain.com,www.your-domain.com`

#### Database Configuration
- `DATABASE_URL` (string): PostgreSQL database connection string
  - Format: `postgresql://username:password@host:port/database_name`
  - Example: `postgresql://webimar_user:secure_password@localhost:5432/webimar_db`

#### CORS Settings
- `CORS_ALLOWED_ORIGINS` (comma-separated): Frontend origins allowed to access the API
  - Example: `http://localhost:3000,https://your-domain.com,http://your-domain.com`
  - Both HTTP and HTTPS versions are automatically added for production domains

#### Security Settings
- `SECURE_PROXY_SSL_HEADER` (comma-separated): Header for SSL termination
  - Format: `header_name,header_value`
  - Example: `HTTP_X_FORWARDED_PROTO,https`

#### Email Configuration (Optional)
- `EMAIL_BACKEND`, `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USE_TLS`
- `EMAIL_HOST_USER`, `EMAIL_HOST_PASSWORD`

### Setup

1. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

2. **Configure environment**
   ```bash
   cp .env.production.template .env
   # Edit .env with your configuration
   ```

3. **Run migrations**
   ```bash
   python manage.py migrate
   ```

4. **Start the server**
   ```bash
   python manage.py runserver  # Development
   gunicorn webimar_api.wsgi:application  # Production
   ```

## Features

- RESTful API endpoints
- JWT authentication
- PostgreSQL database support
- CORS configuration for frontend integration
- Production-ready settings with environment variables
