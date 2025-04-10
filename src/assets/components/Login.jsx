import React, { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { Canvas } from '@react-three/fiber';
import { useLoader } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from '@react-three/drei';
import { Link, useNavigate } from 'react-router-dom';
import { AUTH_API } from '../../Api';
import { loginSchema } from '../../validationSchemas';

const Login = ({ setAuthStatus }) => {
  const [loginError, setLoginError] = useState('');
  const navigate = useNavigate();
  const model = useLoader(GLTFLoader, './burger_box.glb');

  const handleLogin = async (values, { setSubmitting }) => {
    try {
      const { data } = await AUTH_API.post('/login', values);
      console.log('Login response:', data);

      setAuthStatus(data.token, data.user.isAdmin);
      
      if (data.user.isAdmin) {
        console.log('User is admin, redirecting to admin dashboard');
        navigate('/admin');
      } else {
        console.log('User is not admin, redirecting to profile');
        navigate('/profile');
      }
    } catch (err) {
      console.error('Login error:', err);
      setLoginError('Invalid credentials. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex h-screen justify-around bg-black">
      {/* Left Side: Login Form */}
      <div className='flex flex-col w-full items-center justify-center'>
        <div className="flex w-full h-[55%] flex-col justify-around items-center bg-white/80 rounded-lg mx-5 p-8 max-w-md">
          <h2 className="mb-5 text-4xl font-bold">Login</h2>
          <Formik
            initialValues={{ email: '', password: '' }}
            validationSchema={loginSchema}
            onSubmit={handleLogin}
          >
            {({ isSubmitting }) => (
              <Form className="w-full">
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
                  {isSubmitting ? 'Logging in...' : 'Login'}
                </button>
              </Form>
            )}
          </Formik>
          {loginError && <div className="mt-4 text-red-500">{loginError}</div>}
          <div className="mt-4 flex flex-col items-center gap-2">
            <Link to="/signup" className="text-blue-500 hover:underline">
              Don't have an account? Sign up
            </Link>
            <Link to="/forgot-password" className="text-blue-500 hover:underline">
              Forgot Password?
            </Link>
          </div>
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

export default Login;

