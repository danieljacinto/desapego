import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'cors-proxy',
      configureServer(server) {
        // Serve arquivos da pasta /public para o admin
        server.middlewares.use('/public-data', async (req, res, next) => {
          const { createReadStream, existsSync } = await import('fs')
          const filePath = path.join(__dirname, 'public', req.url)
          if (existsSync(filePath)) {
            res.setHeader('Content-Type', 'application/json')
            createReadStream(filePath).pipe(res)
          } else {
            next()
          }
        })

        // Proxy para o GitHub Pages (contorna CORS)
        server.middlewares.use('/gh-pages', async (req, res) => {
          try {
            const targetUrl = `https://danieljacinto.github.io${req.url}`
            const response = await fetch(targetUrl)
            const text = await response.text()
            res.setHeader('Content-Type', 'application/json')
            res.setHeader('Access-Control-Allow-Origin', '*')
            res.end(text)
          } catch {
            res.statusCode = 502
            res.end(JSON.stringify({ error: 'proxy error' }))
          }
        })
      }
    }
  ],
  root: 'admin',
  server: {
    fs: {
      allow: [__dirname]
    }
  },
  build: {
    outDir: '../dist-admin',
  },
})
