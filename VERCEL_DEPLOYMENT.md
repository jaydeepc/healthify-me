# Vercel Deployment Guide for Health Tracker

This guide explains how to deploy the Health Tracker application to Vercel.

## Prerequisites

1. A Vercel account (sign up at https://vercel.com)
2. Vercel CLI installed (optional): `npm install -g vercel`
3. MongoDB Atlas database (or any MongoDB instance accessible from the internet)

## Environment Variables

Before deploying, you need to set up the following environment variables in your Vercel project:

### Required Environment Variables

1. **MONGO_URI** - Your MongoDB connection string
   - Example: `mongodb+srv://username:password@cluster.mongodb.net/healthtracker?retryWrites=true&w=majority`

2. **NODE_ENV** - Set to `production`

3. **FRONTEND_PORT** - Frontend port (default: `16972`)

4. **BACKEND_PORT** - Backend port (default: `16973`)

5. **CORS_ORIGIN** - Your Vercel deployment URL
   - Example: `https://your-app.vercel.app`

### Optional Environment Variables

- **VITE_ORCHESTRATOR_SERVICE_BASE_URL** - If you're using external API services
- Any other custom environment variables your app uses

## Deployment Steps

### Option 1: Deploy via Vercel Dashboard (Recommended)

1. **Push your code to GitHub**
   ```bash
   git add .
   git commit -m "Prepare for Vercel deployment"
   git push origin main
   ```

2. **Import Project to Vercel**
   - Go to https://vercel.com/dashboard
   - Click "Add New..." → "Project"
   - Import your GitHub repository
   - Vercel will auto-detect the configuration from `vercel.json`

3. **Configure Environment Variables**
   - In the project settings, go to "Environment Variables"
   - Add all required environment variables listed above
   - Make sure to add them for Production, Preview, and Development environments

4. **Deploy**
   - Click "Deploy"
   - Vercel will build and deploy your application

### Option 2: Deploy via Vercel CLI

1. **Install Vercel CLI** (if not already installed)
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel
   ```
   
   For production deployment:
   ```bash
   vercel --prod
   ```

4. **Set Environment Variables**
   ```bash
   vercel env add MONGO_URI
   vercel env add NODE_ENV
   vercel env add FRONTEND_PORT
   vercel env add BACKEND_PORT
   vercel env add CORS_ORIGIN
   ```

## Post-Deployment Steps

### 1. Seed Health Metrics Data

After the first deployment, you need to seed the health metrics data:

**Option A: Using a local script with production database**
```bash
# Set MONGO_URI to your production database
export MONGO_URI="your-production-mongodb-uri"
node backend/scripts/seedHealthMetrics.js
```

**Option B: Create a one-time serverless function**
You can create a temporary API endpoint to seed data (remember to remove it after use for security).

### 2. Verify Deployment

1. Visit your Vercel deployment URL
2. Check that the frontend loads correctly
3. Test the "Add Entry" functionality to ensure metrics are available
4. Verify API endpoints are working: `https://your-app.vercel.app/health-tracker/api/health`

### 3. Update CORS Settings

Make sure to update the `CORS_ORIGIN` environment variable in Vercel to match your deployment URL.

## Project Structure for Vercel

```
healthify-me/
├── api/
│   └── index.js              # Serverless function entry point
├── frontend/
│   ├── dist/                 # Built frontend (generated)
│   ├── src/
│   └── package.json
├── backend/
│   ├── routes/
│   ├── models/
│   ├── middleware/
│   └── server.js
├── vercel.json               # Vercel configuration
├── .vercelignore            # Files to ignore during deployment
└── package.json
```

## Configuration Files

### vercel.json
- Defines build commands and output directory
- Configures serverless functions
- Sets up URL rewrites for API routes
- Configures caching headers

### api/index.js
- Serverless function that handles all API requests
- Connects to MongoDB on cold starts
- Uses Express.js middleware and routes from backend

## Troubleshooting

### Issue: "Cannot find module" errors
**Solution**: Make sure all dependencies are listed in `package.json` files (root, frontend, and backend)

### Issue: Database connection fails
**Solution**: 
- Verify `MONGO_URI` is correctly set in Vercel environment variables
- Ensure your MongoDB instance allows connections from Vercel's IP addresses
- For MongoDB Atlas, add `0.0.0.0/0` to the IP whitelist (or use Vercel's IP ranges)

### Issue: API routes return 404
**Solution**: 
- Check that the `rewrites` configuration in `vercel.json` is correct
- Verify the API routes in `backend/routes/` are properly exported

### Issue: Frontend shows blank page
**Solution**:
- Check browser console for errors
- Verify the `base` path in `frontend/vite.config.js` matches your deployment
- Ensure environment variables are set correctly

### Issue: CORS errors
**Solution**:
- Update `CORS_ORIGIN` environment variable to match your Vercel URL
- Check that the CORS middleware in `api/index.js` is configured correctly

## Custom Domain (Optional)

To use a custom domain:

1. Go to your Vercel project settings
2. Navigate to "Domains"
3. Add your custom domain
4. Update DNS records as instructed by Vercel
5. Update `CORS_ORIGIN` environment variable to include your custom domain

## Monitoring and Logs

- View deployment logs in the Vercel dashboard
- Check function logs under "Functions" tab
- Monitor performance and errors in the "Analytics" section

## Continuous Deployment

Vercel automatically deploys:
- **Production**: When you push to the `main` branch
- **Preview**: When you create a pull request

You can customize this behavior in the Vercel project settings.

## Important Notes

1. **Serverless Functions**: The backend runs as serverless functions with cold starts. First requests may be slower.

2. **Database Connection**: The connection is established on each cold start. Consider using connection pooling for better performance.

3. **File Storage**: Vercel's serverless functions are stateless. Don't store files on the filesystem; use external storage (S3, Cloudinary, etc.) if needed.

4. **Execution Limits**: 
   - Free tier: 10-second execution limit
   - Pro tier: 60-second execution limit
   - Adjust `maxDuration` in `vercel.json` if needed

5. **Environment Variables**: Always use environment variables for sensitive data. Never commit secrets to the repository.

## Support

For issues specific to Vercel deployment:
- Vercel Documentation: https://vercel.com/docs
- Vercel Support: https://vercel.com/support

For application-specific issues:
- Check the application logs in Vercel dashboard
- Review the GitHub repository issues
