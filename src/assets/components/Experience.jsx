import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { useLoader } from '@react-three/fiber';
import React, { useEffect } from 'react';
import { TextureLoader } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const Experience = () => {
  const model = useLoader(GLTFLoader, "./burger_box.glb"); 
  const colorMap = useLoader(TextureLoader, './Fabric008_2K-PNG/Patterns-02.webp');

  // Apply texture to the model after loading
  useEffect(() => {
    model.scene.traverse((child) => {
      if (child.isMesh) {
        child.material.map = colorMap;
        child.material.map.wrapS = THREE.RepeatWrapping; // Repeat wrapping for horizontal
        child.material.map.wrapT = THREE.RepeatWrapping; // Repeat wrapping for vertical
        child.material.map.repeat.set(1, 1); // Adjust repeat values (u,v) to scale texture
        child.material.map.offset.set(2, 2); // Adjust offset if the texture is misplaced
        child.material.needsUpdate = true; // Update the material
      }
    });0
  }, [model, colorMap]);

  return (
    <>
      <mesh>
        <ambientLight intensity={2} />
        {/* <directionalLight intensity={10} position={[-0.1,-0.1,-1.8]} /> */}
        <primitive object={model.scene} scale={8} />
        <OrbitControls />
      </mesh>
    </>
  );
}

export default Experience;
