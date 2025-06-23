'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { apiClient } from '@/lib/api';
import { formatCurrency } from '@/utils/format';
import { PATIENT_CLASSES } from '@/utils/constants';
import {
  ShieldCheckIcon,
  ArrowLeftIcon,
  UserIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface Patient {
  id: string;
  name: string;
  nik: string;
  email: string;
  gender: boolean;
  birthDate: string;
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
      const data = await apiClient.get('/insurance/companies/');
      setCompanies(Array.isArray(data) ? data : data.results || []);
    } catch (error) {
      console.error('Failed to fetch companies:', error);
      toast.error('Failed to load insurance companies');
    }
  };

  const searchPatient = async () => {
    if (!searchNik.trim()) {
      toast.error('Please enter NIK');
      return;
    }

    try {
      setSearching(true);
      const patient = await apiClient.getPatientByNik(searchNik);
      setSelectedPatient(patient);
      setStep(2);
      toast.success('Patient found');
    } catch (error: any) {
      if (error.response?.status === 404) {
        toast.error('Patient not found');
        // In a real app, we might redirect to create patient
      } else {
        toast.error('Failed to search patient');
      }
    } finally {
      setSearching(false);
    }
  };

  const handleCompanySelect = (companyId: string) => {
    const company = companies.find(c => c.id === companyId);
    setSelectedCompany(company || null);
    setFormData(prev => ({ ...prev, companyId }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedPatient || !selectedCompany || !formData.expiryDate) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (selectedCompany.totalCoverage > selectedPatient.availableLimit) {
      toast.error('Total coverage exceeds patient available limit. Please upgrade patient class or select another company.');
      return;
    }

    try {
      setLoading(true);
      const response = await apiClient.createPolicy({
        patient_id: selectedPatient.id,
        company_id: selectedCompany.id,
        expiry_date: formData.expiryDate,
      });
      
      toast.success('Policy created successfully');
      router.push('/dashboard/policies');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create policy');
    } finally {
      setLoading(false);
    }
  };

  const patientClass = selectedPatient ? PATIENT_CLASSES[selectedPatient.pClass as keyof typeof PATIENT_CLASSES] : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => step === 1 ? router.back() : setStep(1)}
          className="btn-outline btn-sm"
        >
          <ArrowLeftIcon className="w-4 h-4 mr-2" />
          Back
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

      {step === 1 ? (
        /* Step 1: Search Patient */
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Search Patient</h2>
          
          <div className="space-y-4">
            <div>
              <label className="form-label">Patient NIK *</label>
              <div className="flex space-x-4">
                <input
                  type="text"
                  placeholder="Enter 16-digit NIK"
                  className="form-input flex-1"
                  value={searchNik}
                  onChange={(e) => setSearchNik(e.target.value)}
                  maxLength={16}
                />
                <button
                  onClick={searchPatient}
                  disabled={searching}
                  className="btn-primary"
                >
                  {searching ? (
                    <div className="flex items-center">
                      <div className="w-4 h-4 border-b-2 border-white rounded-full animate-spin mr-2"></div>
                      Searching...
                    </div>
                  ) : (
                    <>
                      <MagnifyingGlassIcon className="w-4 h-4 mr-2" />
                      Search
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Step 2: Create Policy */
        <div className="space-y-6">
          {/* Patient Preview */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Patient Information</h2>
            {selectedPatient && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">NIK</label>
                  <p className="text-gray-900">{selectedPatient.nik}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Name</label>
                  <p className="text-gray-900">{selectedPatient.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Gender</label>
                  <p className="text-gray-900">{selectedPatient.gender ? 'Female' : 'Male'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Class</label>
                  <p className="text-gray-900">{patientClass?.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Insurance Limit</label>
                  <p className="text-gray-900">{formatCurrency(selectedPatient.insuranceLimit)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Available Limit</label>
                  <p className="text-green-600 font-semibold">{formatCurrency(selectedPatient.availableLimit)}</p>
                </div>
              </div>
            )}
          </div>

          {/* Policy Form */}
          <div className="card">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="form-label">Expiry Date *</label>
                  <input
                    type="date"
                    className="form-input"
                    value={formData.expiryDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, expiryDate: e.target.value }))}
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>

                <div>
                  <label className="form-label">Insurance Company *</label>
                  <select
                    className="form-select"
                    value={formData.companyId}
                    onChange={(e) => handleCompanySelect(e.target.value)}
                    required
                  >
                    <option value="">Select company</option>
                    {companies.map((company) => (
                      <option key={company.id} value={company.id}>
                        {company.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {selectedCompany && (
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Company Coverage</h3>
                  
                  <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-blue-900">Total Coverage:</span>
                      <span className="text-lg font-bold text-blue-900">
                        {formatCurrency(selectedCompany.totalCoverage)}
                      </span>
                    </div>
                    {selectedPatient && (
                      <div className="mt-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-blue-700">Available Limit:</span>
                          <span className="text-blue-700">
                            {formatCurrency(selectedPatient.availableLimit)}
                          </span>
                        </div>
                        {selectedCompany.totalCoverage > selectedPatient.availableLimit && (
                          <div className="mt-2 p-2 bg-red-100 rounded text-red-800 text-sm">
                            ⚠️ Coverage exceeds available limit! Consider upgrading patient class.
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="table-container">
                    <table className="table">
                      <thead className="table-header">
                        <tr>
                          <th className="table-header-cell">Coverage Name</th>
                          <th className="table-header-cell">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="table-body">
                        {selectedCompany.coverages.map((coverage) => (
                          <tr key={coverage.id}>
                            <td className="table-cell">{coverage.name}</td>
                            <td className="table-cell">{formatCurrency(coverage.coverageAmount)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="btn-secondary"
                >
                  Back to Search
                </button>
                <button
                  type="submit"
                  disabled={loading || (selectedCompany && selectedPatient && selectedCompany.totalCoverage > selectedPatient.availableLimit)}
                  className="btn-primary"
                >
                  {loading ? 'Creating Policy...' : 'Create Policy'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}