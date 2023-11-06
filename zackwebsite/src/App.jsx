import { useState } from 'react'
import './App.css'
import ThreeJSScene from './components/ThreeJSScene'


function App() {
  const [count, setCount] = useState(0)

  return (
    <>
    <ThreeJSScene />
    </>
  )
}

export default App
