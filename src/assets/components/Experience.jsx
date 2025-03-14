import React, { useEffect, useState } from 'react';
import { OrbitControls, Environment, Stage, Float } from '@react-three/drei';
import { Canvas, useLoader } from '@react-three/fiber';
import { TextureLoader } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { useNavigate } from 'react-router-dom';
import * as THREE from 'three';
import SideMenu from './SideMenu'; // Import SideMenu
import Settings from './Settings';
import { FaCog } from 'react-icons/fa'; // Install react-icons if not already installed
import SizeSelector from './SizeSelector';
import Checkout from './Checkout';

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

  const [showSettings, setShowSettings] = useState(false);
  const [showSizeSelector, setShowSizeSelector] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [sizeData, setSizeData] = useState(null);
  const [designImage, setDesignImage] = useState(null);

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
    localStorage.removeItem('isAdmin');
    setToken(null);
    navigate('/login');
  };

  const captureDesign = () => {
    const canvas = document.querySelector('canvas');
    if (canvas) {
      const image = canvas.toDataURL('image/png');
      setDesignImage(image);
    }
  };

  const handleSizeSubmit = (data) => {
    setSizeData(data);
    captureDesign();
    setShowSizeSelector(false);
    setShowCheckout(true);
  };

  return (
    <>
      {/* Top Bar */}
      <div className="absolute top-4 right-4 z-50 flex items-center gap-4">
        <button
          onClick={() => setShowSettings(true)}
          className="bg-black text-white p-2 rounded-lg hover:bg-gray-800"
          title="Settings"
        >
          <FaCog size={20} />
        </button>
        <button
          onClick={handleLogout}
          className="bg-black text-white p-2 px-3 rounded-lg hover:bg-red-600"
        >
          Logout
        </button>
      </div>

      {/* Add Next button */}
      <div className="absolute bottom-4 right-4 z-50">
        <button
          onClick={() => setShowSizeSelector(true)}
          className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800"
        >
          Next
        </button>
      </div>

      {/* Settings Modal */}
      {showSettings && <Settings onClose={() => setShowSettings(false)} />}

      {/* Modals */}
      {showSizeSelector && (
        <SizeSelector 
          onClose={() => setShowSizeSelector(false)}
          onNext={handleSizeSubmit}
        />
      )}
      {showCheckout && (
        <Checkout
          onClose={() => {
            setShowCheckout(false);
            setSizeData(null);
            setDesignImage(null);
          }}
          sizeData={sizeData}
          designImage={designImage}
        />
      )}

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

            <primitive object={model.scene} />
        </Stage>
        <OrbitControls />
        <Environment preset="city" backgroundBlurriness={10} background={false} />
      </Canvas>
    </>
  );
};

export default Experience;
