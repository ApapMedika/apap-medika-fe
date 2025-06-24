'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import { apiClient } from '@/lib/api';
import { formatCurrency, formatDate } from '@/utils/format';
import {
  CurrencyDollarIcon,
  ArrowLeftIcon,
  CalendarDaysIcon,
  BeakerIcon,
  BuildingOfficeIcon,
  ShieldCheckIcon,
  CheckIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface BillDetail {
  id: string;
  patient: {
    id: string;
    name: string;
    nik: string;
  };
  appointment?: {
    id: string;
    totalFee: number;
  };
  prescription?: {
    id: string;
    totalPrice: number;
  };
  reservation?: {
    id: string;
    totalFee: number;
  };
  subtotal: number;
  policy?: {
    id: string;
    company: {
      name: string;
    };
  };
  coveragesUsed?: Array<{
    id: number;
    name: string;
    coverageAmount: number;
  }>;
  totalAmountDue: number;
  status: 'TREATMENT_IN_PROGRESS' | 'UNPAID' | 'PAID';
  createdAt: string;
  updatedAt: string;
  availablePolicies?: Array<{
    id: string;
    company: {
      name: string;
    };
    totalCoverage: number;
  }>;
}

export default function BillDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const [bill, setBill] = useState<BillDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPolicyId, setSelectedPolicyId] = useState('');
  const [showPriceModal, setShowPriceModal] = useState(false);
  const [paying, setPaying] = useState(false);

  // Redirect if not patient
  if (user?.role !== 'patient') {
    return (
      <div className="card text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
        <p className="text-gray-600">Only patients can view bill details.</p>
        <button onClick={() => router.back()} className="btn-primary mt-4">
          Go Back
        </button>
      </div>
    );
  }

  useEffect(() => {
    if (params.id) {
      fetchBill();
    }
  }, [params.id]);

  const fetchBill = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getBillById(params.id as string);
      setBill(data);
      
      // If unpaid and has appointment, fetch available policies
      if (data.status === 'UNPAID' && data.appointment) {
        // This would be a special API call to get policies that can cover the treatments
        // For now, we'll use the existing getPolicies call
        try {
          const policies = await apiClient.getPolicies({ patient: user?.id, status: 0 });
          data.availablePolicies = Array.isArray(policies) ? policies : policies.results || [];
        } catch (error) {
          console.log('No available policies found');
        }
      }
      
      setBill(data);
    } catch (error) {
      console.error('Failed to fetch bill:', error);
      toast.error('Failed to load bill details');
      router.push('/bills');
    } finally {
      setLoading(false);
    }
  };

  const handlePolicySelect = async () => {
    if (!selectedPolicyId || !bill) return;

    try {
      const updatedBill = await apiClient.updateBill(bill.id, {
        policy_id: selectedPolicyId,
      });
      setBill(updatedBill);
      toast.success('Policy applied successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to apply policy');
    }
  };

  const handlePayment = async () => {
    if (!bill) return;

    try {
      setPaying(true);
      await apiClient.payBill(bill.id);
      toast.success('Payment successful');
      fetchBill(); // Refresh bill data
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Payment failed');
    } finally {
      setPaying(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'TREATMENT_IN_PROGRESS':
        return <span className="badge badge-warning">Treatment in Progress</span>;
      case 'UNPAID':
        return <span className="badge badge-danger">Unpaid</span>;
      case 'PAID':
        return <span className="badge badge-success">Paid</span>;
      default:
        return <span className="badge badge-gray">Unknown</span>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="spinner w-8 h-8"></div>
      </div>
    );
  }

  if (!bill) {
    return (
      <div className="card text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Bill Not Found</h1>
        <p className="text-gray-600 mb-4">The bill you're looking for doesn't exist.</p>
        <Link href="/bills" className="btn-primary">
          Back to Bills
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.back()}
            className="btn-outline btn-sm"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Back
          </button>
          <div className="flex items-center space-x-3">
            <CurrencyDollarIcon className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Bill Details</h1>
              <p className="text-gray-600">ID: {bill.id}</p>
            </div>
          </div>
        </div>
        
        <div className="flex space-x-3">
          {bill.status === 'UNPAID' && (
            <button
              onClick={handlePayment}
              disabled={paying}
              className="btn-primary"
            >
              {paying ? (
                <div className="flex items-center">
                  <div className="w-4 h-4 border-b-2 border-white rounded-full animate-spin mr-2"></div>
                  Processing...
                </div>
              ) : (
                <>
                  <CheckIcon className="w-4 h-4 mr-2" />
                  Pay Bill
                </>
              )}
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bill Information */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Bill Information
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-600">Status</label>
              <div className="mt-1">
                {getStatusBadge(bill.status)}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600">Patient</label>
              <p className="text-gray-900 mt-1">{bill.patient.name}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600">Bill Date</label>
              <p className="text-gray-900 mt-1">{formatDate(bill.createdAt)}</p>
            </div>
          </div>
        </div>

        {/* Payment Summary */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Payment Summary</h2>
            <button
              onClick={() => setShowPriceModal(true)}
              className="btn-outline btn-sm"
            >
              <InformationCircleIcon className="w-4 h-4 mr-2" />
              View Details
            </button>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-gray-200">
              <span className="text-gray-600">Subtotal:</span>
              <span className="font-medium text-gray-900">{formatCurrency(bill.subtotal)}</span>
            </div>

            {bill.coveragesUsed && bill.coveragesUsed.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">Insurance Coverage:</p>
                {bill.coveragesUsed.map((coverage) => (
                  <div key={coverage.id} className="flex justify-between items-center py-1 text-sm">
                    <span className="text-green-600">- {coverage.name}</span>
                    <span className="text-green-600">-{formatCurrency(coverage.coverageAmount)}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-between items-center py-3 border-t border-gray-200 text-lg font-semibold">
              <span className="text-gray-900">Total Amount Due:</span>
              <span className="text-blue-600">{formatCurrency(bill.totalAmountDue)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Services */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Services</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {bill.appointment && (
            <div className="p-4 border rounded-lg">
              <div className="flex items-center space-x-3 mb-3">
                <CalendarDaysIcon className="w-6 h-6 text-blue-600" />
                <h3 className="font-semibold text-gray-900">Appointment</h3>
              </div>
              <p className="text-sm text-gray-600 mb-2">ID: {bill.appointment.id}</p>
              <p className="font-medium text-gray-900">{formatCurrency(bill.appointment.totalFee)}</p>
              <Link
                href={`/appointments/${bill.appointment.id}`}
                className="text-blue-600 hover:text-blue-500 text-sm"
              >
                View Details →
              </Link>
            </div>
          )}

          {bill.prescription && (
            <div className="p-4 border rounded-lg">
              <div className="flex items-center space-x-3 mb-3">
                <BeakerIcon className="w-6 h-6 text-green-600" />
                <h3 className="font-semibold text-gray-900">Prescription</h3>
              </div>
              <p className="text-sm text-gray-600 mb-2">ID: {bill.prescription.id}</p>
              <p className="font-medium text-gray-900">{formatCurrency(bill.prescription.totalPrice)}</p>
              <Link
                href={`/prescriptions/${bill.prescription.id}`}
                className="text-blue-600 hover:text-blue-500 text-sm"
              >
                View Details →
              </Link>
            </div>
          )}

          {bill.reservation && (
            <div className="p-4 border rounded-lg">
              <div className="flex items-center space-x-3 mb-3">
                <BuildingOfficeIcon className="w-6 h-6 text-purple-600" />
                <h3 className="font-semibold text-gray-900">Reservation</h3>
              </div>
              <p className="text-sm text-gray-600 mb-2">ID: {bill.reservation.id}</p>
              <p className="font-medium text-gray-900">{formatCurrency(bill.reservation.totalFee)}</p>
              <Link
                href={`/reservations/${bill.reservation.id}`}
                className="text-blue-600 hover:text-blue-500 text-sm"
              >
                View Details →
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Policy Selection */}
      {bill.status === 'UNPAID' && bill.appointment && !bill.policy && bill.availablePolicies && bill.availablePolicies.length > 0 && (
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Apply Insurance Policy</h2>
          
          <div className="space-y-4">
            <div>
              <label className="form-label">Select Policy</label>
              <select
                className="form-select"
                value={selectedPolicyId}
                onChange={(e) => setSelectedPolicyId(e.target.value)}
              >
                <option value="">Select a policy</option>
                {bill.availablePolicies.map((policy) => (
                  <option key={policy.id} value={policy.id}>
                    {policy.id} - {policy.company.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handlePolicySelect}
              disabled={!selectedPolicyId}
              className="btn-primary"
            >
              <ShieldCheckIcon className="w-4 h-4 mr-2" />
              Apply Policy
            </button>
          </div>
        </div>
      )}

      {/* Applied Policy */}
      {bill.policy && (
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Applied Insurance</h2>
          
          <div className="p-4 bg-green-50 rounded-lg">
            <div className="flex items-center space-x-3 mb-3">
              <ShieldCheckIcon className="w-6 h-6 text-green-600" />
              <h3 className="font-semibold text-green-900">Policy Applied</h3>
            </div>
            <p className="text-green-800">Policy ID: {bill.policy.id}</p>
            <p className="text-green-800">Company: {bill.policy.company.name}</p>
          </div>
        </div>
      )}

      {/* Price Details Modal */}
      {showPriceModal && (
        <div className="modal-container">
          <div className="modal-backdrop" onClick={() => setShowPriceModal(false)}></div>
          <div className="flex items-center justify-center min-h-full p-4">
            <div className="modal-content max-w-lg">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Price Breakdown
                </h3>
                
                <div className="space-y-3">
                  {bill.appointment && (
                    <div className="flex justify-between py-2 border-b">
                      <span>Appointment Fee:</span>
                      <span>{formatCurrency(bill.appointment.totalFee)}</span>
                    </div>
                  )}
                  
                  {bill.prescription && (
                    <div className="flex justify-between py-2 border-b">
                      <span>Prescription Cost:</span>
                      <span>{formatCurrency(bill.prescription.totalPrice)}</span>
                    </div>
                  )}
                  
                  {bill.reservation && (
                    <div className="flex justify-between py-2 border-b">
                      <span>Room Reservation:</span>
                      <span>{formatCurrency(bill.reservation.totalFee)}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between py-2 border-b font-semibold">
                    <span>Subtotal:</span>
                    <span>{formatCurrency(bill.subtotal)}</span>
                  </div>
                  
                  {bill.coveragesUsed && bill.coveragesUsed.length > 0 && (
                    <>
                      <p className="text-sm font-medium text-gray-600 mt-4 mb-2">Insurance Coverage:</p>
                      {bill.coveragesUsed.map((coverage) => (
                        <div key={coverage.id} className="flex justify-between py-1">
                          <span className="text-green-600">- {coverage.name}</span>
                          <span className="text-green-600">-{formatCurrency(coverage.coverageAmount)}</span>
                        </div>
                      ))}
                    </>
                  )}
                  
                  <div className="flex justify-between py-3 border-t font-bold text-lg">
                    <span>Total Amount Due:</span>
                    <span className="text-blue-600">{formatCurrency(bill.totalAmountDue)}</span>
                  </div>
                </div>
                
                <div className="flex justify-end mt-6">
                  <button
                    onClick={() => setShowPriceModal(false)}
                    className="btn-primary"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}