'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { HeartIcon, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

const roles = [
  { value: 'DOCTOR', label: 'Doctor' },
  { value: 'NURSE', label: 'Nurse' },
  { value: 'PHARMACIST', label: 'Pharmacist' },
  { value: 'PATIENT', label: 'Patient' },
];

const specializations = [
  { value: 0, label: 'General Practitioner' },
  { value: 1, label: 'Dentist' },
  { value: 2, label: 'Pediatrician' },
  { value: 3, label: 'Surgery' },
  { value: 4, label: 'Plastic, Reconstructive, and Aesthetic Surgery' },
  { value: 5, label: 'Heart and Blood Vessels' },
  { value: 6, label: 'Skin and Venereal Diseases' },
  { value: 7, label: 'Eyes' },
  { value: 8, label: 'Obstetrics and Gynecology' },
  { value: 9, label: 'Internal Medicine' },
  { value: 10, label: 'Lungs' },
  { value: 11, label: 'Ear, Nose, Throat, Head and Neck Surgery' },
  { value: 12, label: 'Radiology' },
  { value: 13, label: 'Mental Health' },
  { value: 14, label: 'Anesthesia' },
  { value: 15, label: 'Neurology' },
  { value: 16, label: 'Urology' },
];

const patientClasses = [
  { value: 1, label: 'Class 1 (Rp 100,000,000 limit)' },
  { value: 2, label: 'Class 2 (Rp 50,000,000 limit)' },
  { value: 3, label: 'Class 3 (Rp 25,000,000 limit)' },
];

const schedules = [
  { value: 0, label: 'Monday' },
  { value: 1, label: 'Tuesday' },
  { value: 2, label: 'Wednesday' },
  { value: 3, label: 'Thursday' },
  { value: 4, label: 'Friday' },
  { value: 5, label: 'Saturday' },
  { value: 6, label: 'Sunday' },
];

