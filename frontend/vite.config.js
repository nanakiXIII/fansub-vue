import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'
import fs            from 'node:fs'
import path          from 'node:path'
import { execSync }  from 'node:child_process'

let gitHash = 'dev'
try { gitHash = execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim() } catch {}

// Sert les fichiers vidéo locaux sous /haikyu/* en supportant les Range requests
// (nécessaires pour la scrubbing / le seek dans le lecteur HTML5)
function localVideoPlugin(route, dir) {
  return {
    name: `local-video:${route}`,
    configureServer(server) {
      server.middlewares.use(route, (req, res, next) => {
        const filename = decodeURIComponent(req.url.slice(1))
        if (!filename) return next()

        const filePath = path.join(dir, filename)
        if (!fs.existsSync(filePath)) return next()

        const stat     = fs.statSync(filePath)
        const fileSize = stat.size
        const range    = req.headers['range']

        const baseHeaders = {
          'Content-Type':  'video/x-matroska',
          'Accept-Ranges': 'bytes',
          'Cache-Control': 'no-store',
        }

        if (range) {
          const match = range.match(/bytes=(\d+)-(\d*)/)
          if (!match) { res.writeHead(416); return res.end() }
          const start     = parseInt(match[1], 10)
          const end       = match[2] ? parseInt(match[2], 10) : fileSize - 1
          const chunkSize = end - start + 1
          res.writeHead(206, {
            ...baseHeaders,
            'Content-Range':  `bytes ${start}-${end}/${fileSize}`,
            'Content-Length': chunkSize,
          })
          fs.createReadStream(filePath, { start, end }).pipe(res)
        } else {
          res.writeHead(200, { ...baseHeaders, 'Content-Length': fileSize })
          fs.createReadStream(filePath).pipe(res)
        }
      })
    },
  }
}

export default defineConfig({
  define: {
    __GIT_HASH__: JSON.stringify(gitHash),
  },
  server: {
    host: true,
    allowedHosts: true,
    proxy: {
      '/api':       { target: 'http://localhost:3000', changeOrigin: true },
      '/uploads':   { target: 'http://localhost:3000', changeOrigin: true },
      '/media':     { target: 'http://localhost:3000', changeOrigin: true },
      '/socket.io': { target: 'http://localhost:3000', changeOrigin: true, ws: true },
    },
  },
  plugins: [
    vue(),
    localVideoPlugin('/haikyu',              'W:/HAIKYU!!'),
    localVideoPlugin('/danmachi',            'W:/DanMachi'),
    localVideoPlugin('/berserk-of-gluttony', 'W:/Berserk of Gluttony'),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
