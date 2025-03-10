import React, { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { Link } from 'react-router-dom';
import { AUTH_API } from '../../Api';

const forgotPasswordSchema = Yup.object().shape({
  email: Yup.string()
    .email('Invalid email')
    .required('Email is required'),
});

const ForgotPassword = () => {
  const [status, setStatus] = useState({ type: '', message: '' });

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const response = await AUTH_API.post('/forgot-password', values);
      setStatus({
        type: 'success',
        message: 'Password reset link has been sent to your email.'
      });
    } catch (err) {
      if (err.response?.status === 404) {
        setStatus({
          type: 'error',
          message: 'No account exists with this email address.'
        });
      } else {
        setStatus({
          type: 'error',
          message: err.response?.data?.error || 'Something went wrong. Please try again.'
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex h-screen justify-center items-center bg-black">
      <div className="w-full max-w-md p-8 bg-white/80 rounded-lg">
        <h2 className="text-3xl font-bold mb-6 text-center">Forgot Password</h2>
        <Formik
          initialValues={{ email: '' }}
          validationSchema={forgotPasswordSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting }) => (
            <Form className="space-y-4">
              <div>
                <Field
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  className="w-full p-3 border border-gray-300 rounded-lg"
                />
                <ErrorMessage name="email" component="div" className="text-red-500 mt-1" />
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
                {isSubmitting ? 'Sending...' : 'Send Reset Link'}
              </button>

              <div className="text-center mt-4">
                <Link to="/login" className="text-blue-500 hover:underline">
                  Back to Login
                </Link>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default ForgotPassword; 