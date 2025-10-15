# Environment Variables for Netlify Deployment

## Required Variables

Add these environment variables in your Netlify dashboard (Site settings > Environment variables):

### OpenAI API Key (Required)
```
OPENAI_API_KEY=sk-proj-your-openai-api-key-here
```
**Purpose:** Enables AI chat functionality
**How to get:** Sign up at https://platform.openai.com/api-keys

### Application Environment
```
NODE_ENV=production
```
**Purpose:** Sets the application to production mode

## Optional Variables

### Database Configuration (if using external database)
```
DATABASE_URL=your-database-connection-string
SUPABASE_URL=your-supabase-project-url
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
```
**Purpose:** Connects to external database instead of using in-memory storage

### Authentication Security
```
JWT_SECRET=your-secure-random-string-here
```
**Purpose:** Secures JWT tokens for user authentication
**Generate:** Use a secure random string generator

### Stripe Payment Processing (if using payments)
```
STRIPE_SECRET_KEY=sk_test_your-stripe-secret-key
STRIPE_PUBLISHABLE_KEY=pk_test_your-stripe-publishable-key
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret
```
**Purpose:** Enables payment processing for premium features

## How to Add Variables in Netlify

1. **Go to your Netlify dashboard**
2. **Select your site**
3. **Go to Site settings > Environment variables**
4. **Click "Add variable"**
5. **Enter the variable name and value**
6. **Click "Save"**
7. **Redeploy your site** (variables take effect on next deploy)

## Security Notes

- **Never commit API keys to your repository**
- **Use environment variables for all sensitive data**
- **Rotate API keys regularly**
- **Use different keys for development and production**

## Testing Variables

After adding variables, test them by:

1. **Checking the chat functionality** (tests OpenAI API key)
2. **Testing user registration/login** (tests JWT secret)
3. **Verifying database connections** (if using external database)
4. **Testing payment flows** (if using Stripe)

## Troubleshooting

### Variables Not Working?

1. **Check spelling** - variable names are case-sensitive
2. **Redeploy** - variables only take effect after deployment
3. **Check logs** - look for environment variable errors in function logs
4. **Verify format** - ensure no extra spaces or quotes

### Common Issues

- **OpenAI API key invalid:** Check the key format and permissions
- **JWT errors:** Ensure JWT_SECRET is set and consistent
- **Database connection failed:** Verify DATABASE_URL format
- **Stripe errors:** Check API key format and webhook configuration
