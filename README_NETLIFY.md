# NY Expungement Helper - Netlify Deployment

This application is now configured for deployment on Netlify with serverless functions.

## 🚀 Quick Start

### 1. Deploy to Netlify
1. **Push your code to Git repository**
2. **Go to [Netlify](https://netlify.com)**
3. **Click "New site from Git"**
4. **Connect your repository**
5. **Configure build settings:**
   - Build command: `npm run build`
   - Publish directory: `dist/public`
   - Functions directory: `netlify/functions`

### 2. Set Environment Variables
In Netlify dashboard > Site settings > Environment variables:

**Required:**
```
OPENAI_API_KEY=your-openai-api-key-here
NODE_ENV=production
```

**Optional:**
```
JWT_SECRET=your-jwt-secret
DATABASE_URL=your-database-url
STRIPE_SECRET_KEY=your-stripe-key
```

### 3. Deploy
Click "Deploy site" and wait for the build to complete.

## 📁 Project Structure

```
your-app/
├── netlify.toml              # Netlify configuration
├── netlify/
│   └── functions/
│       └── api.js           # Serverless API handler
├── dist/
│   └── public/              # Built client files
├── client/                  # React frontend source
├── server/                  # Express backend source
└── shared/                  # Shared types/schemas
```

## 🔧 Configuration Files

- **`netlify.toml`** - Netlify build and redirect configuration
- **`netlify/functions/api.js`** - Serverless function for API routes
- **`package.json`** - Updated with Netlify build scripts

## 📚 Documentation

- **`NETLIFY_DEPLOYMENT.md`** - Detailed deployment guide
- **`ENVIRONMENT_VARIABLES.md`** - Environment variable configuration
- **`DEPLOYMENT_CHECKLIST.md`** - Step-by-step deployment checklist

## 🛠️ Build Commands

```bash
# Standard build
npm run build

# Netlify-specific build (includes asset copying)
npm run build:netlify

# Development
npm run dev
```

## 🌐 Features

- ✅ **Serverless API** - All backend routes via Netlify Functions
- ✅ **Static Site Generation** - Optimized client build
- ✅ **Environment Variables** - Secure configuration
- ✅ **CORS Support** - Cross-origin requests handled
- ✅ **Asset Optimization** - Cached static assets
- ✅ **HTTPS** - Automatic SSL certificates

## 🔍 Testing

After deployment, test:

1. **Site loads** - Visit your Netlify URL
2. **User registration** - Create an account
3. **Questionnaire** - Complete the assessment
4. **Chat functionality** - Test AI chat (requires OpenAI key)
5. **PDF generation** - Download assessment reports
6. **Sign out** - Test logout functionality

## 🚨 Troubleshooting

### Build Issues
- Check Node.js version (should be 18)
- Verify all dependencies in package.json
- Check build logs in Netlify dashboard

### API Issues
- Check function logs in Netlify dashboard
- Verify environment variables are set
- Test API endpoints directly

### Static Asset Issues
- Verify publish directory is `dist/public`
- Check file paths in your code
- Ensure assets are copied during build

## 📞 Support

- **Netlify Documentation:** https://docs.netlify.com/
- **Function Logs:** Available in Netlify dashboard
- **Build Logs:** Available in Netlify dashboard

---

**Ready to deploy?** Follow the `DEPLOYMENT_CHECKLIST.md` for a step-by-step guide!
