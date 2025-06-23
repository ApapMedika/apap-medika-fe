'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { apiClient } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  ArrowLeft, 
  FileText, 
  User, 
  Stethoscope, 
  CheckCircle, 
  Edit, 
  XCircle,
  Package,
  Clock
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface PrescriptionDetail {
  id: string;
  patient: {
    user: { name: string };
    nik: string;
  };
  appointment?: {
    id: string;
    doctor: { user: { name: string } };
  };
  status: number;
  total_price: number;
  processed_by?: { user: { name: string } };
  created_at: string;
  medicines: {
    medicine: { id: string; name: string; price: number };
    quantity: number;
    fulfilled_quantity: number;
  }[];
}

const statusMap = {
  0: { label: 'Created', color: 'bg-blue-100 text-blue-800' },
  1: { label: 'Waiting for Stock', color: 'bg-yellow-100 text-yellow-800' },
  2: { label: 'Done', color: 'bg-green-100 text-green-800' },
  3: { label: 'Cancelled', color: 'bg-red-100 text-red-800' },
};

export default function PrescriptionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [prescription, setPrescription] = useState<PrescriptionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchPrescription();
    }
  }, [params.id]);

  const fetchPrescription = async () => {
    try {
      const response = await apiClient.getPrescriptionById(params.id as string);
      setPrescription(response);
    } catch (error) {
      toast.error('Failed to fetch prescription details');
      router.push('/dashboard/prescriptions');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async () => {
    if (!prescription || user?.role !== 'pharmacist') return;

    setActionLoading(true);
    try {
      await apiClient.updatePrescriptionStatus(prescription.id, user.id);
      toast.success('Prescription processed successfully');
      fetchPrescription();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to process prescription');
    } finally {
      setActionLoading(false);
    }
  };

  const cancelPrescription = async () => {
    if (!prescription) return;

    setActionLoading(true);
    try {
      await apiClient.cancelPrescription(prescription.id);
      toast.success('Prescription cancelled successfully');
      fetchPrescription();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to cancel prescription');
    } finally {
      setActionLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!prescription) {
    return (
      <div className="text-center">
        <p className="text-gray-500">Prescription not found</p>
        <Link href="/dashboard/prescriptions">
          <Button className="mt-4">Back to Prescriptions</Button>
        </Link>
      </div>
    );
  }

  const canEdit = (user?.role === 'doctor' || user?.role === 'pharmacist') && prescription.status === 0;
  const canProcess = user?.role === 'pharmacist' && prescription.status < 2;
  const canCancel = (user?.role === 'doctor' || user?.role === 'pharmacist') && prescription.status < 2;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/prescriptions">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Prescription Details</h1>
            <p className="text-gray-600">ID: {prescription.id}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            statusMap[prescription.status as keyof typeof statusMap]?.color
          }`}>
            {statusMap[prescription.status as keyof typeof statusMap]?.label}
          </span>
        </div>
      </div>

      {/* Main Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Patient Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Patient Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-gray-500">Name</p>
              <p className="font-medium">{prescription.patient.user.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">NIK</p>
              <p className="font-medium">{prescription.patient.nik}</p>
            </div>
          </CardContent>
        </Card>

        {/* Doctor Information */}
        {prescription.appointment && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Stethoscope className="h-5 w-5" />
                Prescribing Doctor
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p className="font-medium">Dr. {prescription.appointment.doctor.user.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Appointment ID</p>
                <Link 
                  href={`/dashboard/appointments/${prescription.appointment.id}`}
                  className="font-medium text-blue-600 hover:text-blue-500"
                >
                  {prescription.appointment.id}
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Prescription Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Prescription Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-500">Created Date</p>
              <p className="font-medium">{new Date(prescription.created_at).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Price</p>
              <p className="font-medium text-lg">{formatCurrency(prescription.total_price)}</p>
            </div>
            {prescription.processed_by && (
              <div>
                <p className="text-sm text-gray-500">Processed By</p>
                <p className="font-medium">{prescription.processed_by.user.name}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Medicine List */}
      <Card>
        <CardHeader>
          <CardTitle>Prescribed Medicines</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {prescription.medicines.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Package className="h-5 w-5 text-blue-600" />
                  <div>
                    <Link 
                      href={`/dashboard/medicines/${item.medicine.id}`}
                      className="font-medium text-blue-600 hover:text-blue-500"
                    >
                      {item.medicine.name}
                    </Link>
                    <p className="text-sm text-gray-500">
                      {formatCurrency(item.medicine.price)} per unit
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">
                    {item.fulfilled_quantity}/{item.quantity} units
                  </p>
                  <p className="text-sm text-gray-500">
                    {formatCurrency(item.fulfilled_quantity * item.medicine.price)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {canEdit && (
              <Link href={`/dashboard/prescriptions/${prescription.id}/edit`}>
                <Button variant="outline">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Prescription
                </Button>
              </Link>
            )}

            {canProcess && (
              <Button onClick={updateStatus} disabled={actionLoading}>
                <CheckCircle className="h-4 w-4 mr-2" />
                Mark as Done
              </Button>
            )}

            {canCancel && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <XCircle className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Cancel Prescription</DialogTitle>
                    <DialogDescription>
                      Are you sure you want to cancel this prescription? This action cannot be undone.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline">No, Keep It</Button>
                    <Button variant="destructive" onClick={cancelPrescription}>
                      Yes, Cancel
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}