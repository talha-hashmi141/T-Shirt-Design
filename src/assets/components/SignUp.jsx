import React, { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { Canvas } from '@react-three/fiber';
import { useLoader } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from '@react-three/drei';
import { Link, useNavigate } from 'react-router-dom';
import { AUTH_API } from '../../Api';
import { signupSchema } from '../../validationSchemas';

const Signup = () => {
  const [signupError, setSignupError] = useState('');
  const navigate = useNavigate();
  const model = useLoader(GLTFLoader, './burger_box.glb');

  const handleSignup = async (values, { setSubmitting }) => {
    try {
      await AUTH_API.post('/signup', values);
      navigate('/login');
    } catch (err) {
      console.error('Signup error:', err);
      setSignupError(
        err.response?.data?.error || 
        'Error signing up. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex h-screen justify-around bg-black">
      {/* Left Side: Signup Form */}
      <div className='flex flex-col w-full items-center justify-center'>
        <div className="flex w-full h-[55%] flex-col justify-center items-center bg-white/80 rounded-lg mx-5 p-8 max-w-md">
          <h2 className="mb-5 text-xl font-bold">Signup</h2>
          <Formik
            initialValues={{ username: '', email: '', password: '' }}
            validationSchema={signupSchema}
            onSubmit={handleSignup}
          >
            {({ isSubmitting }) => (
              <Form className="w-full">
                <div className="mb-4">
                  <Field
                    type="text"
                    name="username"
                    placeholder="Username"
                    className="w-full p-3 border border-gray-300 rounded-lg"
                  />
                  <ErrorMessage name="username" component="div" className="text-red-500 mt-1" />
                </div>
                <div className="mb-4">
                  <Field
                    type="email"
                    name="email"
                    placeholder="Email"
                    className="w-full p-3 border border-gray-300 rounded-lg"
                  />
                  <ErrorMessage name="email" component="div" className="text-red-500 mt-1" />
                </div>
                <div className="mb-4">
                  <Field
                    type="password"
                    name="password"
                    placeholder="Password"
                    className="w-full p-3 border border-gray-300 rounded-lg"
                  />
                  <ErrorMessage name="password" component="div" className="text-red-500 mt-1" />
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full p-3 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50"
                >
                  {isSubmitting ? 'Signing up...' : 'Signup'}
                </button>
              </Form>
            )}
          </Formik>
          {signupError && <div className="mt-4 text-red-500">{signupError}</div>}
          <Link to="/login" className="mt-4 text-blue-500 hover:underline">
            Already have an account? Login
          </Link>
        </div>
      </div>

      {/* Right Side: 3D Model */}
      <div className="flex w-full">
        <Canvas className="h-full">
          <ambientLight intensity={0.5} />
          <directionalLight position={[2, 5, 2]} intensity={1} />
          {model && <primitive object={model.scene} scale={7} />}
          <OrbitControls />
        </Canvas>
      </div>
    </div>
  );
};

export default Signup;

