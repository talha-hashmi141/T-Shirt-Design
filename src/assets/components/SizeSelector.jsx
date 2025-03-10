import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SizeSelector = ({ onClose, onNext }) => {
  const [sizeData, setSizeData] = useState({
    xs: 0,
    s: 0,
    m: 0,
    l: 0,
    xl: 0,
    xxl: 0
  });

  const [error, setError] = useState('');

  const handleQuantityChange = (size, value) => {
    // Ensure value is not negative
    const newValue = Math.max(0, parseInt(value) || 0);
    setSizeData(prev => ({
      ...prev,
      [size]: newValue
    }));
  };

  const handleSubmit = () => {
    // Check if at least one size is selected
    const totalQuantity = Object.values(sizeData).reduce((sum, qty) => sum + qty, 0);
    if (totalQuantity === 0) {
      setError('Please select at least one size');
      return;
    }

    // Clear any previous errors
    setError('');
    
    // Call the onNext prop with the size data
    onNext(sizeData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Select Sizes</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <div className="space-y-4">
          {Object.entries(sizeData).map(([size, quantity]) => (
            <div key={size} className="flex items-center justify-between">
              <label className="text-lg capitalize">{size}</label>
              <input
                type="number"
                min="0"
                value={quantity}
                onChange={(e) => handleQuantityChange(size, e.target.value)}
                className="w-20 p-2 border border-gray-300 rounded-lg text-center"
              />
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default SizeSelector; 