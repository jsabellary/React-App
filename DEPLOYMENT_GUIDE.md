# FlightFinder React - AWS Deployment Guide

This guide provides detailed step-by-step instructions for deploying the FlightFinder React application to AWS using the free tier.

## Prerequisites

- AWS Account with free tier eligibility
- GitHub account with repository access
- AWS CLI installed (optional, for local testing)
- Basic understanding of AWS services

## Architecture Overview

```
┌─────────────────┐
│   CloudFront    │  ← Users access SPA here
│   Distribution  │
└────────┬────────┘
         │
    ┌────▼────┐
    │   S3    │  ← React static files
    │  Bucket │
    └─────────┘

┌─────────────────┐
│  React App (SPA)│  ← Makes API calls
└────────┬────────┘
         │
    ┌────▼────────┐
    │   Elastic   │  ← ASP.NET Core API
    │  Beanstalk  │
    └─────────────┘
```

## Deployment Steps

### Phase 1: AWS Infrastructure Setup

#### Step 1: Create S3 Bucket for React Frontend

1. Log into AWS Console
2. Navigate to **S3**
3. Click **Create bucket**
4. Configure bucket:
   - **Bucket name**: `flightfinder-react-<unique-id>` (e.g., `flightfinder-react-prod123`)
   - **AWS Region**: Choose your preferred region (e.g., `us-east-1`)
   - **Block Public Access settings**: Keep **all enabled** (we'll use CloudFront with OAC)
   - Leave other settings as default
5. Click **Create bucket**
6. **Note the bucket name** - you'll need it for GitHub Secrets

#### Step 2: Create CloudFront Distribution

1. Navigate to **CloudFront** in AWS Console
2. Click **Create distribution**
3. Configure origin:
   - **Origin domain**: Select your S3 bucket from the dropdown
   - **Origin access**: Select **Origin access control settings (recommended)**
   - Click **Create control setting**:
     - Name: `flightfinder-oac`
     - Keep other defaults
     - Click **Create**
   - **Origin path**: Leave empty
4. Configure default cache behavior:
   - **Viewer protocol policy**: Redirect HTTP to HTTPS
   - **Allowed HTTP methods**: GET, HEAD
   - **Cache policy**: CachingOptimized
   - Leave other settings as default
5. Configure settings:
   - **Default root object**: `index.html`
   - Leave other settings as default
6. Click **Create distribution**
7. After creation, **copy the Distribution ID and Distribution domain name** - you'll need both

#### Step 3: Configure S3 Bucket Policy for CloudFront OAC

1. CloudFront will show a banner with the bucket policy needed
2. Click **Copy policy** or use this template:

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
      "Resource": "arn:aws:s3:::flightfinder-react-<your-id>/*",
      "Condition": {
        "StringEquals": {
          "AWS:SourceArn": "arn:aws:cloudfront::<your-account-id>:distribution/<your-dist-id>"
        }
      }
    }
  ]
}
```

3. Replace placeholders:
   - `<your-id>`: Your S3 bucket suffix
   - `<your-account-id>`: Your AWS account ID (12 digits)
   - `<your-dist-id>`: Your CloudFront distribution ID
4. Go to your S3 bucket → **Permissions** tab
5. Scroll to **Bucket policy** → Click **Edit**
6. Paste the policy
7. Click **Save changes**

#### Step 4: Configure CloudFront Error Pages for SPA

React Router requires that all routes serve `index.html`:

1. Go to your CloudFront distribution
2. Click on the **Error pages** tab
3. Click **Create custom error response**
4. Configure for 403 errors:
   - **HTTP error code**: 403 Forbidden
   - **Customize error response**: Yes
   - **Response page path**: `/index.html`
   - **HTTP response code**: 200 OK
   - Click **Create**
5. Click **Create custom error response** again
6. Configure for 404 errors:
   - **HTTP error code**: 404 Not Found
   - **Customize error response**: Yes
   - **Response page path**: `/index.html`
   - **HTTP response code**: 200 OK
   - Click **Create**

#### Step 5: Create Elastic Beanstalk Application and Environment

1. Navigate to **Elastic Beanstalk** in AWS Console
2. Click **Create application**
3. Configure application:
   - **Application name**: `FlightFinderReact`
   - **Platform**: .NET Core on Linux
   - **Platform branch**: .NET 8 running on 64bit Amazon Linux 2023
   - **Platform version**: (Use recommended/latest)
4. **Application code**: Sample application (we'll deploy via GitHub Actions)
5. Click **Configure more options**
6. **Presets**: Select **Single instance (free tier eligible)**
7. Click **Edit** on **Instances**:
   - **Instance type**: `t2.micro` or `t4g.micro` (free tier eligible)
   - Click **Save**
8. Click **Edit** on **Capacity**:
   - **Environment type**: Single instance
   - Click **Save**
9. Click **Edit** on **Security**:
   - Select your EC2 key pair (optional, for SSH access)
   - Click **Save**
10. Click **Create app**
11. Wait 5-10 minutes for environment creation
12. **Note the environment name** (e.g., `flightfinderreact-env`) and **environment URL** - you'll need both

#### Step 6: Configure Security Group (Allow HTTP/HTTPS Traffic)

1. Go to **EC2** → **Security Groups**
2. Find the security group for your Elastic Beanstalk instance (name includes your environment name)
3. Click on the security group
4. Go to **Inbound rules** tab
5. Click **Edit inbound rules**
6. Ensure these rules exist:
   - Type: HTTP, Port: 80, Source: 0.0.0.0/0
   - Type: HTTPS, Port: 443, Source: 0.0.0.0/0 (if using HTTPS)
7. Click **Save rules**

### Phase 2: GitHub OIDC Setup (Recommended)

OIDC is more secure than access keys and doesn't require credential rotation.

#### Step 1: Create IAM Identity Provider

1. Navigate to **IAM** → **Identity providers**
2. Click **Add provider**
3. Configure:
   - **Provider type**: OpenID Connect
   - **Provider URL**: `https://token.actions.githubusercontent.com`
   - Click **Get thumbprint**
   - **Audience**: `sts.amazonaws.com`
