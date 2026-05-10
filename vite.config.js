import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'
import path from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import compression from 'vite-plugin-compression'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export default defineConfig(({ mode, command }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const publicBasePath = env.VITE_PUBLIC_BASE_PATH || '/'

  return {
    logLevel: 'error',
    // Use an absolute root base by default so deep links like /c/demo load /assets/* correctly.
    // Override with VITE_PUBLIC_BASE_PATH when deploying under a subdirectory.
    base: publicBasePath,
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      }
    },
    plugins: [
      react(),
      ...(command === 'build'
        ? [
            compression({ algorithm: 'gzip', threshold: 1024 }),
            compression({ algorithm: 'brotliCompress', ext: '.br', threshold: 1024 }),
          ]
        : []),
    ],
    build: {
      chunkSizeWarningLimit: 300,
      // Target browsers that support native ESM + dynamic import + import.meta
      target: ['es2020', 'edge88', 'firefox78', 'chrome87', 'safari14'],
      // Explicit hashed filenames so stale caches never serve mismatched assets
      rollupOptions: {
        output: {
          entryFileNames: 'assets/[name]-[hash].js',
          chunkFileNames: 'assets/[name]-[hash].js',
          assetFileNames: 'assets/[name]-[hash].[ext]',
          manualChunks: {
            'vendor-react': ['react', 'react-dom', 'react-router-dom'],
            'vendor-query': ['@tanstack/react-query'],
            'vendor-motion': ['framer-motion'],
            'vendor-radix': [
              '@radix-ui/react-dialog',
              '@radix-ui/react-dropdown-menu',
              '@radix-ui/react-tabs',
              '@radix-ui/react-tooltip',
              '@radix-ui/react-select',
              '@radix-ui/react-popover',
            ],
            'vendor-recharts': ['recharts'],
            'vendor-supabase': ['@supabase/supabase-js'],
          },
        },
      },
    }
  }
})
