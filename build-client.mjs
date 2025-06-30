import { build } from 'esbuild';
import { copyFileSync, mkdirSync, existsSync, readdirSync, statSync, readFileSync, writeFileSync } from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

function copyDirectory(src, dest) {
  if (!existsSync(dest)) {
    mkdirSync(dest, { recursive: true });
  }
  
  const items = readdirSync(src);
  
  for (const item of items) {
    const srcPath = path.join(src, item);
    const destPath = path.join(dest, item);
    
    if (statSync(srcPath).isDirectory()) {
      copyDirectory(srcPath, destPath);
    } else {
      copyFileSync(srcPath, destPath);
    }
  }
}

async function buildClient() {
  try {
    // Ensure output directory exists
    if (!existsSync('dist/public')) {
      mkdirSync('dist/public', { recursive: true });
    }

    // Copy assets directory if it exists
    if (existsSync('client/public/assets')) {
      copyDirectory('client/public/assets', 'dist/public/assets');
    }

    // Build the JavaScript/TypeScript
    await build({
      entryPoints: ['client/src/main.tsx'],
      bundle: true,
      outdir: 'dist/public',
      format: 'esm',
      target: 'es2020',
      minify: true,
      sourcemap: true,
      loader: {
        '.tsx': 'tsx',
        '.ts': 'ts',
        '.jsx': 'jsx',
        '.js': 'jsx',
        '.css': 'css',
        '.png': 'file',
        '.jpg': 'file',
        '.jpeg': 'file',
        '.gif': 'file',
        '.svg': 'file',
      },
      jsx: 'automatic',
      jsxImportSource: 'react',
      define: {
        'process.env.NODE_ENV': '"production"',
        'import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY': JSON.stringify(process.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_51RYyBO04uCBKkJtweqRQH19acbABDnlarnrSoRBG9vUq05xd2M3SAtsQV1t19oxoyePD3ekkUvPu0K855IINub6200tjSykymw'),
        'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || 'https://xssividnqebolxurgzpj.supabase.co'),
        'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhzc2l2aWRucWVib2x4dXJnenBqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEwNTQ4NzcsImV4cCI6MjA2NjYzMDg3N30.NiVyqoBXQc7FbxkhmJqDNTA0NAXHYoDczzLs1cKsCbM'),
        'import.meta.env.MODE': '"production"',
        'import.meta.env.DEV': 'false',
        'import.meta.env.PROD': 'true',
        global: 'globalThis',
      },
      external: [],
      platform: 'browser',
      splitting: true,
      write: true,
      publicPath: '/',
      assetNames: 'assets/[name]-[hash][ext]',
    });

    // Process CSS with PostCSS (Tailwind)
    console.log('📦 Processing CSS with Tailwind...');
    await execAsync('npx tailwindcss -i client/src/index.css -o dist/public/main.css --minify');

    // Update HTML file to point to built assets
    const htmlContent = readFileSync('client/index.html', 'utf8');
    const updatedHtml = htmlContent
      .replace(
        '<script type="module" src="/src/main.tsx"></script>',
        '<link rel="stylesheet" href="/main.css">\n    <script type="module" src="/main.js"></script>'
      )
      .replace(
        '<script type="text/javascript" src="https://replit.com/public/js/replit-dev-banner.js"></script>',
        ''
      );
    
    writeFileSync('dist/public/index.html', updatedHtml);

    console.log('✅ Client build completed successfully');
  } catch (error) {
    console.error('❌ Client build failed:', error);
    process.exit(1);
  }
}

buildClient(); 