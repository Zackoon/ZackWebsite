import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <h1 className='text-blue-300'>Hey!</h1>
      <button className="btn">Click here</button>
    </>
  )
}

export default App
