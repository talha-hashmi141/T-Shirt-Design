import React, { useState, useEffect } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { AUTH_API } from '../../Api';

const settingsSchema = Yup.object().shape({
  username: Yup.string().required('Username is required'),
  email: Yup.string().email('Invalid email').required('Email is required'),
  currentPassword: Yup.string().min(6, 'Password must be at least 6 characters'),
  newPassword: Yup.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: Yup.string().oneOf([Yup.ref('newPassword'), null], 'Passwords must match'),
  fullName: Yup.string(),
  phone: Yup.string(),
  address: Yup.string(),
  defaultDeliveryMethod: Yup.string()
});

const Settings = ({ onClose }) => {
  const [status, setStatus] = useState({ type: '', message: '' });
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data } = await AUTH_API.get('/profile');
        setUserData(data);
      } catch (err) {
        setStatus({
          type: 'error',
          message: 'Failed to fetch user data'
        });
        console.error('Error fetching user data:', err);
      } finally {
        setIsLoading(false);
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
      setTimeout(() => onClose(), 2000);
    } catch (err) {
      setStatus({
        type: 'error',
        message: err.response?.data?.error || 'Failed to update profile'
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Settings</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
          </div>
        ) : (
          <Formik
            initialValues={{
              username: userData?.username || '',
              email: userData?.email || '',
              currentPassword: '',
              newPassword: '',
              confirmPassword: '',
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
                    type="text"
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
                    type="email"
                    name="email"
                    className="w-full p-3 border border-gray-300 rounded-lg"
                  />
                  <ErrorMessage name="email" component="div" className="text-red-500 mt-1" />
                </div>

                <div className="border-t pt-4 mt-4">
                  <h3 className="text-lg font-medium mb-2">Delivery Information</h3>
                  <div className="space-y-4">
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
                        as="textarea"
                        name="address"
                        className="w-full p-3 border border-gray-300 rounded-lg"
                        rows="3"
                      />
                      <ErrorMessage name="address" component="div" className="text-red-500 mt-1" />
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4 mt-4">
                  <h3 className="text-lg font-medium mb-2">Change Password</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Current Password
                      </label>
                      <Field
                        type="password"
                        name="currentPassword"
                        className="w-full p-3 border border-gray-300 rounded-lg"
                      />
                      <ErrorMessage name="currentPassword" component="div" className="text-red-500 mt-1" />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        New Password
                      </label>
                      <Field
                        type="password"
                        name="newPassword"
                        className="w-full p-3 border border-gray-300 rounded-lg"
                      />
                      <ErrorMessage name="newPassword" component="div" className="text-red-500 mt-1" />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Confirm New Password
                      </label>
                      <Field
                        type="password"
                        name="confirmPassword"
                        className="w-full p-3 border border-gray-300 rounded-lg"
                      />
                      <ErrorMessage name="confirmPassword" component="div" className="text-red-500 mt-1" />
                    </div>
                  </div>
                </div>

                {status.message && (
                  <div className={`text-center ${status.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                    {status.message}
                  </div>
                )}

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
        )}
      </div>
    </div>
  );
};

export default Settings; 