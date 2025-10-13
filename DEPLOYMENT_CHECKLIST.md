# FlightFinder React - AWS Deployment Checklist

Quick reference checklist for deploying to AWS. See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for detailed instructions.

## Pre-Deployment Checklist

- [ ] AWS Account created and verified
- [ ] GitHub repository access confirmed
- [ ] Repository cloned locally (optional)
- [ ] Reviewed AWS Free Tier limits

## AWS Infrastructure Setup

### S3 + CloudFront (Frontend)

- [ ] **S3 Bucket Created**
  - [ ] Bucket name recorded: `____________________________`
  - [ ] Region selected: `____________________________`
  - [ ] Block Public Access enabled
  
- [ ] **CloudFront Distribution Created**
  - [ ] Origin set to S3 bucket
  - [ ] Origin Access Control (OAC) created and assigned
  - [ ] Default root object set to `index.html`
  - [ ] Distribution ID recorded: `____________________________`
  - [ ] Distribution domain recorded: `____________________________`
  
- [ ] **S3 Bucket Policy Applied**
  - [ ] Policy copied from CloudFront banner
  - [ ] Placeholders replaced (account ID, distribution ID)
  - [ ] Policy saved in S3 bucket permissions
  
- [ ] **CloudFront Error Pages Configured**
  - [ ] 403 → /index.html (200 OK)
  - [ ] 404 → /index.html (200 OK)

### Elastic Beanstalk (Backend)

- [ ] **EB Application Created**
  - [ ] Application name: `FlightFinderReact`
  - [ ] Platform: .NET Core on Linux
  - [ ] Platform version: .NET 8 on Amazon Linux 2023
  
- [ ] **EB Environment Created**
  - [ ] Environment name recorded: `____________________________`
  - [ ] Environment URL recorded: `____________________________`
  - [ ] Instance type: `t2.micro` or `t4g.micro`
  - [ ] Environment type: Single instance
  - [ ] Environment status: Green (Healthy)
  
- [ ] **Security Group Configured**
  - [ ] HTTP (port 80) inbound rule added
  - [ ] HTTPS (port 443) inbound rule added (if using SSL)

## GitHub OIDC Setup (Recommended)

- [ ] **IAM Identity Provider Created**
  - [ ] Provider URL: `https://token.actions.githubusercontent.com`
  - [ ] Audience: `sts.amazonaws.com`
  
- [ ] **IAM Policy Created**
  - [ ] Policy name: `GitHubActionsFlightFinderPolicy`
  - [ ] Permissions include:
    - [ ] S3 access to frontend bucket
    - [ ] CloudFront invalidation
    - [ ] Elastic Beanstalk deployment
    - [ ] S3 access to EB deployment bucket
    - [ ] STS GetCallerIdentity
  
- [ ] **IAM Role Created**
  - [ ] Role name: `GitHubActionsFlightFinderRole`
  - [ ] Policy attached: `GitHubActionsFlightFinderPolicy`
  - [ ] Trust policy configured for GitHub OIDC
  - [ ] Repository name in trust policy: `repo:_____________/FlightFinderReact:ref:refs/heads/main`
  - [ ] Role ARN recorded: `____________________________`

## Alternative: Access Keys Setup (Less Secure)

If not using OIDC:

- [ ] **IAM User Created** for GitHub Actions
- [ ] **Access Key Generated**
  - [ ] Access Key ID recorded: `____________________________`
  - [ ] Secret Access Key recorded (keep secure): `____________________________`
- [ ] **Policy Attached** to user (same as OIDC policy above)

## GitHub Secrets Configuration

### Shared Secrets (Both Workflows)

- [ ] `AWS_REGION` = `____________________________`
- [ ] `AWS_ROLE_ARN` = `____________________________` (if using OIDC)
  
  **OR** (if using access keys):
- [ ] `AWS_ACCESS_KEY_ID` = `____________________________`
- [ ] `AWS_SECRET_ACCESS_KEY` = `____________________________`

### React Workflow Secrets

- [ ] `S3_BUCKET` = `____________________________`
- [ ] `CLOUDFRONT_DISTRIBUTION_ID` = `____________________________`
- [ ] `VITE_API_BASE` = `____________________________`
  - Format: `http://your-eb-env.region.elasticbeanstalk.com`

### Server Workflow Secrets

- [ ] `EB_APP` = `FlightFinderReact`
- [ ] `EB_ENV` = `____________________________`

## Deployment Verification

### Initial Deployment

- [ ] **Pushed to main branch**
  ```bash
  git push origin main
  ```
  
