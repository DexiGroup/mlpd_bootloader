import { createRoot } from 'react-dom/client'
import { StrictMode } from 'react'
import App from './Components/App'

const ROOT_ID = 'root'

function render() {
  const container = document.getElementById(ROOT_ID)
  if (container) {
    const root = createRoot(container)
    root.render(
      <StrictMode>
        <App />
      </StrictMode>
    )
  } else {
    throw new Error(`No root div with id '${ROOT_ID}'`)
  }
}

render()
