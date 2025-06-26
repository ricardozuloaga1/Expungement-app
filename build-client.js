import { build } from 'esbuild';
import { copyFileSync, mkdirSync, existsSync, readdirSync, statSync } from 'fs';
import path from 'path';

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

    // Copy HTML file
    copyFileSync('client/index.html', 'dist/public/index.html');
    
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
        '.ts': 'tsx',
        '.jsx': 'jsx',
        '.js': 'jsx',
        '.css': 'css',
        '.png': 'file',
        '.jpg': 'file',
        '.jpeg': 'file',
        '.gif': 'file',
        '.svg': 'file',
      },
      define: {
        'process.env.NODE_ENV': '"production"',
        global: 'globalThis',
      },
      external: [],
      platform: 'browser',
      splitting: true,
      write: true,
      publicPath: '/',
      assetNames: 'assets/[name]-[hash][ext]',
    });

    console.log('✅ Client build completed successfully');
  } catch (error) {
    console.error('❌ Client build failed:', error);
    process.exit(1);
  }
}

buildClient(); 