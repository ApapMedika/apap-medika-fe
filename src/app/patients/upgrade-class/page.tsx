'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { apiClient } from '@/lib/api';
import { formatCurrency, validateNIK } from '@/utils/format';
import { PATIENT_CLASSES } from '@/utils/constants';
import {
  UserIcon,
  ArrowUpIcon,
  MagnifyingGlassIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  CheckIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface Patient {
  id: string;
  user: {
    name: string;
    email: string;
  };
  nik: string;
  birthPlace: string;
  birthDate: string;
  pClass: number;
  insuranceLimit: number;
  availableLimit: number;
}

export default function UpgradePatientClassPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [searchNik, setSearchNik] = useState(searchParams.get('nik') || '');
  const [patient, setPatient] = useState<Patient | null>(null);
  const [newClass, setNewClass] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Redirect if not admin
  if (user?.role !== 'admin') {
    return (
      <div className="card text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
        <p className="text-gray-600">Only administrators can upgrade patient classes.</p>
        <button onClick={() => router.back()} className="btn-primary mt-4">
          Go Back
        </button>
      </div>
    );
  }

  const searchPatient = async () => {
    if (!searchNik.trim()) {
      toast.error('Please enter a NIK');
      return;
    }

    if (!validateNIK(searchNik)) {
      toast.error('Please enter a valid NIK (16 digits)');
      return;
    }

    try {
      setSearching(true);
      const data = await apiClient.getPatientByNik(searchNik.trim());
      setPatient(data);
      
      // Set new class to one level higher
      if (data.pClass > 1) {
        setNewClass(data.pClass - 1);
      } else {
        setNewClass(1);
      }
    } catch (error: any) {
      console.error('Failed to search patient:', error);
      if (error.response?.status === 404) {
        toast.error('Patient not found with the provided NIK');
      } else {
        toast.error('Failed to search patient');
      }
      setPatient(null);
    } finally {
      setSearching(false);
    }
  };

  const handleUpgrade = async () => {
    if (!patient) return;

    try {
      setLoading(true);
      await apiClient.upgradePatientClass({
        patient_id: patient.id,
        new_class: newClass,
      });
      
      toast.success(`Patient class successfully upgraded to Class ${newClass}!`);
      
      // Refresh patient data
      const updatedPatient = await apiClient.getPatientByNik(searchNik);
      setPatient(updatedPatient);
      setShowConfirmModal(false);
      
    } catch (error: any) {
      console.error('Failed to upgrade patient class:', error);
      toast.error(error.response?.data?.message || 'Failed to upgrade patient class');
    } finally {
      setLoading(false);
    }
  };

  const getAvailableClasses = () => {
    if (!patient) return [];
    
    const classes = [];
    for (let i = 1; i < patient.pClass; i++) {
      classes.push(i);
    }
    return classes;
  };

  const canUpgrade = patient && patient.pClass > 1;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card">
        <div className="flex items-center space-x-3">
          <ArrowUpIcon className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Upgrade Patient Class</h1>
            <p className="text-gray-600">Upgrade a patient's insurance class to a higher level</p>
          </div>
        </div>
      </div>

      {/* Search Patient */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Search Patient</h2>
        <div className="flex space-x-4">
          <div className="flex-1">
            <label className="form-label">Patient NIK</label>
            <input
              type="text"
              className="form-input"
              placeholder="Enter 16-digit NIK"
              value={searchNik}
              onChange={(e) => setSearchNik(e.target.value)}
              maxLength={16}
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={searchPatient}
              disabled={searching}
              className="btn-primary flex items-center space-x-2"
            >
              {searching ? (
                <div className="spinner w-4 h-4"></div>
              ) : (
                <MagnifyingGlassIcon className="w-5 h-5" />
              )}
              <span>Search</span>
            </button>
          </div>
        </div>
      </div>

      {/* Patient Information */}
      {patient && (
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Patient Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <p className="text-sm font-medium text-gray-500">Name</p>
              <p className="text-gray-900">{patient.user.name}</p>
            </div>
            
            <div>
              <p className="text-sm font-medium text-gray-500">NIK</p>
              <p className="text-gray-900 font-mono">{patient.nik}</p>
            </div>
            
            <div>
              <p className="text-sm font-medium text-gray-500">Email</p>
              <p className="text-gray-900">{patient.user.email}</p>
            </div>
            
            <div>
              <p className="text-sm font-medium text-gray-500">Birth Place</p>
              <p className="text-gray-900">{patient.birthPlace}</p>
            </div>
          </div>

          {/* Current Class */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Current Insurance Class</h3>
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <ShieldCheckIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-lg font-semibold text-gray-900">
                  {PATIENT_CLASSES[patient.pClass as keyof typeof PATIENT_CLASSES]?.label}
                </p>
                <p className="text-sm text-gray-600">
                  Insurance Limit: {formatCurrency(patient.insuranceLimit)}
                </p>
                <p className="text-sm text-gray-600">
                  Available Limit: {formatCurrency(patient.availableLimit)}
                </p>
              </div>
            </div>
          </div>

          {/* Upgrade Options */}
          {canUpgrade ? (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Upgrade To</h3>
              <div className="space-y-3">
                {getAvailableClasses().map((classNum) => (
                  <label key={classNum} className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      name="newClass"
                      value={classNum}
                      checked={newClass === classNum}
                      onChange={(e) => setNewClass(parseInt(e.target.value))}
                      className="form-radio"
                    />
                    <div className="flex-1 flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                      <div>
                        <p className="font-medium text-gray-900">
                          {PATIENT_CLASSES[classNum as keyof typeof PATIENT_CLASSES]?.label}
                        </p>
                        <p className="text-sm text-gray-600">
                          {PATIENT_CLASSES[classNum as keyof typeof PATIENT_CLASSES]?.description}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-green-600">
                          {formatCurrency(PATIENT_CLASSES[classNum as keyof typeof PATIENT_CLASSES]?.limit)}
                        </p>
                        <p className="text-xs text-gray-500">Insurance Limit</p>
                      </div>
                    </div>
                  </label>
                ))}
              </div>

              <div className="flex justify-end space-x-4 mt-6">
                <button
                  onClick={() => router.back()}
                  className="btn-outline"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setShowConfirmModal(true)}
                  className="btn-primary flex items-center space-x-2"
                >
                  <ArrowUpIcon className="w-5 h-5" />
                  <span>Upgrade Class</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <ExclamationTriangleIcon className="w-6 h-6 text-yellow-600" />
                <div>
                  <p className="font-medium text-yellow-800">Cannot Upgrade</p>
                  <p className="text-sm text-yellow-700">
                    This patient is already in the highest class (Class 1) and cannot be upgraded further.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && patient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <ArrowUpIcon className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Confirm Class Upgrade</h3>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-600 mb-4">
                Are you sure you want to upgrade <strong>{patient.user.name}</strong> from{' '}
                <strong>Class {patient.pClass}</strong> to <strong>Class {newClass}</strong>?
              </p>
              
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-sm">
                  <div className="flex justify-between mb-1">
                    <span>Current Limit:</span>
                    <span>{formatCurrency(patient.insuranceLimit)}</span>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span>New Limit:</span>
                    <span className="text-green-600">
                      {formatCurrency(PATIENT_CLASSES[newClass as keyof typeof PATIENT_CLASSES]?.limit)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="btn-outline"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={handleUpgrade}
                disabled={loading}
                className="btn-primary flex items-center space-x-2"
              >
                {loading ? (
                  <div className="spinner w-4 h-4"></div>
                ) : (
                  <CheckIcon className="w-5 h-5" />
                )}
                <span>Confirm Upgrade</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}