- [ ] **GitHub Actions Triggered**
  - [ ] "Deploy React to S3 + CloudFront" workflow started
  - [ ] "Deploy Server to Elastic Beanstalk" workflow started
  
- [ ] **Workflows Completed Successfully**
  - [ ] React workflow: ✅ (green checkmark)
  - [ ] Server workflow: ✅ (green checkmark)

### Testing Backend

- [ ] **API Endpoint Accessible**
  - URL: `http://____________________________/api/airports`
  - [ ] Returns JSON array of airports
  - [ ] No error messages
  
- [ ] **API Search Endpoint Works**
  - URL: `http://____________________________/api/flightsearch`
  - [ ] POST request succeeds
  - [ ] Returns flight results

### Testing Frontend

- [ ] **CloudFront URL Accessible**
  - URL: `https://____________________________`
  - [ ] Page loads without errors
  - [ ] UI displays correctly
  
- [ ] **React Router Works**
  - [ ] Can navigate to different routes
  - [ ] Refresh on any route works (doesn't 404)
  
- [ ] **API Integration Works**
  - [ ] Airport list loads on page load
  - [ ] Flight search submits successfully
  - [ ] Results display correctly
  - [ ] No CORS errors in browser console (F12)

## Post-Deployment Configuration

- [ ] **CORS Tightened (Recommended)**
  - [ ] Updated `Startup.cs` to allow only CloudFront domain
  - [ ] Committed and pushed changes
  - [ ] Redeployment completed successfully
  
- [ ] **Cost Monitoring Setup**
  - [ ] Billing alerts configured
  - [ ] Budget set (e.g., $5 threshold)
  - [ ] Email notifications enabled
  
- [ ] **CloudWatch Logs Enabled** (Optional)
  - [ ] Elastic Beanstalk logs streaming to CloudWatch
  - [ ] S3 access logs enabled (optional)

## Optional Enhancements

- [ ] **Custom Domain Setup**
  - [ ] Domain registered/available
  - [ ] SSL certificate requested in ACM
  - [ ] CloudFront alternate domain configured
  - [ ] DNS records updated
  
- [ ] **HTTPS on Elastic Beanstalk**
  - [ ] SSL certificate added to load balancer
  - [ ] Environment upgraded to load balanced
  - [ ] `VITE_API_BASE` updated to use `https://`
  
- [ ] **Staging Environment**
  - [ ] Separate EB environment created
  - [ ] Separate S3 bucket and CloudFront distribution
  - [ ] GitHub workflow for staging branch

## Troubleshooting Checklist

If something isn't working, check:

- [ ] All GitHub Secrets are set correctly (no typos)
- [ ] IAM role/user has all required permissions
- [ ] Trust policy includes correct GitHub repository name
- [ ] S3 bucket policy allows CloudFront OAC
- [ ] CloudFront error pages are configured
- [ ] Elastic Beanstalk environment is healthy (green)
- [ ] Security group allows HTTP/HTTPS traffic
- [ ] CORS is configured in Server Startup.cs
- [ ] `VITE_API_BASE` matches Elastic Beanstalk URL exactly

## Documentation References

- [ ] Read [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for detailed steps
- [ ] Review [README.md](./README.md) for project overview
- [ ] Check GitHub Actions workflow files for deployment logic

## Final Verification

- [ ] **Application fully functional**
- [ ] **No AWS costs incurred** (within free tier)
- [ ] **Monitoring and alerts configured**
- [ ] **Documentation updated** with any custom changes
- [ ] **Team notified** of deployment URLs

---

## Quick Command Reference

### Deploy Manually (if needed)

**React:**
```bash
cd FlightFinder.React
echo "VITE_API_BASE=http://your-eb-url" > .env.production
npm install
npm run build
aws s3 sync dist/ s3://your-bucket-name/
aws cloudfront create-invalidation --distribution-id YOUR_DIST_ID --paths "/*"
```

**Server:**
```bash
dotnet publish FlightFinder.Server/FlightFinder.Server.csproj -c Release -r linux-x64 --self-contained false -o publish
cd publish && zip -r ../deployment.zip . && cd ..
# Then upload to EB via AWS Console or CLI
```

### View Logs

```bash
# Elastic Beanstalk logs
aws elasticbeanstalk request-environment-info --environment-name your-env-name --info-type tail

# Or via Console: EB → Environment → Logs → Request Logs
```

### Monitor Deployments

```bash
# Watch GitHub Actions
# Go to: https://github.com/your-username/FlightFinderReact/actions

# Check EB environment status
aws elasticbeanstalk describe-environments --environment-names your-env-name
```

---

**Deployment Date**: _______________  
**Deployed By**: _______________  
**CloudFront URL**: _______________  
**Backend URL**: _______________
