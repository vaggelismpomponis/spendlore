import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({

  // Force Vite to pre-bundle CJS packages that lack an ESM default export
  optimizeDeps: {
    include: ['react-joyride'],
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.png', 'favicon.ico', 'favicon.svg', 'apple-touch-icon.png', 'play-store-icon-512.png', 'spendlore-logo.png', 'spendlore-mark.png', 'spendlore-mark.svg', 'spendlore-full-logo.png', 'spendlore-full-logo-dark.png', 'spendlore-full-logo.svg', 'spendlore-full-logo-dark.svg', 'pwa-192x192.png', 'pwa-512x512.png'],
      manifest: {
        id: '/',
        scope: '/',
        name: 'Spendlore',
        short_name: 'Spendlore',
        description: 'Track your income and expenses easily.',
        theme_color: '#ffffff',
        background_color: '#0f0f0f',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: 'spendlore-logo.png',
            sizes: '1024x1024',
            type: 'image/png',
            purpose: 'any'
          }
        ],
        shortcuts: [
          {
            name: 'Add Expense',
            short_name: 'Expense',
            description: 'Quickly log a new expense',
            url: '/?action=add-expense',
            icons: [
              {
                src: 'pwa-192x192.png',
                sizes: '192x192',
                type: 'image/png'
              }
            ]
          },
          {
            name: 'Add Income',
            short_name: 'Income',
            description: 'Quickly log a new income',
            url: '/?action=add-income',
            icons: [
              {
                src: 'pwa-192x192.png',
                sizes: '192x192',
                type: 'image/png'
              }
            ]
          }
        ]
      },
      workbox: {
        clientsClaim: true,
        skipWaiting: true,
        cleanupOutdatedCaches: true,
      },
      devOptions: {
        enabled: false
      }
    })
  ],
  build: {
    // Disable source maps in production (security — avoids exposing source code)
    sourcemap: false,
    // Target ES2020 and Safari 14+ for flawless iOS WebKit compatibility
    target: ['es2020', 'safari14', 'ios14'],
    // Raise warning threshold (Capacitor apps naturally bundle more)
    chunkSizeWarningLimit: 2000,
    rollupOptions: {
      output: {
        // Manual chunk splitting for better caching and smaller initial bundle
        manualChunks: {
          'vendor-react':    ['react', 'react-dom'],
          'vendor-motion':   ['framer-motion'],
          'vendor-recharts': ['recharts'],
          'vendor-supabase': ['@supabase/supabase-js'],
          'vendor-sentry':   ['@sentry/react'],
          'vendor-tesseract': ['tesseract.js'],
          'vendor-tour':     ['react-joyride'],
        }
      }
    }
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/tests/setup.js',
    css: true,
    exclude: ['**/node_modules/**', '**/dist/**', '**/tests/**', '**/e2e/**'],
  }
})

