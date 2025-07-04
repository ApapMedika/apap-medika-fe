'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { formatDate } from '@/utils/format';
import {
  UserCircleIcon,
  PencilIcon,
  CheckCircleIcon,
  CalendarDaysIcon,
  IdentificationIcon,
  AcademicCapIcon,
  MapPinIcon,
  EnvelopeIcon,
  PhoneIcon,
  UserIcon,
  StarIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
  });

  useEffect(() => {
    if (user) {
      setEditForm({
        name: user.name || '',
        email: user.email || '',
      });
    }
  }, [user]);

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    // For now, just show a message since we don't have the API endpoint
    toast.error('Profile editing is not yet implemented');
    setEditing(false);
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'Administrator';
      case 'DOCTOR':
        return 'Doctor';
      case 'NURSE':
        return 'Nurse';
      case 'PHARMACIST':
        return 'Pharmacist';
      case 'PATIENT':
        return 'Patient';
      default:
        return role;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'badge-danger';
      case 'DOCTOR':
        return 'badge-primary';
      case 'NURSE':
        return 'badge-success';
      case 'PHARMACIST':
        return 'badge-warning';
      case 'PATIENT':
        return 'badge-gray';
      default:
        return 'badge-gray';
    }
  };

  const getGenderDisplay = (gender: boolean) => {
    return gender ? 'Female' : 'Male';
  };

  const getClassDisplay = (pClass: number) => {
    switch (pClass) {
      case 1:
        return 'Class I (VIP)';
      case 2:
        return 'Class II (Premium)';
      case 3:
        return 'Class III (Standard)';
      default:
        return `Class ${pClass}`;
    }
  };

  const getSpecializationDisplay = (specialization: number) => {
    const specializations = {
      1: 'General Medicine',
      2: 'Pediatrics',
      3: 'Cardiology',
      4: 'Orthopedics',
      5: 'Dermatology',
      6: 'Psychiatry',
      7: 'Neurology',
      8: 'Oncology',
      9: 'Gynecology',
      10: 'Ophthalmology',
    };
    return specializations[specialization as keyof typeof specializations] || 'Unknown';
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mx-auto mb-4" />
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl">
                <UserCircleIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
                <p className="text-gray-600">Manage your account information</p>
              </div>
            </div>

            <div className={`badge ${getRoleBadgeColor(user.role)}`}>
              {getRoleDisplayName(user.role)}
            </div>
          </div>
        </div>

        {/* Profile Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Profile Overview */}
          <div className="lg:col-span-1">
            <div className="card text-center">
              <div className="mb-6">
                <div className="w-24 h-24 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <UserCircleIcon className="w-12 h-12 text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">{user.name}</h2>
                <p className="text-gray-600">@{user.username}</p>
                <div className={`inline-block mt-2 badge ${getRoleBadgeColor(user.role)}`}>
                  {getRoleDisplayName(user.role)}
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <EnvelopeIcon className="w-5 h-5 text-gray-400" />
                  <span className="text-sm text-gray-600">{user.email}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CalendarDaysIcon className="w-5 h-5 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    Joined {formatDate(user.created_at)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Detailed Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <UserIcon className="w-6 h-6 text-blue-600" />
                  <h3 className="text-xl font-semibold text-gray-900">Basic Information</h3>
                </div>
                <button
                  onClick={() => setEditing(!editing)}
                  className="btn-outline btn-sm"
                >
                  <PencilIcon className="w-4 h-4 mr-1" />
                  Edit
                </button>
              </div>

              {editing ? (
                <form onSubmit={handleEditSubmit} className="space-y-4">
                  <div>
                    <label className="form-label">Full Name</label>
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                      className="form-input"
                      required
                    />
                  </div>
                  <div>
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      value={editForm.email}
                      onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                      className="form-input"
                      required
                    />
                  </div>

                  <div className="flex items-center space-x-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className="btn-primary"
                    >
                      {loading ? (
                        <>
                          <LoadingSpinner className="mr-2" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <CheckCircleIcon className="w-4 h-4 mr-2" />
                          Save Changes
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditing(false)}
                      className="btn-secondary"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="form-label">Full Name</label>
                    <p className="text-gray-900 font-medium">{user.name}</p>
                  </div>
                  <div>
                    <label className="form-label">Username</label>
                    <p className="text-gray-900 font-medium">{user.username}</p>
                  </div>
                  <div>
                    <label className="form-label">Email</label>
                    <p className="text-gray-900 font-medium">{user.email}</p>
                  </div>
                  <div>
                    <label className="form-label">Gender</label>
                    <p className="text-gray-900 font-medium">{getGenderDisplay(user.gender)}</p>
                  </div>
                  <div>
                    <label className="form-label">Role</label>
                    <div className={`badge ${getRoleBadgeColor(user.role)}`}>
                      {getRoleDisplayName(user.role)}
                    </div>
                  </div>
                  <div>
                    <label className="form-label">Member Since</label>
                    <p className="text-gray-900 font-medium">{formatDate(user.created_at)}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Patient-specific Information */}
            {user.patient && (
              <div className="card">
                <div className="flex items-center space-x-3 mb-6">
                  <IdentificationIcon className="w-6 h-6 text-green-600" />
                  <h3 className="text-xl font-semibold text-gray-900">Patient Information</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="form-label">NIK</label>
                    <p className="text-gray-900 font-medium">{user.patient.nik}</p>
                  </div>
                  <div>
                    <label className="form-label">Birth Date</label>
                    <p className="text-gray-900 font-medium">{formatDate(user.patient.birth_date)}</p>
                  </div>
                  <div>
                    <label className="form-label">Birth Place</label>
                    <p className="text-gray-900 font-medium">{user.patient.birth_place}</p>
                  </div>
                  <div>
                    <label className="form-label">Patient Class</label>
                    <div className="badge badge-primary">
                      {getClassDisplay(user.patient.p_class)}
                    </div>
                  </div>
                  <div>
                    <label className="form-label">Insurance Limit</label>
                    <p className="text-gray-900 font-medium">
                      Rp {user.patient.insurance_limit.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <label className="form-label">Available Limit</label>
                    <p className="text-gray-900 font-medium">
                      Rp {user.patient.available_limit.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Doctor-specific Information */}
            {user.doctor && (
              <div className="card">
                <div className="flex items-center space-x-3 mb-6">
                  <AcademicCapIcon className="w-6 h-6 text-purple-600" />
                  <h3 className="text-xl font-semibold text-gray-900">Doctor Information</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="form-label">Specialization</label>
                    <p className="text-gray-900 font-medium">
                      {getSpecializationDisplay(user.doctor.specialization)}
                    </p>
                  </div>
                  <div>
                    <label className="form-label">Years of Experience</label>
                    <div className="flex items-center space-x-2">
                      <StarIcon className="w-4 h-4 text-yellow-500" />
                      <span className="text-gray-900 font-medium">
                        {user.doctor.years_of_experience} years
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="form-label">Consultation Fee</label>
                    <p className="text-gray-900 font-medium">
                      Rp {user.doctor.fee.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <label className="form-label">Available Days</label>
                    <div className="flex flex-wrap gap-2">
                      {user.doctor.schedules.map((day) => {
                        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                        return (
                          <span key={day} className="badge badge-gray">
                            {days[day]}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Account Settings */}
            <div className="card">
              <div className="flex items-center space-x-3 mb-6">
                <CheckCircleIcon className="w-6 h-6 text-yellow-600" />
                <h3 className="text-xl font-semibold text-gray-900">Account Settings</h3>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">Password</h4>
                    <p className="text-sm text-gray-600">Update your password to keep your account secure</p>
                  </div>
                  <button
                    onClick={() => router.push('/profile/change-password')}
                    className="btn-outline btn-sm"
                  >
                    Change Password
                  </button>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">Two-Factor Authentication</h4>
                    <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
                  </div>
                  <button
                    onClick={() => toast.info('Two-factor authentication coming soon')}
                    className="btn-outline btn-sm"
                    disabled
                  >
                    Enable 2FA
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}