import React, { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useParams, useNavigate } from 'react-router-dom';
import { AUTH_API } from '../../Api';

const resetPasswordSchema = Yup.object().shape({
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Passwords must match')
    .required('Confirm password is required'),
});

const ResetPassword = () => {
  const [status, setStatus] = useState({ type: '', message: '' });
  const { token } = useParams();
  const navigate = useNavigate();

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      await AUTH_API.post(`/reset-password/${token}`, {
        password: values.password
      });
      setStatus({
        type: 'success',
        message: 'Password successfully reset'
      });
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setStatus({
        type: 'error',
        message: err.response?.data?.error || 'Something went wrong'
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex h-screen justify-center items-center bg-black">
      <div className="w-full max-w-md p-8 bg-white/80 rounded-lg">
        <h2 className="text-3xl font-bold mb-6 text-center">Reset Password</h2>
        <Formik
          initialValues={{ password: '', confirmPassword: '' }}
          validationSchema={resetPasswordSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting }) => (
            <Form className="space-y-4">
              <div>
                <Field
                  type="password"
                  name="password"
                  placeholder="New Password"
                  className="w-full p-3 border border-gray-300 rounded-lg"
                />
                <ErrorMessage name="password" component="div" className="text-red-500 mt-1" />
              </div>

              <div>
                <Field
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm Password"
                  className="w-full p-3 border border-gray-300 rounded-lg"
                />
                <ErrorMessage name="confirmPassword" component="div" className="text-red-500 mt-1" />
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
                {isSubmitting ? 'Resetting...' : 'Reset Password'}
              </button>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default ResetPassword; 