4. Click **Add provider**

#### Step 2: Create IAM Role for GitHub Actions

1. Navigate to **IAM** → **Roles**
2. Click **Create role**
3. **Trusted entity type**: Web identity
4. Configure:
   - **Identity provider**: Select the provider you just created
   - **Audience**: `sts.amazonaws.com`
5. Click **Next**
6. Click **Create policy** (opens in new tab)
7. Use JSON editor and paste this policy (replace placeholders):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "S3Deploy",
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::flightfinder-react-<your-id>",
        "arn:aws:s3:::flightfinder-react-<your-id>/*"
      ]
    },
    {
      "Sid": "CloudFrontInvalidate",
      "Effect": "Allow",
      "Action": [
        "cloudfront:CreateInvalidation"
      ],
      "Resource": "arn:aws:cloudfront::<your-account-id>:distribution/<your-dist-id>"
    },
    {
      "Sid": "ElasticBeanstalkDeploy",
      "Effect": "Allow",
      "Action": [
        "elasticbeanstalk:CreateApplicationVersion",
        "elasticbeanstalk:DescribeApplicationVersions",
        "elasticbeanstalk:DescribeEnvironments",
        "elasticbeanstalk:UpdateEnvironment",
        "elasticbeanstalk:DescribeEvents"
      ],
      "Resource": [
        "arn:aws:elasticbeanstalk:*:*:application/FlightFinderReact",
        "arn:aws:elasticbeanstalk:*:*:applicationversion/FlightFinderReact/*",
        "arn:aws:elasticbeanstalk:*:*:environment/FlightFinderReact/*"
      ]
    },
    {
      "Sid": "S3ElasticBeanstalkBucket",
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject"
      ],
      "Resource": "arn:aws:s3:::elasticbeanstalk-*/*"
    },
    {
      "Sid": "GetCallerIdentity",
      "Effect": "Allow",
      "Action": "sts:GetCallerIdentity",
      "Resource": "*"
    }
  ]
}
```

8. Click **Next: Tags** → **Next: Review**
9. **Policy name**: `GitHubActionsFlightFinderPolicy`
10. Click **Create policy**
11. Return to the role creation tab and refresh the policies list
12. Search for and select `GitHubActionsFlightFinderPolicy`
13. Click **Next**
14. **Role name**: `GitHubActionsFlightFinderRole`
15. **Description**: "Role for GitHub Actions to deploy FlightFinder"
16. Click **Create role**

#### Step 3: Update Role Trust Policy

1. Find and open the role you just created
2. Go to **Trust relationships** tab
3. Click **Edit trust policy**
4. Replace the policy with this (update your repo):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::<your-account-id>:oidc-provider/token.actions.githubusercontent.com"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "token.actions.githubusercontent.com:aud": "sts.amazonaws.com"
        },
        "StringLike": {
          "token.actions.githubusercontent.com:sub": "repo:<your-github-username>/FlightFinderReact:ref:refs/heads/main"
        }
      }
    }
  ]
}
```

