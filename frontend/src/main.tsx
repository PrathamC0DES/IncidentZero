import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import DistortionDemo from './DistortionDemo.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <DistortionDemo />
  </StrictMode>,
)
