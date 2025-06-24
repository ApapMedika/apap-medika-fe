'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import { apiClient } from '@/lib/api';
import { formatCurrency, formatDate } from '@/utils/format';
import { PRESCRIPTION_STATUS } from '@/utils/constants';
import {
  BeakerIcon,
  ArrowLeftIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface PrescriptionDetail {
  id: string;
  patient: {
    id: string;
    name: string;
    nik: string;
  };
  appointment?: {
    id: string;
  };
  status: number;
  totalPrice: number;
  medicines: Array<{
    medicine: {
      id: string;
      name: string;
    };
    quantity: number;
    fulfilledQuantity: number;
    price: number;
  }>;
  processedBy?: string;
  createdAt: string;
  createdBy: string;
}

export default function PrescriptionDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const [prescription, setPrescription] = useState<PrescriptionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCancelModal, setShowCancelModal] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchPrescription();
    }
  }, [params.id]);

  const fetchPrescription = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getPrescriptionById(params.id as string);
      setPrescription(data);
    } catch (error) {
      console.error('Failed to fetch prescription:', error);
      toast.error('Failed to load prescription details');
      router.push('/prescriptions');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!prescription) return;

    try {
      await apiClient.cancelPrescription(prescription.id);
      toast.success('Prescription cancelled successfully');
      setShowCancelModal(false);
      
      // Redirect based on user role
      if (user?.role === 'doctor' && prescription.appointment) {
        router.push(`/appointments/${prescription.appointment.id}`);
      } else {
        router.push('/prescriptions');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to cancel prescription');
    }
  };

  const getStatusBadge = (status: number) => {
    switch (status) {
      case PRESCRIPTION_STATUS.CREATED:
        return <span className="badge badge-warning">Created</span>;
      case PRESCRIPTION_STATUS.WAITING_FOR_STOCK:
        return <span className="badge badge-warning">Waiting for Stock</span>;
      case PRESCRIPTION_STATUS.DONE:
        return <span className="badge badge-success">Done</span>;
      case PRESCRIPTION_STATUS.CANCELLED:
        return <span className="badge badge-danger">Cancelled</span>;
      default:
        return <span className="badge badge-gray">Unknown</span>;
    }
  };

  const canUpdate = (user?.role === 'doctor' || user?.role === 'pharmacist') && 
                   prescription?.status === PRESCRIPTION_STATUS.CREATED;
  const canMarkDone = user?.role === 'pharmacist' && 
                     (prescription?.status === PRESCRIPTION_STATUS.CREATED || 
                      prescription?.status === PRESCRIPTION_STATUS.WAITING_FOR_STOCK);
  const canCancel = (user?.role === 'doctor' || user?.role === 'pharmacist') && 
                   (prescription?.status === PRESCRIPTION_STATUS.CREATED || 
                    prescription?.status === PRESCRIPTION_STATUS.WAITING_FOR_STOCK);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="spinner w-8 h-8"></div>
      </div>
    );
  }

  if (!prescription) {
    return (
      <div className="card text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Prescription Not Found</h1>
        <p className="text-gray-600 mb-4">The prescription you're looking for doesn't exist.</p>
        <Link href="/prescriptions" className="btn-primary">
          Back to Prescriptions
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
            <BeakerIcon className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Prescription Details</h1>
              <p className="text-gray-600">ID: {prescription.id}</p>
            </div>
          </div>
        </div>
        
        <div className="flex space-x-3">
          {canMarkDone && (
            <Link
              href={`/prescriptions/${prescription.id}/process`}
              className="btn-primary btn-sm"
            >
              <CheckIcon className="w-4 h-4 mr-2" />
              Mark as Done
            </Link>
          )}
          
          {canUpdate && (
            <Link
              href={`/prescriptions/${prescription.id}/edit`}
              className="btn-outline btn-sm"
            >
              <PencilIcon className="w-4 h-4 mr-2" />
              Update
            </Link>
          )}
          
          {canCancel && (
            <button
              onClick={() => setShowCancelModal(true)}
              className="btn-danger btn-sm"
            >
              <XMarkIcon className="w-4 h-4 mr-2" />
              Cancel
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Information */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Prescription Information
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-600">Status</label>
              <div className="mt-1">
                {getStatusBadge(prescription.status)}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600">Patient Name</label>
              <p className="text-gray-900 mt-1">{prescription.patient.name}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600">Date Created</label>
              <p className="text-gray-900 mt-1">{formatDate(prescription.createdAt)}</p>
            </div>

            {prescription.processedBy && (
              <div>
                <label className="text-sm font-medium text-gray-600">Pharmacist who processed</label>
                <p className="text-gray-900 mt-1">{prescription.processedBy}</p>
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-gray-600">Total Price</label>
              <p className="text-lg font-semibold text-gray-900 mt-1">
                {formatCurrency(prescription.totalPrice)}
              </p>
            </div>
          </div>
        </div>

        {/* Patient Information */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Patient Information
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-600">Patient ID</label>
              <p className="text-gray-900 mt-1">{prescription.patient.id}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600">NIK</label>
              <p className="text-gray-900 mt-1">{prescription.patient.nik}</p>
            </div>

            {prescription.appointment && (
              <div>
                <label className="text-sm font-medium text-gray-600">Related Appointment</label>
                <div className="mt-1">
                  <Link
                    href={`/appointments/${prescription.appointment.id}`}
                    className="text-blue-600 hover:text-blue-500 font-medium"
                  >
                    {prescription.appointment.id}
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Medicines List */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          Prescribed Medicines
        </h2>
        
        <div className="table-container">
          <table className="table">
            <thead className="table-header">
              <tr>
                <th className="table-header-cell">Medicine ID</th>
                <th className="table-header-cell">Medicine Name</th>
                <th className="table-header-cell">Requested</th>
                <th className="table-header-cell">Fulfilled</th>
                <th className="table-header-cell">Price per Unit</th>
              </tr>
            </thead>
            <tbody className="table-body">
              {prescription.medicines.map((item, index) => (
                <tr key={index}>
                  <td className="table-cell">
                    <Link
                      href={`/medicines/${item.medicine.id}`}
                      className="text-blue-600 hover:text-blue-500 font-mono text-sm"
                    >
                      {item.medicine.id}
                    </Link>
                  </td>
                  <td className="table-cell font-medium">
                    {item.medicine.name}
                  </td>
                  <td className="table-cell">
                    {item.quantity}
                  </td>
                  <td className="table-cell">
                    <span className={`font-medium ${
                      item.fulfilledQuantity === item.quantity ? 'text-green-600' : 
                      item.fulfilledQuantity > 0 ? 'text-yellow-600' : 
                      'text-red-600'
                    }`}>
                      {item.fulfilledQuantity}
                    </span>
                  </td>
                  <td className="table-cell">
                    {formatCurrency(item.price)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cancel Confirmation Modal */}
      {showCancelModal && (
        <div className="modal-container">
          <div className="modal-backdrop" onClick={() => setShowCancelModal(false)}></div>
          <div className="flex items-center justify-center min-h-full p-4">
            <div className="modal-content">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Cancel Prescription
                </h3>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to cancel this prescription? This action cannot be undone.
                </p>
                
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowCancelModal(false)}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCancel}
                    className="btn-danger"
                  >
                    Confirm Cancel
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