5. Replace:
   - `<your-account-id>`: Your AWS account ID
   - `<your-github-username>`: Your GitHub username or organization
6. Click **Update policy**
7. **Copy the Role ARN** - you'll need it for GitHub Secrets

### Phase 3: Configure GitHub Secrets

1. Go to your GitHub repository
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret** for each of these:

#### Required Secrets for Both Workflows:

- **Name**: `AWS_REGION`
  - **Value**: Your AWS region (e.g., `us-east-1`)

- **Name**: `AWS_ROLE_ARN`
  - **Value**: The ARN of the IAM role you created (e.g., `arn:aws:iam::123456789012:role/GitHubActionsFlightFinderRole`)

#### Required Secrets for React Workflow:

- **Name**: `S3_BUCKET`
  - **Value**: Your S3 bucket name (e.g., `flightfinder-react-prod123`)

- **Name**: `CLOUDFRONT_DISTRIBUTION_ID`
  - **Value**: Your CloudFront distribution ID (e.g., `E1234567890ABC`)

- **Name**: `VITE_API_BASE`
  - **Value**: Your Elastic Beanstalk environment URL (e.g., `http://flightfinderreact-env.us-east-1.elasticbeanstalk.com`)
  - **Note**: Use `http://` for initial setup, upgrade to `https://` later if you add SSL

#### Required Secrets for Server Workflow:

- **Name**: `EB_APP`
  - **Value**: `FlightFinderReact`

- **Name**: `EB_ENV`
  - **Value**: Your environment name (e.g., `flightfinderreact-env`)

### Phase 4: Deploy

#### Initial Deployment

1. Ensure all GitHub Secrets are configured correctly
2. Commit and push changes to the `main` branch:
   ```bash
   git add .
   git commit -m "Initial deployment setup"
   git push origin main
   ```
3. Go to **Actions** tab in GitHub
4. Watch both workflows run:
   - **Deploy React to S3 + CloudFront**
   - **Deploy Server to Elastic Beanstalk**
5. Wait for both to complete (5-10 minutes)

#### Verify Deployment

1. **Test Backend API**:
   - Visit: `http://<your-eb-env-url>/api/airports`
   - Should return JSON list of airports
   - Example: `http://flightfinderreact-env.us-east-1.elasticbeanstalk.com/api/airports`

2. **Test Frontend**:
   - Visit your CloudFront distribution domain
   - Example: `https://d111111abcdef8.cloudfront.net`
   - Should load the FlightFinder React application
   - Try searching for flights to ensure API connectivity

3. **Check Browser Console**:
   - Press F12 → Console tab
   - Should see no CORS errors
   - API calls should succeed

### Phase 5: Post-Deployment Configuration

#### Update CORS for Production (Recommended)

1. Edit `FlightFinder.Server/Startup.cs`
2. Replace the CORS configuration with:

```csharp
app.UseCors(builder => builder
    .WithOrigins("https://d111111abcdef8.cloudfront.net") // Your CloudFront domain
    .AllowAnyHeader()
    .AllowAnyMethod());
```

3. Commit and push to trigger redeployment

