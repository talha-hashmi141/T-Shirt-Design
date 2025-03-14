import React from 'react';

const SideMenu = ({
  setSelectedPattern,
  setUseColor,
  pattern1,
  pattern2,
  pattern3,
  repeatX,
  setRepeatX,
  repeatY,
  setRepeatY,
  offsetX,
  setOffsetX,
  offsetY,
  setOffsetY,
  resetValues,
  handleImageUpload,
  selectedColor,
  setSelectedColor
}) => {
  return (
    <div className="absolute top-28 left-5 z-10 p-5 bg-gray-100/60 rounded-lg w-96 shadow-lg">
      <h3 className="text-lg font-semibold mb-3">Select Pattern</h3>
      <div className="flex justify-around mb-4">
        <button
          className="px-4 py-2 text-sm font-medium text-white bg-black rounded hover:bg-gray-900"
          onClick={() => {
            setSelectedPattern(pattern1);
            setUseColor(false);
          }}
        >
          Pattern 1
        </button>
        <button
          className="px-4 py-2 text-sm font-medium text-white bg-black rounded hover:bg-gray-900"
          onClick={() => {
            setSelectedPattern(pattern2);
            setUseColor(false);
          }}
        >
          Pattern 2
        </button>
        <button
          className="px-4 py-2 text-sm font-medium text-white bg-black rounded hover:bg-gray-900"
          onClick={() => {
            setSelectedPattern(pattern3);
            setUseColor(false);
          }}
        >
          Pattern 3
        </button>
      </div>
      <h3 className="text-lg font-semibold mb-3">Repeat</h3>
      <div className="mb-4">
        <label className="flex items-center justify-between">
          X:
          <input
            type="range"
            min="1"
            max="10"
            step="0.1"
            value={repeatX}
            onChange={(e) => setRepeatX(Number(e.target.value))}
            className="slider w-full mx-3"
            style={{ background: `linear-gradient(to right, black ${(repeatX - 1) * 11}%, white ${(repeatX - 1) * 11}%)` }}
          />
          <span>{repeatX.toFixed(1)}</span>
        </label>
      </div>
      <div className="mb-4">
        <label className="flex items-center justify-between">
          Y:
          <input
            type="range"
            min="1"
            max="10"
            step="0.1"
            value={repeatY}
            onChange={(e) => setRepeatY(Number(e.target.value))}
            className="slider w-full mx-3"
            style={{ background: `linear-gradient(to right, black ${(repeatY - 1) * 11}%, white ${(repeatY - 1) * 11}%)` }}
          />
          <span>{repeatY.toFixed(1)}</span>
        </label>
      </div>
      <h3 className="text-lg font-semibold mb-3">Offset</h3>
      <div className="mb-4">
        <label className="flex items-center justify-between">
          X:
          <input
            type="range"
            min="-1"
            max="1"
            step="0.01"
            value={offsetX}
            onChange={(e) => setOffsetX(Number(e.target.value))}
            className="slider w-full mx-3"
            style={{ background: `linear-gradient(to right, black ${(offsetX + 1) * 50}%, white ${(offsetX + 1) * 50}%)` }}
          />
          <span>{offsetX.toFixed(2)}</span>
        </label>
      </div>
      <div className="mb-4">
        <label className="flex items-center justify-between">
          Y:
          <input
            type="range"
            min="-1"
            max="1"
            step="0.01"
            value={offsetY}
            onChange={(e) => setOffsetY(Number(e.target.value))}
            className="slider w-full mx-3"
            style={{ background: `linear-gradient(to right, black ${(offsetY + 1) * 50}%, white ${(offsetY + 1) * 50}%)` }}
          />
          <span>{offsetY.toFixed(2)}</span>
        </label>
      </div>
      <button
        className="block w-full mb-4 px-4 py-2 text-sm font-medium text-white bg-black rounded hover:bg-red-600"
        onClick={resetValues}
      >
        Reset
      </button>
      
      <h3 className="text-lg font-semibold mb-3">Upload Pattern</h3>
      <input
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="w-full text-sm mb-4"
      />
      <h3 className="text-lg font-semibold mb-3">Select Color</h3>
      <input
        type="color"
        value={selectedColor}
        onChange={(e) => {
          setSelectedColor(e.target.value);
          setUseColor(true); // Switch to color mode
        }}
        className="w-full h-10 border rounded"
      />
    </div>
  );
};

export default SideMenu;