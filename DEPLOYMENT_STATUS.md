# Deployment Configuration Complete ✅

## What Was Fixed

The server deployment workflow has been enhanced with necessary Elastic Beanstalk configuration files:

### Files Added/Modified

1. **Procfile** (NEW)
   - Tells Elastic Beanstalk how to run the .NET application
   - Configures the app to listen on port 5000 (required by EB)
   - Command: `dotnet ./FlightFinder.Server.dll --urls http://0.0.0.0:5000`

2. **.ebextensions/01_dotnet.config** (NEW)
   - Sets environment variables for production
   - Configures .NET runtime to use version 8.0
   - Sets ASPNETCORE_ENVIRONMENT to Production

3. **.github/workflows/server-deploy.yml** (MODIFIED)
   - Updated to include Procfile in deployment package
   - Updated to include .ebextensions folder in deployment package
   - These files are now automatically packaged in deployment.zip

## Deployment Readiness

✅ Workflow syntax validated
✅ .NET build process tested
✅ Deployment package creation tested
✅ Procfile and .ebextensions included in package

## Next Steps for Successful Deployment

### 1. Configure GitHub Secrets

Go to your GitHub repository → Settings → Secrets and variables → Actions

**Required Secrets:**

#### For Both Workflows (React + Server):
- `AWS_REGION` - Your AWS region (e.g., `us-east-1`)
- Either:
  - `AWS_ROLE_ARN` - For OIDC (recommended): `arn:aws:iam::ACCOUNT_ID:role/RoleName`
  - OR both of:
    - `AWS_ACCESS_KEY_ID`
    - `AWS_SECRET_ACCESS_KEY`

#### For React Workflow:
- `S3_BUCKET` - Your S3 bucket name
- `CLOUDFRONT_DISTRIBUTION_ID` - Your CloudFront distribution ID
- `VITE_API_BASE` - Your EB URL (e.g., `http://your-env.region.elasticbeanstalk.com`)

#### For Server Workflow:
- `EB_APP` - Application name: `FlightFinderReact`
- `EB_ENV` - Environment name (e.g., `flightfinderreact-env`)

### 2. Ensure AWS Resources Exist

**Elastic Beanstalk:**
- Application: `FlightFinderReact` (or your chosen name)
- Environment: `flightfinderreact-env` (or your chosen name)
- Platform: .NET Core on Linux (Amazon Linux 2023)
- Platform branch: .NET 8 running on 64bit Amazon Linux 2023

**S3 + CloudFront (for React):**
- S3 bucket configured for static website hosting
- CloudFront distribution pointing to S3 bucket

### 3. Deploy

**Option A: Push to main branch**
```bash
git checkout main
git merge copilot/deploy-server-using-yml
git push origin main
```

**Option B: Manually trigger workflow**
1. Go to GitHub repository → Actions tab
2. Select "Deploy Server to Elastic Beanstalk" workflow
3. Click "Run workflow" button
4. Select branch: `copilot/deploy-server-using-yml`
5. Click "Run workflow"

### 4. Monitor Deployment

1. Go to GitHub → Actions tab
2. Watch the "Deploy Server to Elastic Beanstalk" workflow
3. Check each step completes successfully:
   - ✅ Checkout code
   - ✅ Setup .NET
   - ✅ Restore dependencies
   - ✅ Publish .NET app
   - ✅ Create deployment package
   - ✅ Configure AWS credentials
   - ✅ Upload to S3
   - ✅ Create application version
   - ✅ Deploy to Elastic Beanstalk
   - ✅ Wait for deployment

### 5. Verify Deployment

After successful deployment:

**Test Backend API:**
```bash
# Replace with your actual EB environment URL
curl http://your-env.region.elasticbeanstalk.com/api/airports
```

Expected: JSON array of airports

**Test Frontend:**
Visit your CloudFront URL to see the React application

## Troubleshooting

### Common Issues

**Issue: "Cannot assume role"**
- Solution: Verify AWS_ROLE_ARN is correct and OIDC is set up
- Alternative: Use AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY instead

**Issue: "Application not found"**
- Solution: Verify EB_APP matches your Elastic Beanstalk application name

**Issue: "Environment not found"**
- Solution: Verify EB_ENV matches your Elastic Beanstalk environment name

**Issue: "Health check failed"**
- Solution: Check EB logs in AWS Console
- Verify the app starts correctly with Procfile configuration
- Ensure port 5000 is configured correctly

**Issue: "502 Bad Gateway"**
- Solution: Application might not be listening on correct port
- Check EB logs: AWS Console → Elastic Beanstalk → Logs
- Verify Procfile is included in deployment (should be automatic now)

## References

- [Full Deployment Guide](./DEPLOYMENT_GUIDE.md)
- [Deployment Checklist](./DEPLOYMENT_CHECKLIST.md)
- [Server Deploy Workflow](./.github/workflows/server-deploy.yml)
