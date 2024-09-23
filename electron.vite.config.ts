import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()]
  },
  preload: {
    plugins: [externalizeDepsPlugin()]
  },
  renderer: {
    build: {
      rollupOptions: {
        input: {
          main: resolve(__dirname, 'src/renderer/index.html')
        }
      }
    },
    // resolve: {
    //   alias: {
    //     '@renderer': resolve('src/renderer/src')
    //   }
    // },
    // "extraFiles": [
    //   {
    //     "from": "dllFiles",
    //     "to": ".",
    //     "filter": ["*.dll"]
    //   }
    // ]

    plugins: [react()]
  }
})
