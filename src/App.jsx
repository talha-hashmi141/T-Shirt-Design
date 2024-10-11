import './App.css'
import { Canvas } from '@react-three/fiber'
import Experience from './assets/components/Experience'

function App() {

  return (
    <>
    <div className='h-lvh'>
      <Canvas>
       <Experience/>
      </Canvas>
    </div>
    </>
  )
}

export default App
