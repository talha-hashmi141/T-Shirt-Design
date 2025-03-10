import React, { useState, useEffect } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import API, { AUTH_API } from '../../Api';
import OrderConfirmation from './OrderConfirmation';
import { useNavigate } from 'react-router-dom';

const checkoutSchema = Yup.object().shape({
  fullName: Yup.string().required('Full name is required'),
  phone: Yup.string().required('Phone number is required'),
  deliveryMethod: Yup.string().required('Please select a delivery method'),
  address: Yup.string().when('deliveryMethod', {
    is: (val) => val === 'delivery',
    then: () => Yup.string().required('Address is required'),
    otherwise: () => Yup.string()
  })
});

const Checkout = ({ onClose, sizeData, designImage }) => {
  const navigate = useNavigate();
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [orderNumber, setOrderNumber] = useState(null);
  const [error, setError] = useState('');
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  const totalItems = Object.values(sizeData).reduce((sum, num) => sum + Number(num), 0);
  const totalPrice = totalItems * 25; // Price per shirt is $25

  // Fetch user data including delivery info
  useEffect(() => {
    let mounted = true;

    const fetchUserData = async () => {
      try {
        const { data } = await AUTH_API.get('/profile');
        if (mounted) {
          setUserData(data);
          setLoading(false);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        if (mounted) {
          if (error.response?.status === 401) {
            // Only redirect if we're not already on the login page
            if (!window.location.pathname.includes('/login')) {
              navigate('/login');
            }
          } else {
            setError('Failed to load user data. Please try again.');
            setLoading(false);
          }
        }
      }
    };

    fetchUserData();

    return () => {
      mounted = false;
    };
  }, [navigate]);

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      setError('');

      // Save delivery info first
      try {
        await AUTH_API.put('/update-profile', {
          deliveryInfo: {
            fullName: values.fullName,
            phone: values.phone,
            address: values.address,
            defaultDeliveryMethod: values.deliveryMethod
          }
        });
      } catch (error) {
        console.error('Failed to save delivery info:', error);
      }

      // Place the order
      const orderData = {
        fullName: values.fullName,
        phone: values.phone,
        deliveryMethod: values.deliveryMethod,
        address: values.deliveryMethod === 'delivery' ? values.address : '',
        sizeData,
        totalPrice,
        designImage: designImage
      };

      const response = await API.post('/orders', orderData);

      if (response.data && response.data.orderNumber) {
        setOrderNumber(response.data.orderNumber);
        setShowConfirmation(true);
      } else {
        throw new Error('Order placement failed');
      }
    } catch (error) {
      console.error('Order error:', error);
      if (error.response?.status === 401) {
        setError('Your session has expired. Please login again.');
      } else {
        setError(error.response?.data?.error || 'Failed to place order. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
        <div className="bg-white rounded-lg p-8">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (showConfirmation) {
    return (
      <OrderConfirmation
        orderNumber={orderNumber}
        onBackToHome={() => {
          onClose();
          window.location.reload();
        }}
      />
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Checkout</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left side - Order Summary */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Order Summary</h3>
            <div className="bg-gray-100 p-4 rounded-lg">
              <img 
                src={designImage} 
                alt="Design Preview" 
                className="w-full h-48 object-contain mb-4"
              />
              <div className="space-y-2">
                {Object.entries(sizeData).map(([size, quantity]) => 
                  quantity > 0 && (
                    <div key={size} className="flex justify-between">
                      <span className="capitalize">{size}:</span>
                      <span>{quantity}</span>
                    </div>
                  )
                )}
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between font-semibold">
                    <span>Total Items:</span>
                    <span>{totalItems}</span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span>Total Price:</span>
                    <span>${totalPrice}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Delivery Details */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Delivery Details</h3>
            <Formik
              initialValues={{
                fullName: userData?.deliveryInfo?.fullName || '',
                phone: userData?.deliveryInfo?.phone || '',
                address: userData?.deliveryInfo?.address || '',
                deliveryMethod: userData?.deliveryInfo?.defaultDeliveryMethod || 'delivery'
              }}
              validationSchema={checkoutSchema}
              onSubmit={handleSubmit}
              enableReinitialize
            >
              {({ values, isSubmitting }) => (
                <Form className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name
                    </label>
                    <Field
                      name="fullName"
                      className="w-full p-3 border border-gray-300 rounded-lg"
                    />
                    <ErrorMessage name="fullName" component="div" className="text-red-500 mt-1" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <Field
                      name="phone"
                      className="w-full p-3 border border-gray-300 rounded-lg"
                    />
                    <ErrorMessage name="phone" component="div" className="text-red-500 mt-1" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Delivery Method
                    </label>
                    <Field
                      as="select"
                      name="deliveryMethod"
                      className="w-full p-3 border border-gray-300 rounded-lg"
                    >
                      <option value="delivery">Home Delivery</option>
                      <option value="pickup">Pick Up</option>
                    </Field>
                  </div>

                  {values.deliveryMethod === 'delivery' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Delivery Address
                      </label>
                      <Field
                        as="textarea"
                        name="address"
                        className="w-full p-3 border border-gray-300 rounded-lg"
                        rows="3"
                      />
                      <ErrorMessage name="address" component="div" className="text-red-500 mt-1" />
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full p-3 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50"
                  >
                    {isSubmitting ? 'Processing...' : 'Place Order'}
                  </button>
                </Form>
              )}
            </Formik>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout; 