'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Heart, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

const roles = [
  { value: 'admin', label: 'Admin' },
  { value: 'doctor', label: 'Doctor' },
  { value: 'nurse', label: 'Nurse' },
  { value: 'pharmacist', label: 'Pharmacist' },
  { value: 'patient', label: 'Patient' },
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

    if (formData.role === 'patient') {
      if (!formData.nik || !formData.birthPlace || !formData.birthDate || !formData.pClass) {
        toast.error('Please fill in all patient information');
        return false;
      }
      if (formData.nik.length !== 16) {
        toast.error('NIK must be exactly 16 digits');
        return false;
      }
    }

    if (formData.role === 'doctor') {
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

      if (formData.role === 'patient') {
        payload.patient_data = {
          nik: formData.nik,
          birth_place: formData.birthPlace,
          birth_date: formData.birthDate,
          p_class: parseInt(formData.pClass),
        };
      }

      if (formData.role === 'doctor') {
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-2 mb-4">
            <Heart className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold gradient-text">ApapMedika</span>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h1>
          <p className="text-gray-600">Join our healthcare management system</p>
        </div>

        {/* Signup Form */}
        <Card className="shadow-glow">
          <CardHeader>
            <CardTitle>Sign Up</CardTitle>
            <CardDescription>
              Fill in your information to create your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="username">Username *</Label>
                  <Input
                    id="username"
                    placeholder="Choose a username"
                    value={formData.username}
                    onChange={(e) => handleInputChange('username', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Password *</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Create a password"
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password *</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Gender *</Label>
                  <Select onValueChange={(value) => handleInputChange('gender', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Role *</Label>
                  <Select onValueChange={(value) => handleInputChange('role', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map((role) => (
                        <SelectItem key={role.value} value={role.value}>
                          {role.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Patient Specific Fields */}
              {formData.role === 'patient' && (
                <div className="space-y-4 border-t pt-4">
                  <h3 className="text-lg font-semibold text-gray-900">Patient Information</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="nik">NIK (16 digits) *</Label>
                    <Input
                      id="nik"
                      placeholder="Enter 16-digit NIK"
                      value={formData.nik}
                      onChange={(e) => handleInputChange('nik', e.target.value)}
                      maxLength={16}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="birthPlace">Birth Place *</Label>
                      <Input
                        id="birthPlace"
                        placeholder="Enter birth place"
                        value={formData.birthPlace}
                        onChange={(e) => handleInputChange('birthPlace', e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="birthDate">Birth Date *</Label>
                      <Input
                        id="birthDate"
                        type="date"
                        value={formData.birthDate}
                        onChange={(e) => handleInputChange('birthDate', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Patient Class *</Label>
                    <Select onValueChange={(value) => handleInputChange('pClass', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select patient class" />
                      </SelectTrigger>
                      <SelectContent>
                        {patientClasses.map((pClass) => (
                          <SelectItem key={pClass.value} value={pClass.value.toString()}>
                            {pClass.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {/* Doctor Specific Fields */}
              {formData.role === 'doctor' && (
                <div className="space-y-4 border-t pt-4">
                  <h3 className="text-lg font-semibold text-gray-900">Doctor Information</h3>
                  
                  <div className="space-y-2">
                    <Label>Specialization *</Label>
                    <Select onValueChange={(value) => handleInputChange('specialization', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select specialization" />
                      </SelectTrigger>
                      <SelectContent>
                        {specializations.map((spec) => (
                          <SelectItem key={spec.value} value={spec.value.toString()}>
                            {spec.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="yearsOfExperience">Years of Experience *</Label>
                      <Input
                        id="yearsOfExperience"
                        type="number"
                        placeholder="Enter years of experience"
                        value={formData.yearsOfExperience}
                        onChange={(e) => handleInputChange('yearsOfExperience', e.target.value)}
                        min="0"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="fee">Consultation Fee (Rp) *</Label>
                      <Input
                        id="fee"
                        type="number"
                        placeholder="Enter consultation fee"
                        value={formData.fee}
                        onChange={(e) => handleInputChange('fee', e.target.value)}
                        min="0"
                        step="1000"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Practice Schedule *</Label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {schedules.map((schedule) => (
                        <button
                          key={schedule.value}
                          type="button"
                          className={`p-2 text-sm rounded border transition-colors ${
                            formData.schedules.includes(schedule.value)
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'bg-white text-gray-700 border-gray-300 hover:border-blue-600'
                          }`}
                          onClick={() => handleScheduleToggle(schedule.value)}
                        >
                          {schedule.label}
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500">Select the days you will be available</p>
                  </div>
                </div>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Creating Account...' : 'Create Account'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link href="/login" className="text-blue-600 hover:text-blue-500 font-medium">
                  Sign in here
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}