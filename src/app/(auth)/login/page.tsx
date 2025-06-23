'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import { EyeIcon, EyeSlashIcon, HeartIcon } from '@heroicons/react/24/outline';
import { LoginData } from '@/types';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export default function LoginPage() {
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginData) => {
    setIsLoading(true);
    try {
      await login(data.email, data.password);
    } catch (error) {
      // Error is handled in auth context
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen flex">
      <div className="flex-1 flex flex-col py-12 px-4 sm:px-6 lg:flex-none lg:w-3/5 xl:w-1/2 bg-gradient-to-br from-blue-50 via-white to-indigo-50 overflow-y-auto">
        <div className="mx-auto w-full max-w-lg">
          {/* Header */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <HeartIcon className="h-7 w-7 text-white" />
              </div>
              <span className="text-3xl font-bold gradient-text">ApapMedika</span>
            </Link>
            <p className="text-gray-600">
              Sign in to your account to continue
            </p>
            <p className="mt-2 text-sm text-gray-600">
              Don't have an account?{' '}
              <Link href="/signup" className="font-medium text-blue-600 hover:text-blue-500 transition-colors">
                Sign up
              </Link>
            </p>
          </div>

          {/* Login Form */}
          <div className="card shadow-glow">
            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
              <div className="space-y-5">
                <div>
                  <label htmlFor="email" className="form-label">
                    Email address
                  </label>
                  <input
                    {...register('email')}
                    type="email"
                    autoComplete="email"
                    className="form-input text-gray-900"
                    placeholder="Enter your email"
                  />
                  {errors.email && (
                    <p className="form-error">{errors.email.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="password" className="form-label">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      {...register('password')}
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      className="form-input pr-10 text-gray-900"
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPassword ? (
                        <EyeSlashIcon className="h-5 w-5" />
                      ) : (
                        <EyeIcon className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="form-error">{errors.password.message}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="form-checkbox"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                    Remember me
                  </label>
                </div>

                <Link href="/forgot-password" className="text-sm text-blue-600 hover:text-blue-500 transition-colors">
                  Forgot your password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full btn-primary"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-b-2 border-white rounded-full animate-spin mr-2"></div>
                    Signing in...
                  </div>
                ) : (
                  'Sign in'
                )}
              </button>
            </form>

            {/* Demo Credentials */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm font-medium text-blue-900 mb-2">Demo Credentials:</p>
              <div className="space-y-1 text-sm text-blue-700">
                <p><strong>Admin:</strong> admin@apapmedika.com / admin123</p>
                <p><strong>Doctor:</strong> doctor@apapmedika.com / doctor123</p>
                <p><strong>Patient:</strong> patient@apapmedika.com / patient123</p>
                <p><strong>Nurse:</strong> nurse@apapmedika.com / nurse123</p>
                <p><strong>Pharmacist:</strong> pharmacist@apapmedika.com / pharmacist123</p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-xs text-gray-500">
              By signing in, you agree to our{' '}
              <Link href="/terms" className="text-blue-600 hover:text-blue-500">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className="text-blue-600 hover:text-blue-500">
                Privacy Policy
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Image (Lebih Sempit) */}
      <div className="hidden lg:block relative flex-1">
        <img
          className="absolute inset-0 h-full w-full object-cover"
          src="https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=1920&h=1080&fit=crop"
          alt="Medical professionals working together"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-blue-600/70 to-blue-400/30 flex items-end">
          <div className="p-12 text-white">
            <h3 className="text-4xl font-bold mb-4">
              Welcome to ApapMedika
            </h3>
            <p className="text-xl text-blue-100">
              Your trusted healthcare management platform. Access your dashboard and continue providing excellent care.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}