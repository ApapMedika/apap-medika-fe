'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { apiClient } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  FileText, 
  Search, 
  Eye, 
  Clock, 
  CheckCircle, 
  XCircle,
  AlertCircle,
  User,
  Calendar
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface Prescription {
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
  0: { label: 'Created', color: 'bg-blue-100 text-blue-800', icon: Clock },
  1: { label: 'Waiting for Stock', color: 'bg-yellow-100 text-yellow-800', icon: AlertCircle },
  2: { label: 'Done', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  3: { label: 'Cancelled', color: 'bg-red-100 text-red-800', icon: XCircle },
};

export default function PrescriptionsPage() {
  const { user } = useAuth();
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchPrescriptions();
  }, [statusFilter]);

  const fetchPrescriptions = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (statusFilter) params.status = statusFilter;
      
      const response = await apiClient.getPrescriptions(params);
      setPrescriptions(response.results || response);
    } catch (error) {
      toast.error('Failed to fetch prescriptions');
      console.error('Error fetching prescriptions:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPrescriptions = prescriptions.filter(prescription => 
    prescription.patient.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prescription.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (prescription.appointment?.doctor.user.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Prescriptions</h1>
          <p className="text-gray-600">
            {user?.role === 'pharmacist' && 'Process and manage patient prescriptions'}
            {user?.role === 'doctor' && 'View and manage prescriptions you created'}
            {user?.role === 'patient' && 'View your prescription history'}
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by patient, doctor, or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All statuses</SelectItem>
                  <SelectItem value="0">Created</SelectItem>
                  <SelectItem value="1">Waiting for Stock</SelectItem>
                  <SelectItem value="2">Done</SelectItem>
                  <SelectItem value="3">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Prescriptions Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            Prescriptions ({filteredPrescriptions.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredPrescriptions.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-500">No prescriptions found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-medium text-gray-900">ID</th>
                    <th className="text-left p-3 font-medium text-gray-900">Date Created</th>
                    <th className="text-left p-3 font-medium text-gray-900">Patient</th>
                    {user?.role === 'pharmacist' && (
                      <th className="text-left p-3 font-medium text-gray-900">Doctor</th>
                    )}
                    <th className="text-left p-3 font-medium text-gray-900">Total Price</th>
                    <th className="text-left p-3 font-medium text-gray-900">Status</th>
                    <th className="text-left p-3 font-medium text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPrescriptions.map((prescription) => {
                    const status = statusMap[prescription.status as keyof typeof statusMap];
                    const StatusIcon = status.icon;
                    
                    return (
                      <tr key={prescription.id} className="border-b hover:bg-gray-50">
                        <td className="p-3 font-mono text-sm">{prescription.id}</td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span className="text-sm">{formatDate(prescription.created_at)}</span>
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-blue-600" />
                            <div>
                              <p className="font-medium">{prescription.patient.user.name}</p>
                              <p className="text-sm text-gray-500">NIK: {prescription.patient.nik}</p>
                            </div>
                          </div>
                        </td>
                        {user?.role === 'pharmacist' && prescription.appointment && (
                          <td className="p-3">
                            <p className="font-medium">Dr. {prescription.appointment.doctor.user.name}</p>
                          </td>
                        )}
                        <td className="p-3 font-medium">
                          {formatCurrency(prescription.total_price)}
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <StatusIcon className="h-4 w-4" />
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${status.color}`}>
                              {status.label}
                            </span>
                          </div>
                        </td>
                        <td className="p-3">
                          <Link href={`/dashboard/prescriptions/${prescription.id}`}>
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}