export default function SignupPage() {
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    gender: '',
    role: '',
    // Patient specific
    nik: '',
    birthPlace: '',
    birthDate: '',
    pClass: '',
    // Doctor specific
    specialization: '',
    yearsOfExperience: '',
    fee: '',
    schedules: [] as number[],
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleScheduleToggle = (scheduleId: number) => {
    setFormData(prev => ({
      ...prev,
      schedules: prev.schedules.includes(scheduleId)
        ? prev.schedules.filter(id => id !== scheduleId)
        : [...prev.schedules, scheduleId]
    }));
  };

  const validateForm = () => {
    if (!formData.name || !formData.username || !formData.email || !formData.password || !formData.gender || !formData.role) {
      toast.error('Please fill in all required fields');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return false;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return false;
    }

    if (formData.role === 'PATIENT') {
      if (!formData.nik || !formData.birthPlace || !formData.birthDate || !formData.pClass) {
        toast.error('Please fill in all patient information');
        return false;
      }
      if (formData.nik.length !== 16) {
        toast.error('NIK must be exactly 16 digits');
        return false;
      }
    }

    if (formData.role === 'DOCTOR') {
      if (!formData.specialization || !formData.yearsOfExperience || !formData.fee || formData.schedules.length === 0) {
        toast.error('Please fill in all doctor information');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const payload: any = {
        name: formData.name,
        username: formData.username,
        email: formData.email,
        password: formData.password,
        gender: formData.gender === 'female',
        role: formData.role,
      };

      if (formData.role === 'PATIENT') {
        payload.patient_data = {
          nik: formData.nik,
          birth_place: formData.birthPlace,
          birth_date: formData.birthDate,
          p_class: parseInt(formData.pClass),
        };
      }

      if (formData.role === 'DOCTOR') {
        payload.doctor_data = {
          specialization: parseInt(formData.specialization),
          years_of_experience: parseInt(formData.yearsOfExperience),
          fee: parseFloat(formData.fee),
          schedules: formData.schedules,
        };
      }

      await signup(payload);
    } catch (error) {
      // Error handling is done in auth context
    } finally {
      setLoading(false);
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
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Create Account</h1>
            <p className="text-gray-600">Join our healthcare management system</p>
          </div>

          {/* Signup Form */}
          <div className="card shadow-glow mb-12">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Sign Up</h2>
              <p className="text-gray-600 mb-6">Fill in your information to create your account</p>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">Full Name *</label>
                    <input
                      type="text"
                      placeholder="Enter your full name"
                      className="form-input text-gray-900"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label className="form-label">Username *</label>
                    <input
                      type="text"
                      placeholder="Choose a username"
                      className="form-input text-gray-900"
                      value={formData.username}
                      onChange={(e) => handleInputChange('username', e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="form-label">Email *</label>
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="form-input text-gray-900"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">Password *</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Create a password"
                        className="form-input pr-10 text-gray-900"
                        value={formData.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="form-label">Confirm Password *</label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Confirm your password"
                        className="form-input pr-10 text-gray-900"
                        value={formData.confirmPassword}
                        onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">Gender *</label>
                    <select
                      className="form-select text-gray-900"
                      value={formData.gender}
                      onChange={(e) => handleInputChange('gender', e.target.value)}
                      required
                    >
                      <option value="" disabled className="text-gray-400">Select gender</option>
                      <option value="male" className="text-gray-900">Male</option>
                      <option value="female" className="text-gray-900">Female</option>
                    </select>
                  </div>

                  <div>
                    <label className="form-label">Role *</label>
                    <select
                      className="form-select text-gray-900"
                      value={formData.role}
                      onChange={(e) => handleInputChange('role', e.target.value)}
                      required
                    >
                      <option value="" disabled className="text-gray-400">Select role</option>
                      {roles.map((role) => (
                        <option key={role.value} value={role.value} className="text-gray-900">
                          {role.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Patient Specific Fields */}
                {formData.role === 'PATIENT' && (
                  <div className="space-y-4 border-t pt-6">
                    <h3 className="text-lg font-semibold text-gray-900">Patient Information</h3>
                    <div>
                      <label className="form-label">NIK (16 digits) *</label>
                      <input
                        type="text"
                        placeholder="Enter 16-digit NIK"
                        className="form-input text-gray-900"
                        value={formData.nik}
                        onChange={(e) => handleInputChange('nik', e.target.value)}
                        maxLength={16}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="form-label">Birth Place *</label>
                        <input
                          type="text"
                          placeholder="Enter birth place"
                          className="form-input text-gray-900"
                          value={formData.birthPlace}
                          onChange={(e) => handleInputChange('birthPlace', e.target.value)}
                        />
                      </div>

                      <div>
                        <label className="form-label">Birth Date *</label>
                        <input
                          type="date"
                          className="form-input text-gray-900"
                          value={formData.birthDate}
                          onChange={(e) => handleInputChange('birthDate', e.target.value)}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="form-label">Patient Class *</label>
                      <select
                        className="form-select text-gray-900"
                        value={formData.pClass}
                        onChange={(e) => handleInputChange('pClass', e.target.value)}
                      >
                        <option value="" disabled className="text-gray-400">Select patient class</option>
                        {patientClasses.map((pClass) => (
                          <option key={pClass.value} value={pClass.value.toString()} className="text-gray-900">
                            {pClass.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                {/* Doctor Specific Fields */}
                {formData.role === 'DOCTOR' && (
                  <div className="space-y-4 border-t pt-6">
                    <h3 className="text-lg font-semibold text-gray-900">Doctor Information</h3>
                    <div>
                      <label className="form-label">Specialization *</label>
                      <select
                        className="form-select text-gray-900"
                        value={formData.specialization}
                        onChange={(e) => handleInputChange('specialization', e.target.value)}
                      >
                        <option value="" disabled className="text-gray-400">Select specialization</option>
                        {specializations.map((spec) => (
                          <option key={spec.value} value={spec.value.toString()} className="text-gray-900">
                            {spec.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="form-label">Years of Experience *</label>
                        <input
                          type="number"
                          placeholder="Enter years of experience"
                          className="form-input text-gray-900"
                          value={formData.yearsOfExperience}
                          onChange={(e) => handleInputChange('yearsOfExperience', e.target.value)}
                          min="0"
                        />
                      </div>

                      <div>
                        <label className="form-label">Consultation Fee (Rp) *</label>
                        <input
                          type="number"
                          placeholder="Enter consultation fee"
                          className="form-input text-gray-900"
                          value={formData.fee}
                          onChange={(e) => handleInputChange('fee', e.target.value)}
                          min="0"
                          step="1000"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="form-label">Practice Schedule *</label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mt-2">
                        {schedules.map((schedule) => (
                          <button
                            key={schedule.value}
                            type="button"
                            className={`p-2 text-sm rounded border transition-colors ${
                              formData.schedules.includes(schedule.value)
                                ? 'bg-blue-600 text-white border-blue-600'
                                : 'bg-white text-gray-700 border-gray-300 hover:border-blue-600 hover:text-blue-600'
                            }`}
                            onClick={() => handleScheduleToggle(schedule.value)}
                          >
                            {schedule.label}
                          </button>
                        ))}
                      </div>
                      <p className="text-xs text-gray-500 mt-2">Select the days you will be available</p>
                    </div>
                  </div>
                )}

                <button type="submit" className="w-full btn-primary" disabled={loading}>
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 border-b-2 border-white rounded-full animate-spin mr-2"></div>
                      Creating Account...
                    </div>
                  ) : (
                    'Create Account'
                  )}
                </button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  Already have an account?{' '}
                  <Link href="/login" className="text-blue-600 hover:text-blue-500 font-medium transition-colors">
                    Sign in here
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Image */}
      <div className="hidden lg:block relative flex-1">
        <img
          className="absolute inset-0 h-full w-full object-cover"
          src="https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=1920&h=1080&fit=crop"
          alt="Healthcare team collaboration"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-indigo-600/70 to-indigo-400/30 flex items-end">
          <div className="p-12 text-white">
            <h3 className="text-4xl font-bold mb-4">
              Join Our Healthcare Network
            </h3>
            <p className="text-xl text-indigo-100">
              Become part of a comprehensive healthcare management system that connects patients, doctors, and medical professionals.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}