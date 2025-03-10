import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCheckCircle } from 'react-icons/fa';

const OrderConfirmation = ({ orderNumber, onBackToHome }) => {
  const navigate = useNavigate();

  useEffect(() => {
    // If there's no orderNumber, redirect to home
    if (!orderNumber) {
      navigate('/');
    }
  }, [orderNumber, navigate]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full text-center">
        <div className="flex flex-col items-center space-y-4">
          <FaCheckCircle className="text-green-500 text-6xl" />
          <h2 className="text-2xl font-bold">Order Confirmed!</h2>
          <p className="text-gray-600">
            Thank you for your order. We've sent a confirmation email with all the details.
          </p>
          <div className="bg-gray-100 p-4 rounded-lg w-full">
            <p className="text-sm text-gray-500">Order Number</p>
            <p className="text-xl font-bold text-gray-800">{orderNumber}</p>
          </div>
          <button
            onClick={onBackToHome}
            className="w-full p-3 bg-black text-white rounded-lg hover:bg-gray-800 mt-4"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation; 