#### Add Custom Domain (Optional)

1. Register or use existing domain
2. In CloudFront:
   - Add Alternate Domain Name (CNAME)
   - Request/import SSL certificate via ACM
3. Update DNS records to point to CloudFront
4. Update GitHub Secret `VITE_API_BASE` if needed
5. Update CORS origins in Server

## Troubleshooting

### React Deployment Issues

**Problem**: CloudFront shows AccessDenied
- **Solution**: Verify S3 bucket policy allows CloudFront OAC
- Check the `AWS:SourceArn` in bucket policy matches your distribution

**Problem**: React routes return 404
- **Solution**: Verify CloudFront error pages are configured to redirect 403/404 to `/index.html`

**Problem**: API calls fail with CORS errors
- **Solution**: Verify `VITE_API_BASE` secret is set correctly and matches your EB URL

### Server Deployment Issues

**Problem**: Elastic Beanstalk health is red
- **Solution**: Check EB logs in AWS Console → Elastic Beanstalk → Logs
- Ensure security group allows HTTP traffic on port 80

**Problem**: GitHub Actions fails with permission errors
- **Solution**: Verify IAM role has correct permissions
- Check trust policy includes correct GitHub repository

**Problem**: Deployment succeeds but API returns 502
- **Solution**: Check EB instance logs
- Verify .NET 8 runtime is available on the platform

### General Issues

**Problem**: GitHub Actions workflow doesn't trigger
- **Solution**: Ensure workflows are on `main` branch
- Verify push is to `main` branch

**Problem**: Cannot assume AWS role
- **Solution**: Verify OIDC provider is configured
- Check role ARN in GitHub Secrets is correct
- Verify trust policy has correct repository name

## Cost Monitoring

### Free Tier Limits

- **S3**: 5GB storage, 20,000 GET requests, 2,000 PUT requests per month
- **CloudFront**: 1TB data transfer out, 10,000,000 HTTP/HTTPS requests per month
- **Elastic Beanstalk**: No additional charge (EC2 charges apply)
- **EC2**: 750 hours per month of t2.micro or t3.micro instances

### Monitor Costs

1. Set up AWS Billing Alerts:
   - Go to **Billing** → **Budgets**
   - Create a budget with email alerts
   - Set threshold (e.g., $5)

2. Enable Cost Explorer to track daily spending

3. Review free tier usage:
   - Go to **Billing** → **Free Tier**
   - Check usage against limits

## Maintenance

### Update Application

Simply push changes to `main` branch - GitHub Actions will automatically deploy.

### View Logs

- **React**: Check CloudFront access logs (optional, enable in distribution settings)
- **Server**: AWS Console → Elastic Beanstalk → Your environment → Logs → Request logs

### Rollback Deployment

- **React**: Use CloudFront invalidations and S3 versioning
- **Server**: Elastic Beanstalk → Application versions → Deploy previous version

## Security Best Practices

1. **Enable CloudWatch Logs** for Elastic Beanstalk
2. **Enable S3 versioning** for backup
3. **Restrict CORS** to your CloudFront domain only
4. **Use HTTPS** everywhere (CloudFront + EB with SSL)
5. **Rotate credentials** regularly if using access keys
6. **Enable AWS CloudTrail** for audit logging
7. **Use AWS WAF** with CloudFront for DDoS protection (optional)

## Next Steps

- [ ] Set up custom domain name
- [ ] Add SSL certificate to Elastic Beanstalk
- [ ] Configure CloudWatch alarms for monitoring
- [ ] Set up database if needed (RDS free tier)
- [ ] Implement caching strategies
- [ ] Add authentication (Cognito)
- [ ] Set up staging environment

## Support Resources

- [AWS Free Tier Documentation](https://aws.amazon.com/free/)
- [Elastic Beanstalk .NET Documentation](https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/dotnet-core-tutorial.html)
- [CloudFront Documentation](https://docs.aws.amazon.com/cloudfront/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [GitHub OIDC with AWS](https://docs.github.com/en/actions/deployment/security-hardening-your-deployments/configuring-openid-connect-in-amazon-web-services)
