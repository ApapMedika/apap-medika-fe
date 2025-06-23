'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import { apiClient } from '@/lib/api';
import { formatCurrency, validateNIK } from '@/utils/format';
import { PATIENT_CLASSES } from '@/utils/constants';
import {
  ShieldCheckIcon,
  ArrowLeftIcon,
  MagnifyingGlassIcon,
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
  gender: boolean;
  pClass: number;
  insuranceLimit: number;
  availableLimit: number;
}

interface Company {
  id: string;
  name: string;
  totalCoverage: number;
  coverages: Coverage[];
}

interface Coverage {
  id: number;
  name: string;
  coverageAmount: number;
}

export default function CreatePolicyPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [step, setStep] = useState(1); // 1: Search Patient, 2: Create Policy
  const [searchNik, setSearchNik] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [formData, setFormData] = useState({
    expiryDate: '',
    companyId: '',
  });
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [showCoverages, setShowCoverages] = useState(false);

  // Redirect if not admin
  if (user?.role !== 'admin') {
    return (
      <div className="card text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
        <p className="text-gray-600">Only administrators can create policies.</p>
        <button onClick={() => router.back()} className="btn-primary mt-4">
          Go Back
        </button>
      </div>
    );
  }

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const data = await apiClient.getCompanies();
      setCompanies(Array.isArray(data) ? data : data.results || []);
    } catch (error) {
      console.error('Failed to fetch companies:', error);
      toast.error('Failed to load insurance companies');
    }
  };

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
      setSelectedPatient(data);
      setStep(2);
    } catch (error: any) {
      console.error('Failed to search patient:', error);
      if (error.response?.status === 404) {
        toast.error('Patient not found with the provided NIK');
      } else {
        toast.error('Failed to search patient');
      }
      setSelectedPatient(null);
    } finally {
      setSearching(false);
    }
  };

  const handleCompanySelect = (company: Company) => {
    setSelectedCompany(company);
    setFormData({ ...formData, companyId: company.id });
    setShowCoverages(false);
  };

  const loadCoverages = () => {
    if (!selectedCompany) {
      toast.error('Please select a company first');
      return;
    }
    setShowCoverages(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedPatient || !selectedCompany || !formData.expiryDate) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Check if total coverage exceeds available limit
    if (selectedCompany.totalCoverage > selectedPatient.availableLimit) {
      toast.error('Total coverage exceeds patient available limit. Please upgrade patient class or select another company.');
      return;
    }

    try {
      setLoading(true);
      const result = await apiClient.createPolicy({
        patient_id: selectedPatient.id,
        company_id: selectedCompany.id,
        expiry_date: formData.expiryDate,
      });
      
      toast.success(`Policy created successfully! ID: ${result.id}`);
      router.push('/dashboard/policies');
    } catch (error: any) {
      console.error('Failed to create policy:', error);
      if (error.response?.status === 400) {
        toast.error(error.response.data?.message || 'Invalid policy data');
      } else {
        toast.error('Failed to create policy');
      }
    } finally {
      setLoading(false);
    }
  };

  const canUpgradeClass = selectedPatient && selectedPatient.pClass > 1;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => step === 1 ? router.back() : setStep(1)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeftIcon className="w-6 h-6 text-gray-600" />
        </button>
        <div className="flex items-center space-x-3">
          <ShieldCheckIcon className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Create Policy</h1>
            <p className="text-gray-600">
              {step === 1 ? 'Search for patient' : 'Create insurance policy'}
            </p>
          </div>
        </div>
      </div>

      {/* Step 1: Search Patient */}
      {step === 1 && (
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Search Patient</h2>
          <div className="space-y-4">
            <div>
              <label className="form-label">Patient NIK *</label>
              <div className="flex space-x-4">
                <input
                  type="text"
                  className="form-input flex-1"
                  placeholder="Enter 16-digit NIK"
                  value={searchNik}
                  onChange={(e) => setSearchNik(e.target.value)}
                  maxLength={16}
                />
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
        </div>
      )}

      {/* Step 2: Create Policy */}
      {step === 2 && selectedPatient && (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Patient Information */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Patient Information</h2>
              {canUpgradeClass && (
                <Link
                  href={`/dashboard/patients/upgrade-class?nik=${selectedPatient.nik}`}
                  className="btn-outline btn-sm"
                >
                  Upgrade Class
                </Link>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <span className="text-sm font-medium text-gray-500">NIK</span>
                <p className="font-mono">{selectedPatient.nik}</p>
              </div>
              
              <div>
                <span className="text-sm font-medium text-gray-500">Name</span>
                <p className="font-medium">{selectedPatient.user.name}</p>
              </div>
              
              <div>
                <span className="text-sm font-medium text-gray-500">Email</span>
                <p>{selectedPatient.user.email}</p>
              </div>
              
              <div>
                <span className="text-sm font-medium text-gray-500">Gender</span>
                <p>{selectedPatient.gender ? 'Female' : 'Male'}</p>
              </div>
              
              <div>
                <span className="text-sm font-medium text-gray-500">Birth Date</span>
                <p>{new Date(selectedPatient.birthDate).toLocaleDateString()}</p>
              </div>
              
              <div>
                <span className="text-sm font-medium text-gray-500">Class</span>
                <p>{PATIENT_CLASSES[selectedPatient.pClass as keyof typeof PATIENT_CLASSES]?.label}</p>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <span className="text-sm font-medium text-gray-500">Insurance Limit</span>
                  <p className="text-lg font-medium text-gray-900">
                    {formatCurrency(selectedPatient.insuranceLimit)}
                  </p>
                </div>
                
                <div>
                  <span className="text-sm font-medium text-gray-500">Available Limit</span>
                  <p className="text-lg font-medium text-green-600">
                    {formatCurrency(selectedPatient.availableLimit)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Policy Form */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Policy Details</h2>
            
            <div className="space-y-6">
              <div>
                <label className="form-label">Expiry Date *</label>
                <input
                  type="date"
                  className="form-input"
                  value={formData.expiryDate}
                  onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>

              <div>
                <label className="form-label">Insurance Company *</label>
                <select
                  className="form-select"
                  value={formData.companyId}
                  onChange={(e) => {
                    const company = companies.find(c => c.id === e.target.value);
                    if (company) {
                      handleCompanySelect(company);
                    }
                  }}
                  required
                >
                  <option value="">Select a company</option>
                  {companies.map((company) => (
                    <option key={company.id} value={company.id}>
                      {company.name}
                    </option>
                  ))}
                </select>
              </div>

              {selectedCompany && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium text-gray-700">Selected Company</h3>
                    <button
                      type="button"
                      onClick={loadCoverages}
                      className="btn-outline btn-sm"
                    >
                      Load Coverage
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Company:</span>
                      <span className="ml-2 font-medium">{selectedCompany.name}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Total Coverage:</span>
                      <span className="ml-2 font-medium">{formatCurrency(selectedCompany.totalCoverage)}</span>
                    </div>
                  </div>

                  {/* Coverage Check */}
                  {selectedCompany.totalCoverage > selectedPatient.availableLimit ? (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-800 font-medium">
                        Total Coverage Exceeds Patient Available Limit
                      </p>
                      <p className="text-xs text-red-700 mt-1">
                        Available: {formatCurrency(selectedPatient.availableLimit)} | 
                        Required: {formatCurrency(selectedCompany.totalCoverage)}
                      </p>
                      {canUpgradeClass ? (
                        <Link
                          href={`/dashboard/patients/upgrade-class?nik=${selectedPatient.nik}`}
                          className="inline-block mt-2 text-xs text-red-600 hover:text-red-500 underline"
                        >
                          Upgrade patient class to increase limit →
                        </Link>
                      ) : (
                        <p className="text-xs text-red-700 mt-1">
                          Patient is already in the highest class. Please select another company.
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm text-green-800 font-medium">
                        Coverage fits within available limit
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Coverage List */}
              {showCoverages && selectedCompany && (
                <div className="card">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Coverage Details</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="table-header">Treatment</th>
                          <th className="table-header">Coverage Amount</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {selectedCompany.coverages.map((coverage) => (
                          <tr key={coverage.id}>
                            <td className="table-cell">{coverage.name}</td>
                            <td className="table-cell font-medium">
                              {formatCurrency(coverage.coverageAmount)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex justify-between items-center text-lg font-semibold">
                      <span>Total Coverage:</span>
                      <span className="text-blue-600">{formatCurrency(selectedCompany.totalCoverage)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="btn-outline"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={loading || !selectedCompany || !formData.expiryDate || 
                       (selectedCompany && selectedCompany.totalCoverage > selectedPatient.availableLimit)}
              className="btn-primary flex items-center space-x-2"
            >
              {loading ? (
                <div className="spinner w-4 h-4"></div>
              ) : (
                <ShieldCheckIcon className="w-5 h-5" />
              )}
              <span>Create Policy</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
}