import React, { useEffect, useState } from 'react';
import { OrbitControls, Environment, Stage, Float } from '@react-three/drei';
import { Canvas, useLoader } from '@react-three/fiber';
import { TextureLoader } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { useNavigate } from 'react-router-dom';
import * as THREE from 'three';
import SideMenu from './SideMenu'; // Import SideMenu

const Experience = ({ setToken }) => {
  const navigate = useNavigate();

  const model = useLoader(GLTFLoader, './burger_box.glb');
  const pattern1 = useLoader(TextureLoader, './Pattern-01.jpg');
  const pattern2 = useLoader(TextureLoader, './Pattern-02.jpg');
  const pattern3 = useLoader(TextureLoader, './pattern-07.jpg');

  const [selectedPattern, setSelectedPattern] = useState(null); // Start with no texture
  const [selectedColor, setSelectedColor] = useState(null); // Default color is white
  const [useColor, setUseColor] = useState(true); // Default to using color, not texture

  const [repeatX, setRepeatX] = useState(2);
  const [repeatY, setRepeatY] = useState(2);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);

  const resetValues = () => {
    setRepeatX(2);
    setRepeatY(2);
    setOffsetX(0);
    setOffsetY(0);
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const texture = new THREE.TextureLoader().load(e.target.result);
        setSelectedPattern(texture);
        setUseColor(false); // Switch to texture mode
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    if (model) {
      model.scene.traverse((child) => {
        if (child.isMesh) {
          if (useColor) {
            // Use solid color
            child.material.map = null;
            child.material.color.set(selectedColor || "#969696"); // Default to white
          } else if (selectedPattern) {
            // Use texture if one is selected
            child.material.color.set("#969696"); // Set a base color

            child.material.map = selectedPattern;

            const texture = selectedPattern;
            texture.rotation = Math.PI; // Rotate the texture 90 degrees
            texture.wrapS = THREE.RepeatWrapping;
            texture.wrapT = THREE.RepeatWrapping;
            texture.repeat.set(repeatX, repeatY);
            texture.offset.set(offsetX, offsetY);
          }
          child.material.needsUpdate = true;
        }
      });
    }
  }, [model, selectedPattern, repeatX, repeatY, offsetX, offsetY, selectedColor, useColor]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    navigate('/login');
  };

  return (
    <>
      {/* Logout Button */}
      <div className="absolute top-4 right-4 z-50">
        <button
          onClick={handleLogout}
          className="bg-black text-white p-2 px-3 rounded-lg hover:bg-red-600 "
        >
          Logout
        </button>
      </div>

      <SideMenu
        setSelectedPattern={setSelectedPattern}
        setUseColor={setUseColor}
        pattern1={pattern1}
        pattern2={pattern2}
        pattern3={pattern3}
        repeatX={repeatX}
        setRepeatX={setRepeatX}
        repeatY={repeatY}
        setRepeatY={setRepeatY}
        offsetX={offsetX}
        setOffsetX={setOffsetX}
        offsetY={offsetY}
        setOffsetY={setOffsetY}
        resetValues={resetValues}
        handleImageUpload={handleImageUpload}
        selectedColor={selectedColor}
        setSelectedColor={setSelectedColor}
      />

      <Canvas className="bg-[#000000dc]">
        <Stage environment={null} intensity={1} preset="rembrandt" shadows>
          <Float>

          <primitive object={model.scene}
          //  scale={0.5} position={[0.4, -1, 0]}
          />
          </Float>
        </Stage>
        <OrbitControls />
        <Environment preset="city" backgroundBlurriness={10} background={false} />
      </Canvas>
    </>
  );
};

export default Experience;
