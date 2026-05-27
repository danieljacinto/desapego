import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

function getMimeType(filePath) {
  const ext = filePath.split('.').pop().toLowerCase()
  const types = {
    jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png',
    gif: 'image/gif', webp: 'image/webp', svg: 'image/svg+xml',
    json: 'application/json',
  }
  return types[ext] || 'application/octet-stream'
}

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'local-server',
      configureServer(server) {

        // Serve JSON da pasta /public
        server.middlewares.use('/public-data', async (req, res, next) => {
          const { createReadStream, existsSync } = await import('fs')
          const filePath = path.join(__dirname, 'public', decodeURIComponent(req.url))
          if (existsSync(filePath)) {
            res.setHeader('Content-Type', 'application/json')
            createReadStream(filePath).pipe(res)
          } else {
            next()
          }
        })

        // Serve imagens da pasta /public/images/ com decode de URI
        server.middlewares.use('/images', async (req, res, next) => {
          const { createReadStream, existsSync } = await import('fs')
          // decodeURIComponent trata espaços (%20) e caracteres especiais
          const decoded = decodeURIComponent(req.url)
          const filePath = path.join(__dirname, 'public', 'images', decoded)
          if (existsSync(filePath)) {
            res.setHeader('Content-Type', getMimeType(filePath))
            res.setHeader('Cache-Control', 'public, max-age=3600')
            createReadStream(filePath).pipe(res)
          } else {
            // tenta sem o leading slash
            const filePath2 = path.join(__dirname, 'public', 'images', decoded.replace(/^\//, ''))
            if (existsSync(filePath2)) {
              res.setHeader('Content-Type', getMimeType(filePath2))
              createReadStream(filePath2).pipe(res)
            } else {
              next()
            }
          }
        })

        // Proxy GitHub Pages
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
    fs: { allow: [__dirname] }
  },
  build: {
    outDir: '../dist-admin',
  },
})
