import React, { useState, useEffect } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import API, { AUTH_API } from '../../Api';
import { useNavigate } from 'react-router-dom';

const settingsSchema = Yup.object().shape({
  fullName: Yup.string().required('Full name is required'),
  phone: Yup.string().required('Phone number is required'),
  address: Yup.string(),
  defaultDeliveryMethod: Yup.string().required('Delivery method is required')
});

const Settings = ({ onClose }) => {
  const [userInfo, setUserInfo] = useState(null);
  const [orders, setOrders] = useState([]);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' or 'orders'
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        // Fetch user profile
        const profileResponse = await AUTH_API.get('/profile');
        if (profileResponse.data) {
          setUserInfo({
            email: profileResponse.data.email,
            ...profileResponse.data.deliveryInfo
          });
        }

        // Fetch user orders
        const ordersResponse = await API.get('/orders');
        if (ordersResponse.data) {
          setOrders(ordersResponse.data);
        }

        setStatus({ type: '', message: '' });
      } catch (error) {
        console.error('Error fetching user data:', error);
        if (error.response?.status === 401) {
          navigate('/login');
        } else {
          setStatus({
            type: 'error',
            message: 'Failed to load user information'
          });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      await AUTH_API.put('/update-profile', {
        fullName: values.fullName,
        phone: values.phone,
        address: values.address,
        defaultDeliveryMethod: values.defaultDeliveryMethod
      });

      setStatus({
        type: 'success',
        message: 'Information saved successfully'
      });
      setUserInfo({
        ...userInfo,
        ...values
      });
    } catch (error) {
      console.error('Save error:', error);
      if (error.response?.status === 401) {
        navigate('/login');
      } else {
        setStatus({
          type: 'error',
          message: error.response?.data?.error || 'Failed to save information'
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Account Settings</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b mb-6">
          <button
            className={`py-2 px-4 mr-2 ${
              activeTab === 'profile'
                ? 'border-b-2 border-black font-semibold'
                : 'text-gray-500'
            }`}
            onClick={() => setActiveTab('profile')}
          >
            Profile
          </button>
          <button
            className={`py-2 px-4 ${
              activeTab === 'orders'
                ? 'border-b-2 border-black font-semibold'
                : 'text-gray-500'
            }`}
            onClick={() => setActiveTab('orders')}
          >
            Orders
          </button>
        </div>

        {status.message && (
          <div className={`mb-4 p-3 rounded-lg ${
            status.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {status.message}
          </div>
        )}

        {activeTab === 'profile' ? (
          <>
            <div className="mb-4 p-3 bg-gray-100 rounded-lg">
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <p className="mt-1 text-gray-900">{userInfo?.email}</p>
            </div>

            <Formik
              initialValues={{
                fullName: userInfo?.fullName || '',
                phone: userInfo?.phone || '',
                address: userInfo?.address || '',
                defaultDeliveryMethod: userInfo?.defaultDeliveryMethod || 'delivery'
              }}
              validationSchema={settingsSchema}
              onSubmit={handleSubmit}
              enableReinitialize
            >
              {({ isSubmitting }) => (
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
                      Default Delivery Method
                    </label>
                    <Field
                      as="select"
                      name="defaultDeliveryMethod"
                      className="w-full p-3 border border-gray-300 rounded-lg"
                    >
                      <option value="delivery">Home Delivery</option>
                      <option value="pickup">Pick Up</option>
                    </Field>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address
                    </label>
                    <Field
                      name="address"
                      as="textarea"
                      className="w-full p-3 border border-gray-300 rounded-lg"
                      rows="3"
                    />
                    <ErrorMessage name="address" component="div" className="text-red-500 mt-1" />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full p-3 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50"
                  >
                    {isSubmitting ? 'Saving...' : 'Save Information'}
                  </button>
                </Form>
              )}
            </Formik>
          </>
        ) : (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold mb-4">Your Orders</h3>
            {orders.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No orders found</p>
            ) : (
              orders.map((order) => (
                <div key={order.orderNumber} className="border rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold">Order #{order.orderNumber}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(order.status)}`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </div>
                  <div className="border-t pt-3">
                    <p className="text-sm text-gray-600">Total Items: {
                      Object.values(order.sizeData).reduce((sum, num) => sum + num, 0)
                    }</p>
                    <p className="font-semibold">Total: ${order.totalPrice}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Delivery Method:</p>
                      <p>{order.deliveryMethod}</p>
                    </div>
                    {order.deliveryMethod === 'delivery' && (
                      <div>
                        <p className="text-gray-600">Delivery Address:</p>
                        <p>{order.address}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings; 