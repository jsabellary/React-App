FlightFinderReact

Projects
- FlightFinder.Server (.NET 8 API)
- FlightFinder.Shared (.NET Standard 2.1 models)
- FlightFinder.React (Vite + React 18 + TS UI)

Local development
- Server
  - dotnet build FlightFinder.Server
  - dotnet run --project FlightFinder.Server
- React (dev)
  - cd FlightFinder.React
  - npm install
  - npm run dev

Vite proxy
- Dev proxy points to http://localhost:52875 (see FlightFinder.React/vite.config.ts)

Production build
- React build with API base URL
  - On PowerShell: $env:VITE_API_BASE = "https://your-api-host"; npm run build
  - On bash: VITE_API_BASE=https://your-api-host npm run build
  - Output: FlightFinder.React/dist
- Server publish
  - dotnet publish FlightFinder.Server -c Release -r linux-x64 -o publish

CORS
- Server currently allows any origin. Lock this down before production by replacing AllowAnyOrigin with your CloudFront/SPA domain.

Deploy (AWS free tier friendly)
- React: S3 static website + CloudFront
- Server: Elastic Beanstalk single-instance (t2.micro/t4g.micro)

## AWS Deployment Setup

### Plan (Free-Tier Friendly)
- **Frontend (React)**: S3 static website + CloudFront (Free Tier)
- **Backend (ASP.NET Core)**: Elastic Beanstalk single-instance (t2.micro or t4g.micro, Free Tier)
- **Shared**: Compiled into the Server; no separate deploy

### GitHub Actions Workflows
Two workflows are included for automated deployment on push to `main`:
- `.github/workflows/react-deploy.yml`: Builds React, uploads to S3, invalidates CloudFront
- `.github/workflows/server-deploy.yml`: Publishes .NET, deploys to Elastic Beanstalk

### AWS Setup (One-Time)

#### 1. S3 + CloudFront for React
- Create S3 bucket (e.g., `flightfinder-react-<id>`), Block Public Access ON
- Create CloudFront distribution:
  - Origin: the S3 bucket (use Origin Access Control, OAC)
  - Default Root Object: `index.html`
  - SPA 403/404 to `index.html` (custom error responses)
- Attach S3 bucket policy for OAC:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowCloudFrontOAC",
      "Effect": "Allow",
      "Principal": {
        "Service": "cloudfront.amazonaws.com"
      },
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::flightfinder-react-<id>/*",
      "Condition": {
        "StringEquals": {
          "AWS:SourceArn": "arn:aws:cloudfront::<account-id>:distribution/<dist-id>"
        }
      }
    }
  ]
}
```
- Note distribution ID and domain

#### 2. Elastic Beanstalk for Server
- Create EB Application: `FlightFinderReact`
- Create Environment: `flightfinderreact-env`
- Platform: .NET on Amazon Linux 2023
- Environment type: Single instance
- Instance type: t2.micro or t4g.micro
- Open inbound HTTP(80) (and HTTPS if you add a cert)

#### 3. GitHub OIDC (Recommended) or Access Keys
**Option A: OIDC (Recommended)**
- Add GitHub as an identity provider in AWS IAM and create a role:
  - Trust policy subject filter: `repo:<your-account>/<repo-name>:ref:refs/heads/main`
  - Permissions (restrict to your resources):
    - S3: put/sync to your bucket
    - CloudFront: CreateInvalidation on your distribution
    - Elastic Beanstalk: Deploy (UpdateEnvironment, CreateApplicationVersion)

**Option B: Access Keys (Less Secure)**
- Provide `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY`

### GitHub Secrets to Set

**For both workflows:**
- `AWS_REGION` (e.g., `us-east-1`)
- `AWS_ROLE_ARN` (if using OIDC) OR `AWS_ACCESS_KEY_ID` + `AWS_SECRET_ACCESS_KEY`

**React workflow:**
- `S3_BUCKET` (your S3 bucket name)
- `CLOUDFRONT_DISTRIBUTION_ID`
- `VITE_API_BASE` (your EB environment URL, e.g., `https://<env>.<region>.elasticbeanstalk.com`)

**Server workflow:**
- `EB_APP` (`FlightFinderReact`)
- `EB_ENV` (`flightfinderreact-env`)

### Build Artifacts/Config
- **React**: `.env.production` added as a template. Actions pipeline writes `VITE_API_BASE` before build.
- **Server**: Startup uses CORS AllowAnyOrigin now. For production, restrict to your CloudFront domain.

### Deploy
- Push to `main`:
  - React pipeline builds and syncs `dist/` to S3, then invalidates CloudFront
  - Server pipeline publishes and deploys to EB
- After first deploy:
  - Visit CloudFront domain to load the SPA
  - SPA calls your EB URL (`VITE_API_BASE`) for `/api/*`

Repo tips
- Keep these three projects together; Server references Shared.
- The legacy Blazor Client is not required for this repo.
