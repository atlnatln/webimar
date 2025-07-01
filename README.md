# Webimar - Web-based İmar Hesaplama Sistemi

A professional web-based building calculation system for urban planning and construction projects.

## Production Deployment

### Prerequisites
- Docker and Docker Compose
- PostgreSQL (if not using Docker)

### Quick Start with Docker

1. **Clone the repository**
   ```bash
   git clone https://github.com/atlnatln/webimar.git
   cd webimar
   ```

2. **Configure environment variables**
   ```bash
   # Backend configuration
   cp webimar-api/.env.production.template webimar-api/.env
   # Edit webimar-api/.env with your production settings
   
   # Frontend configuration  
   cp webimar-react/.env.production.template webimar-react/.env.production
   # Edit webimar-react/.env.production with your production settings
   ```

3. **Deploy with Docker Compose**
   ```bash
   docker-compose up -d
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8001

### Architecture
- **Frontend**: React TypeScript application with Leaflet maps
- **Backend**: Django REST API with PostgreSQL
- **Cache**: Redis for performance optimization

### Production Features
- Multi-stage Docker builds for optimized images
- Non-root user containers for security
- Health checks for all services
- Production-ready Gunicorn WSGI server
- Static file optimization
- PostgreSQL database with persistent volumes

### Environment Configuration
See `.env.production.template` files in `webimar-api/` and `webimar-react/` directories for all available configuration options.

### Security Notes
- Change default database credentials
- Set strong SECRET_KEY for Django
- Configure ALLOWED_HOSTS appropriately
- Enable SSL in production (HTTPS)
- Review security headers and settings