'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { apiClient } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  CreditCard, 
  Eye, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Calendar,
  FileText
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface Bill {
  id: string;
  appointment?: {
    id: string;
    doctor: { user: { name: string } };
    total_fee: number;
  };
  prescription?: {
    id: string;
    total_price: number;
  };
  reservation?: {
    id: string;
    total_fee: number;
  };
  policy?: {
    id: string;
    company: { name: string };
  };
  status: string;
  subtotal: number;
  total_amount_due: number;
  created_at: string;
  treatments_covered?: {
    treatment: string;
    amount: number;
  }[];
}

const statusMap = {
  'treatment_in_progress': { label: 'Treatment In Progress', color: 'bg-blue-100 text-blue-800', icon: Clock },
  'unpaid': { label: 'Unpaid', color: 'bg-yellow-100 text-yellow-800', icon: AlertCircle },
  'paid': { label: 'Paid', color: 'bg-green-100 text-green-800', icon: CheckCircle },
};

export default function BillsPage() {
  const { user } = useAuth();
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role === 'patient') {
      fetchBills();
    }
  }, [user]);

  const fetchBills = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getBills();
      setBills(response.results || response);
    } catch (error) {
      toast.error('Failed to fetch bills');
      console.error('Error fetching bills:', error);
    } finally {
      setLoading(false);
    }
  };

  if (user?.role !== 'patient') {
    return (
      <div className="text-center py-8">
        <CreditCard className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <p className="text-gray-500">Access denied. Patient access required.</p>
      </div>
    );
  }

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
    });
  };

  const unpaidBills = bills.filter(bill => bill.status === 'unpaid');
  const paidBills = bills.filter(bill => bill.status === 'paid');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Bills</h1>
        <p className="text-gray-600">View and manage your medical bills</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Bills</p>
                <p className="text-2xl font-bold">{bills.length}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Unpaid Bills</p>
                <p className="text-2xl font-bold text-red-600">{unpaidBills.length}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Outstanding</p>
                <p className="text-2xl font-bold text-red-600">
                  {formatCurrency(unpaidBills.reduce((sum, bill) => sum + bill.total_amount_due, 0))}
                </p>
              </div>
              <CreditCard className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Unpaid Bills */}
      {unpaidBills.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">Unpaid Bills ({unpaidBills.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-medium text-gray-900">Bill ID</th>
                    <th className="text-left p-3 font-medium text-gray-900">Date</th>
                    <th className="text-left p-3 font-medium text-gray-900">Services</th>
                    <th className="text-left p-3 font-medium text-gray-900">Amount Due</th>
                    <th className="text-left p-3 font-medium text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {unpaidBills.map((bill) => (
                    <tr key={bill.id} className="border-b hover:bg-gray-50">
                      <td className="p-3 font-mono text-sm">{bill.id}</td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span>{formatDate(bill.created_at)}</span>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="space-y-1">
                          {bill.appointment && (
                            <div className="text-sm">
                              <span className="font-medium">Appointment:</span> Dr. {bill.appointment.doctor.user.name}
                            </div>
                          )}
                          {bill.prescription && (
                            <div className="text-sm">
                              <span className="font-medium">Prescription</span>
                            </div>
                          )}
                          {bill.reservation && (
                            <div className="text-sm">
                              <span className="font-medium">Room Reservation</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-3">
                        <div>
                          <p className="font-bold text-lg text-red-600">
                            {formatCurrency(bill.total_amount_due)}
                          </p>
                          {bill.subtotal !== bill.total_amount_due && (
                            <p className="text-sm text-gray-500 line-through">
                              {formatCurrency(bill.subtotal)}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="p-3">
                        <Link href={`/dashboard/bills/${bill.id}`}>
                          <Button size="sm">
                            <Eye className="h-4 w-4 mr-2" />
                            View & Pay
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Bills */}
      <Card>
        <CardHeader>
          <CardTitle>All Bills ({bills.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : bills.length === 0 ? (
            <div className="text-center py-8">
              <CreditCard className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-500">No bills found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-medium text-gray-900">Bill ID</th>
                    <th className="text-left p-3 font-medium text-gray-900">Date</th>
                    <th className="text-left p-3 font-medium text-gray-900">Status</th>
                    <th className="text-left p-3 font-medium text-gray-900">Amount</th>
                    <th className="text-left p-3 font-medium text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bills.map((bill) => {
                    const status = statusMap[bill.status as keyof typeof statusMap];
                    const StatusIcon = status?.icon || Clock;
                    
                    return (
                      <tr key={bill.id} className="border-b hover:bg-gray-50">
                        <td className="p-3 font-mono text-sm">{bill.id}</td>
                        <td className="p-3">{formatDate(bill.created_at)}</td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <StatusIcon className="h-4 w-4" />
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${status?.color || 'bg-gray-100 text-gray-800'}`}>
                              {status?.label || bill.status}
                            </span>
                          </div>
                        </td>
                        <td className="p-3 font-medium">
                          {formatCurrency(bill.total_amount_due)}
                        </td>
                        <td className="p-3">
                          <Link href={`/dashboard/bills/${bill.id}`}>
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