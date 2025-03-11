import React, { useState, useEffect } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { AUTH_API } from '../../Api';

const settingsSchema = Yup.object().shape({
  username: Yup.string(),
  email: Yup.string().email('Invalid email'),
  currentPassword: Yup.string(),
  newPassword: Yup.string().min(6, 'Password must be at least 6 characters'),
  fullName: Yup.string(),
  phone: Yup.string(),
  address: Yup.string(),
  defaultDeliveryMethod: Yup.string()
});

const Settings = ({ onClose }) => {
  const [userData, setUserData] = useState(null);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setStatus({
            type: 'error',
            message: 'No authentication token found'
          });
          setLoading(false);
          return;
        }

        console.log('Fetching user data...');
        const { data } = await AUTH_API.get('/profile');
        console.log('User data received:', data);
        
        if (!data) {
          throw new Error('No data received from server');
        }

        setUserData(data);
        setStatus({ type: '', message: '' });
      } catch (error) {
        console.error('Error fetching user data:', error);
        setStatus({
          type: 'error',
          message: error.response?.data?.error || 'Failed to load user data. Please try again.'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      await AUTH_API.put('/update-profile', values);
      setStatus({
        type: 'success',
        message: 'Profile updated successfully'
      });
    } catch (error) {
      console.error('Update error:', error);
      setStatus({
        type: 'error',
        message: error.response?.data?.error || 'Failed to update profile'
      });
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Settings</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
        </div>

        {status.message && (
          <div className={`mb-4 p-3 rounded-lg ${
            status.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {status.message}
          </div>
        )}

        <Formik
          initialValues={{
            username: userData?.username || '',
            email: userData?.email || '',
            currentPassword: '',
            newPassword: '',
            fullName: userData?.deliveryInfo?.fullName || '',
            phone: userData?.deliveryInfo?.phone || '',
            address: userData?.deliveryInfo?.address || '',
            defaultDeliveryMethod: userData?.deliveryInfo?.defaultDeliveryMethod || 'delivery'
          }}
          validationSchema={settingsSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting }) => (
            <Form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Username
                </label>
                <Field
                  name="username"
                  className="w-full p-3 border border-gray-300 rounded-lg"
                />
                <ErrorMessage name="username" component="div" className="text-red-500 mt-1" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <Field
                  name="email"
                  type="email"
                  className="w-full p-3 border border-gray-300 rounded-lg"
                />
                <ErrorMessage name="email" component="div" className="text-red-500 mt-1" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Password
                </label>
                <Field
                  name="currentPassword"
                  type="password"
                  className="w-full p-3 border border-gray-300 rounded-lg"
                />
                <ErrorMessage name="currentPassword" component="div" className="text-red-500 mt-1" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Password
                </label>
                <Field
                  name="newPassword"
                  type="password"
                  className="w-full p-3 border border-gray-300 rounded-lg"
                />
                <ErrorMessage name="newPassword" component="div" className="text-red-500 mt-1" />
              </div>

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
                  Phone
                </label>
                <Field
                  name="phone"
                  className="w-full p-3 border border-gray-300 rounded-lg"
                />
                <ErrorMessage name="phone" component="div" className="text-red-500 mt-1" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <Field
                  name="address"
                  as="textarea"
                  className="w-full p-3 border border-gray-300 rounded-lg"
                />
                <ErrorMessage name="address" component="div" className="text-red-500 mt-1" />
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

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full p-3 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50"
              >
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </button>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default Settings; 