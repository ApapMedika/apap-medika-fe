'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  UserIcon,
  EnvelopeIcon,
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon,
  HeartIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  IdentificationIcon,
  MapPinIcon,
  CalendarDaysIcon,
  AcademicCapIcon,
  StarIcon,
  CurrencyDollarIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

const PATIENT_CLASSES = [
  { value: 1, label: 'Class I (VIP)', description: 'Premium care with private room' },
  { value: 2, label: 'Class II (Premium)', description: 'Semi-private room with enhanced amenities' },
  { value: 3, label: 'Class III (Standard)', description: 'Standard care with shared facilities' },
];

const DOCTOR_SPECIALIZATIONS = [
  { value: 1, label: 'General Medicine' },
  { value: 2, label: 'Pediatrics' },
  { value: 3, label: 'Cardiology' },
  { value: 4, label: 'Orthopedics' },
  { value: 5, label: 'Dermatology' },
  { value: 6, label: 'Psychiatry' },
  { value: 7, label: 'Neurology' },
  { value: 8, label: 'Oncology' },
  { value: 9, label: 'Gynecology' },
  { value: 10, label: 'Ophthalmology' },
];

const DAYS_OF_WEEK = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
];

export default function SignupPage() {
  const { signup, user, loading } = useAuth();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    // Basic Info
    name: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    gender: false, // false = Male, true = Female
    role: 'PATIENT',
    
    // Patient specific
    nik: '',
    birth_place: '',
    birth_date: '',
    p_class: 3,
    
    // Doctor specific
    specialization: 1,
    years_of_experience: 1,
    fee: 100000,
    schedules: [] as number[],
  });

  useEffect(() => {
    if (user && !loading) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const target = e.target as HTMLInputElement;
      setFormData(prev => ({ ...prev, [name]: target.checked }));
    } else if (name === 'schedules') {
      const dayValue = parseInt(value);
      setFormData(prev => ({
        ...prev,
        schedules: prev.schedules.includes(dayValue)
          ? prev.schedules.filter(d => d !== dayValue)
          : [...prev.schedules, dayValue]
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name || !formData.username || !formData.email || !formData.password) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    // Role-specific validation
    if (formData.role === 'PATIENT') {
      if (!formData.nik || !formData.birth_place || !formData.birth_date) {
        toast.error('Please fill in all patient information');
        return;
      }
    }

    if (formData.role === 'DOCTOR') {
      if (!formData.specialization || !formData.years_of_experience || !formData.fee || formData.schedules.length === 0) {
        toast.error('Please fill in all doctor information');
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const submitData = {
        name: formData.name,
        username: formData.username,
        email: formData.email,
        password: formData.password,
        gender: formData.gender,
        role: formData.role,
        ...(formData.role === 'PATIENT' && {
          nik: formData.nik,
          birth_place: formData.birth_place,
          birth_date: formData.birth_date,
          p_class: formData.p_class,
        }),
        ...(formData.role === 'DOCTOR' && {
          specialization: formData.specialization,
          years_of_experience: formData.years_of_experience,
          fee: formData.fee,
          schedules: formData.schedules,
        }),
      };

      await signup(submitData);
      // Success handling is done in the signup function
    } catch (error) {
      // Error handling is done in the signup function
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">       
          <div className="flex justify-center mb-4">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl">
                <HeartIcon className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold gradient-text">
                APAP Medika
              </h1>
            </div>
          </div>
          
          <h2 className="text-3xl font-bold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Join our healthcare platform and start your journey
          </p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <UserIcon className="w-6 h-6 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="form-label">
                    Full Name *
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label htmlFor="username" className="form-label">
                    Username *
                  </label>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    required
                    value={formData.username}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Choose a username"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="form-label">
                    Email Address *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="form-input pl-10"
                      placeholder="Enter your email"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="gender" className="form-label">
                    Gender *
                  </label>
                  <select
                    id="gender"
                    name="gender"
                    value={formData.gender.toString()}
                    onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value === 'true' }))}
                    className="form-select"
                    required
                  >
                    <option value="false">Male</option>
                    <option value="true">Female</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="password" className="form-label">
                    Password *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <LockClosedIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={formData.password}
                      onChange={handleChange}
                      className="form-input pl-10 pr-10"
                      placeholder="Create a password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showPassword ? (
                        <EyeSlashIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      ) : (
                        <EyeIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="form-label">
                    Confirm Password *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <LockClosedIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="form-input pl-10 pr-10"
                      placeholder="Confirm your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showConfirmPassword ? (
                        <EyeSlashIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      ) : (
                        <EyeIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Role Selection */}
            <div>
              <label htmlFor="role" className="form-label">
                Account Type *
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="form-select"
                required
              >
                <option value="PATIENT">Patient</option>
                <option value="DOCTOR">Doctor</option>
                <option value="NURSE">Nurse</option>
                <option value="PHARMACIST">Pharmacist</option>
                <option value="ADMIN">Administrator</option>
              </select>
            </div>

            {/* Patient-specific fields */}
            {formData.role === 'PATIENT' && (
              <div>
                <div className="flex items-center space-x-3 mb-6">
                  <IdentificationIcon className="w-6 h-6 text-green-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Patient Information</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="nik" className="form-label">
                      NIK (ID Number) *
                    </label>
                    <input
                      id="nik"
                      name="nik"
                      type="text"
                      required
                      value={formData.nik}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="Enter your NIK"
                    />
                  </div>

                  <div>
                    <label htmlFor="birth_place" className="form-label">
                      Birth Place *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <MapPinIcon className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="birth_place"
                        name="birth_place"
                        type="text"
                        required
                        value={formData.birth_place}
                        onChange={handleChange}
                        className="form-input pl-10"
                        placeholder="Enter your birth place"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="birth_date" className="form-label">
                      Birth Date *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <CalendarDaysIcon className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="birth_date"
                        name="birth_date"
                        type="date"
                        required
                        value={formData.birth_date}
                        onChange={handleChange}
                        className="form-input pl-10"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="p_class" className="form-label">
                      Patient Class *
                    </label>
                    <select
                      id="p_class"
                      name="p_class"
                      value={formData.p_class}
                      onChange={handleChange}
                      className="form-select"
                      required
                    >
                      {PATIENT_CLASSES.map((pClass) => (
                        <option key={pClass.value} value={pClass.value}>
                          {pClass.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Doctor-specific fields */}
            {formData.role === 'DOCTOR' && (
              <div>
                <div className="flex items-center space-x-3 mb-6">
                  <AcademicCapIcon className="w-6 h-6 text-purple-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Doctor Information</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="specialization" className="form-label">
                      Specialization *
                    </label>
                    <select
                      id="specialization"
                      name="specialization"
                      value={formData.specialization}
                      onChange={handleChange}
                      className="form-select"
                      required
                    >
                      {DOCTOR_SPECIALIZATIONS.map((spec) => (
                        <option key={spec.value} value={spec.value}>
                          {spec.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="years_of_experience" className="form-label">
                      Years of Experience *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <StarIcon className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="years_of_experience"
                        name="years_of_experience"
                        type="number"
                        min="1"
                        max="50"
                        required
                        value={formData.years_of_experience}
                        onChange={handleChange}
                        className="form-input pl-10"
                        placeholder="Years of experience"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="fee" className="form-label">
                      Consultation Fee (Rp) *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <CurrencyDollarIcon className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="fee"
                        name="fee"
                        type="number"
                        min="50000"
                        max="1000000"
                        step="10000"
                        required
                        value={formData.fee}
                        onChange={handleChange}
                        className="form-input pl-10"
                        placeholder="Consultation fee"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="form-label">
                      Available Days *
                    </label>
                    <div className="space-y-2">
                      {DAYS_OF_WEEK.map((day) => (
                        <label key={day.value} className="flex items-center">
                          <input
                            type="checkbox"
                            name="schedules"
                            value={day.value}
                            checked={formData.schedules.includes(day.value)}
                            onChange={handleChange}
                            className="form-checkbox"
                          />
                          <span className="ml-2 text-sm text-gray-700">{day.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-6">
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary w-full"
              >
                {isSubmitting ? (
                  <>
                    <LoadingSpinner className="mr-2" />
                    Creating account...
                  </>
                ) : (
                  <>
                    <CheckCircleIcon className="w-5 h-5 mr-2" />
                    Create Account
                  </>
                )}
              </button>
            </div>

            {/* Terms */}
            <div className="text-center text-sm text-gray-500">
              By creating an account, you agree to our{' '}
              <Link href="/terms" className="gradient-text-hover font-medium">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className="gradient-text-hover font-medium">
                Privacy Policy
              </Link>
            </div>
          </form>
        </div>

        {/* Login Link */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link href="/login" className="gradient-text-hover font-medium">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}