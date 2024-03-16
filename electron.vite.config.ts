import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    define: {
      "process.env.TESS_ENV": process.env.ENV,
    }
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
    define: {
      "process.env.TESS_ENV": process.env.ENV,
    }
  },
  renderer: {
    resolve: {
      alias: {
        '@renderer': resolve('src/renderer/src')
      }
    },
    plugins: [react()],
    define: {
      "process.env.TESS_ENV": process.env.ENV,
    }
  }
})
