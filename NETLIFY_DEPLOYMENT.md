# Netlify Deployment Guide

This guide will help you deploy your NY Expungement Helper application to Netlify.

## Prerequisites

1. A Netlify account (free tier is sufficient)
2. Your application code in a Git repository (GitHub, GitLab, or Bitbucket)
3. Environment variables configured

## Step 1: Prepare Your Repository

1. **Commit all changes to your repository:**
   ```bash
   git add .
   git commit -m "Prepare for Netlify deployment"
   git push origin main
   ```

## Step 2: Deploy to Netlify

### Option A: Deploy from Git (Recommended)

1. **Go to [Netlify](https://netlify.com) and sign in**
2. **Click "New site from Git"**
3. **Connect your Git provider** (GitHub, GitLab, or Bitbucket)
4. **Select your repository**
5. **Configure build settings:**
   - **Build command:** `npm run build`
   - **Publish directory:** `dist/public`
   - **Functions directory:** `netlify/functions`

### Option B: Deploy from CLI

1. **Install Netlify CLI:**
   ```bash
   npm install -g netlify-cli
   ```

2. **Login to Netlify:**
   ```bash
   netlify login
   ```

3. **Deploy:**
   ```bash
   netlify deploy --prod
   ```

## Step 3: Configure Environment Variables

In your Netlify dashboard:

1. **Go to Site settings > Environment variables**
2. **Add the following variables:**

### Required Environment Variables

```
OPENAI_API_KEY=your-openai-api-key-here
NODE_ENV=production
```

### Optional Environment Variables (for database)

```
DATABASE_URL=your-database-url
SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
JWT_SECRET=your-jwt-secret
```

### Stripe Configuration (if using payments)

```
STRIPE_SECRET_KEY=your-stripe-secret-key
STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key
STRIPE_WEBHOOK_SECRET=your-stripe-webhook-secret
```

## Step 4: Configure Custom Domain (Optional)

1. **In Netlify dashboard, go to Domain settings**
2. **Add your custom domain**
3. **Configure DNS records as instructed by Netlify**

## Step 5: Test Your Deployment

1. **Visit your Netlify URL**
2. **Test the main functionality:**
   - User registration/login
   - Questionnaire completion
   - Chat functionality
   - PDF generation

## Build Configuration

The application uses the following build configuration:

- **Build command:** `npm run build`
- **Publish directory:** `dist/public`
- **Functions directory:** `netlify/functions`
- **Node version:** 18

## File Structure for Netlify

```
your-app/
├── netlify.toml                 # Netlify configuration
├── netlify/
│   └── functions/
│       └── api.js              # API handler
├── dist/
│   └── public/                 # Built client files
├── package.json
└── ... (other files)
```

## Troubleshooting

### Common Issues

1. **Build fails:**
   - Check Node.js version (should be 18)
   - Verify all dependencies are in package.json
   - Check build logs in Netlify dashboard

2. **API routes not working:**
   - Verify netlify.toml redirects are correct
   - Check function logs in Netlify dashboard
   - Ensure environment variables are set

3. **Static assets not loading:**
   - Verify publish directory is `dist/public`
   - Check file paths in your code
   - Ensure assets are copied during build

### Debugging

1. **Check function logs:**
   - Go to Functions tab in Netlify dashboard
   - Click on your function to see logs

2. **Check build logs:**
   - Go to Deploys tab
   - Click on a deploy to see build logs

## Performance Optimization

1. **Enable Netlify's CDN** (automatic)
2. **Configure caching headers** (already set in netlify.toml)
3. **Use Netlify's image optimization** for static assets
4. **Enable compression** (automatic)

## Security Considerations

1. **Never commit API keys** to your repository
2. **Use environment variables** for sensitive data
3. **Enable HTTPS** (automatic with Netlify)
4. **Configure security headers** if needed

## Monitoring

1. **Use Netlify Analytics** to monitor usage
2. **Set up error tracking** (Sentry, etc.)
3. **Monitor function performance** in Netlify dashboard

## Support

- **Netlify Documentation:** https://docs.netlify.com/
- **Netlify Community:** https://community.netlify.com/
- **Function logs:** Available in Netlify dashboard

---

**Note:** This deployment uses Netlify Functions for serverless API handling. The application will automatically scale based on usage.
