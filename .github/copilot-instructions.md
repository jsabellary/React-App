# Copilot Instructions for FlightFinder React

## Project Overview

FlightFinder is a full-stack flight search application with a React frontend and .NET backend, designed for AWS deployment.

### Architecture
- **Frontend**: React 18 + TypeScript + Vite SPA
- **Backend**: ASP.NET Core 8 Web API
- **Shared**: .NET Standard 2.1 library for models
- **Deployment**: AWS (S3 + CloudFront for frontend, Elastic Beanstalk for backend)

## Technology Stack

### Frontend (FlightFinder.React)
- **Framework**: React 18.3.1
- **Build Tool**: Vite 7.1.9
- **Language**: TypeScript 5.6.2
- **Styling**: Bootstrap 5.3.8 + Custom CSS
- **Development Server**: Vite dev server on port 5173
- **Proxy**: API calls to `/api/*` proxied to `http://localhost:52875` in development

### Backend (FlightFinder.Server)
- **Framework**: ASP.NET Core 8 (.NET 8)
- **Language**: C#
- **API Style**: RESTful controllers
- **Port**: 52875 (local development)
- **CORS**: Currently allows all origins (should be restricted for production)

### Shared (FlightFinder.Shared)
- **Framework**: .NET Standard 2.1
- **Purpose**: Shared data models between frontend and backend

## Project Structure

```
FlightFinderReact/
├── .github/
│   └── workflows/           # CI/CD pipelines for AWS deployment
│       ├── react-deploy.yml # React → S3 + CloudFront
│       └── server-deploy.yml # .NET → Elastic Beanstalk
├── FlightFinder.React/      # Frontend application
│   ├── src/
│   │   ├── main.tsx        # React entry point
│   │   ├── styles/         # CSS stylesheets
│   │   ├── ui/             # React components
│   │   └── utils/          # Utility functions
│   ├── public/             # Static assets
│   ├── package.json
│   └── vite.config.ts
├── FlightFinder.Server/     # Backend API
│   ├── Controllers/
│   │   ├── AirportsController.cs
│   │   └── FlightSearchController.cs
│   ├── Program.cs
│   ├── Startup.cs
│   └── SampleData.cs
├── FlightFinder.Shared/     # Shared models
└── Documentation files (README, DEPLOYMENT_GUIDE, etc.)
```

## Development Workflow

### Local Development Setup

#### Backend (.NET Server)
```bash
# Build the server
dotnet build FlightFinder.Server

# Run the server (listens on http://localhost:52875)
dotnet run --project FlightFinder.Server
```

#### Frontend (React)
```bash
# Navigate to React directory
cd FlightFinder.React

# Install dependencies
npm install

# Start dev server (http://localhost:5173)
npm run dev
```

### Building for Production

#### React Build
```bash
cd FlightFinder.React

# Set API base URL for production
# PowerShell:
$env:VITE_API_BASE = "https://your-api-host"
npm run build

# Bash/Linux:
VITE_API_BASE=https://your-api-host npm run build

# Output: FlightFinder.React/dist/
```

#### .NET Publish
```bash
dotnet publish FlightFinder.Server -c Release -r linux-x64 -o publish
```

## Important Conventions

### API Endpoints
- All backend API routes are prefixed with `/api/`
- Examples:
  - `/api/airports` - Airport search/listing
  - `/api/flightsearch` - Flight search functionality

### Environment Variables
- **VITE_API_BASE**: Production API base URL for React app
- Set during build time via `.env.production` file
- GitHub Actions creates this file automatically during deployment

### CORS Configuration
- **Development**: All origins allowed
- **Production**: Should be restricted to CloudFront domain
- Configure in `FlightFinder.Server/Startup.cs`

### Styling
- Custom CSS in `FlightFinder.React/src/styles/`
- Uses CSS variables for theming
- Bootstrap 5 for base components
- Responsive design with mobile-first approach

## AWS Deployment

### Infrastructure
1. **Frontend**: S3 bucket + CloudFront distribution
   - Static files served via CloudFront CDN
   - Origin Access Control (OAC) for security
   - Custom error pages (403/404 → index.html) for SPA routing

2. **Backend**: Elastic Beanstalk single-instance environment
   - Platform: .NET 8 on Amazon Linux 2023
   - Instance type: t2.micro or t4g.micro (free tier)

### GitHub Actions Workflows
- **react-deploy.yml**: Triggered on push to `main`
  - Builds React app with production API base URL
  - Syncs `dist/` folder to S3
  - Invalidates CloudFront cache
  
- **server-deploy.yml**: Triggered on push to `main` or manual dispatch
  - Publishes .NET application
  - Creates deployment package (ZIP)
  - Deploys to Elastic Beanstalk

### Required GitHub Secrets
See `DEPLOYMENT_GUIDE.md` for full list. Key secrets:
- `AWS_REGION`: AWS region (e.g., us-east-1)
- `AWS_ROLE_ARN`: IAM role ARN for OIDC authentication
- `S3_BUCKET`: Frontend bucket name
- `CLOUDFRONT_DISTRIBUTION_ID`: CloudFront distribution ID
- `VITE_API_BASE`: Backend API URL
- `EB_APP`: Elastic Beanstalk application name
- `EB_ENV`: Elastic Beanstalk environment name

## Code Style Guidelines

### TypeScript/React
- Use functional components with hooks
- TypeScript for type safety
- Follow React best practices
- Keep components modular and reusable

### C#/.NET
- Follow standard .NET conventions
- Use async/await for asynchronous operations
- Controllers in `Controllers/` directory
- Keep business logic separate from controllers when possible

## Testing
- No automated test infrastructure currently exists
- Manual testing required for both frontend and backend
- Test API endpoints via browser or tools like Postman/curl

## Key Documentation Files
- **README.md**: Quick start and project overview
- **DEPLOYMENT_GUIDE.md**: Detailed AWS deployment steps
- **DEPLOYMENT_CHECKLIST.md**: Quick deployment checklist

## Common Tasks

### Adding a New API Endpoint
1. Add controller method in `FlightFinder.Server/Controllers/`
2. Define models in `FlightFinder.Shared/` if needed
3. Update CORS if restricting origins
4. Test locally before deploying

### Adding a New React Component
1. Create component in `FlightFinder.React/src/ui/`
2. Add necessary styling in `src/styles/`
3. Import and use in application
4. Ensure TypeScript types are properly defined

### Modifying Deployment
1. Update workflow files in `.github/workflows/`
2. Update GitHub secrets if new configuration needed
3. Test changes on push to `main` branch
4. Monitor GitHub Actions for deployment status

## Important Notes
- Keep `FlightFinder.Server` and `FlightFinder.Shared` together (Server references Shared)
- Legacy Blazor Client is not used in this repository
- Always use HTTPS in production for API endpoints
- CloudFront domain is the primary access point for users
- Free tier eligible with proper AWS configuration
