# Netlify Deployment Checklist

## Pre-Deployment Checklist

### ✅ Code Preparation
- [ ] All code is committed to Git repository
- [ ] No sensitive data (API keys, secrets) in code
- [ ] All dependencies are in package.json
- [ ] Build process works locally (`npm run build`)

### ✅ Netlify Configuration
- [ ] `netlify.toml` file created
- [ ] `netlify/functions/api.js` created
- [ ] Build command: `npm run build`
- [ ] Publish directory: `dist/public`
- [ ] Functions directory: `netlify/functions`

### ✅ Environment Variables
- [ ] `OPENAI_API_KEY` set in Netlify dashboard
- [ ] `NODE_ENV=production` set
- [ ] Optional: Database variables if using external DB
- [ ] Optional: Stripe variables if using payments

## Deployment Steps

### 1. Connect Repository
- [ ] Go to Netlify dashboard
- [ ] Click "New site from Git"
- [ ] Connect your Git provider
- [ ] Select your repository

### 2. Configure Build Settings
- [ ] Build command: `npm run build`
- [ ] Publish directory: `dist/public`
- [ ] Functions directory: `netlify/functions`
- [ ] Node version: 18

### 3. Add Environment Variables
- [ ] Go to Site settings > Environment variables
- [ ] Add `OPENAI_API_KEY`
- [ ] Add `NODE_ENV=production`
- [ ] Add any other required variables

### 4. Deploy
- [ ] Click "Deploy site"
- [ ] Wait for build to complete
- [ ] Check build logs for errors

## Post-Deployment Testing

### ✅ Basic Functionality
- [ ] Site loads correctly
- [ ] User can register/login
- [ ] Questionnaire works
- [ ] Results page displays
- [ ] Sign out works

### ✅ API Endpoints
- [ ] `/api/auth/user` works
- [ ] `/api/questionnaire` works
- [ ] `/api/eligibility` works
- [ ] `/api/chat` works (if OpenAI key is set)

### ✅ Chat Functionality
- [ ] Chat widget appears
- [ ] Can send messages
- [ ] Receives AI responses
- [ ] No errors in console

### ✅ Static Assets
- [ ] Images load correctly
- [ ] CSS styles applied
- [ ] JavaScript functions work
- [ ] No 404 errors for assets

## Troubleshooting

### Build Fails
- [ ] Check Node.js version (should be 18)
- [ ] Verify all dependencies in package.json
- [ ] Check build logs for specific errors
- [ ] Ensure no missing files

### API Not Working
- [ ] Check function logs in Netlify dashboard
- [ ] Verify environment variables are set
- [ ] Check netlify.toml redirects
- [ ] Test API endpoints directly

### Static Assets Not Loading
- [ ] Verify publish directory is `dist/public`
- [ ] Check file paths in code
- [ ] Ensure assets are copied during build
- [ ] Check for case sensitivity issues

## Performance Optimization

### ✅ Caching
- [ ] Static assets cached properly
- [ ] API responses cached where appropriate
- [ ] CDN enabled (automatic with Netlify)

### ✅ Security
- [ ] HTTPS enabled (automatic)
- [ ] No sensitive data exposed
- [ ] CORS headers configured
- [ ] Security headers set

## Monitoring

### ✅ Analytics
- [ ] Netlify Analytics enabled
- [ ] Function performance monitored
- [ ] Error tracking set up (optional)
- [ ] Uptime monitoring (optional)

## Custom Domain (Optional)

### ✅ DNS Configuration
- [ ] Domain added in Netlify dashboard
- [ ] DNS records configured
- [ ] SSL certificate issued
- [ ] Domain redirects working

## Final Verification

- [ ] All functionality works in production
- [ ] No console errors
- [ ] Performance is acceptable
- [ ] Mobile responsiveness works
- [ ] All user flows complete successfully

---

**Note:** Keep this checklist handy for future deployments and updates!
