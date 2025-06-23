'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { apiClient } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  ArrowLeft, 
  CreditCard, 
  FileText, 
  Shield, 
  CheckCircle,
  Calendar,
  User,
  Building2,
  Pill
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface BillDetail {
  id: string;
  appointment?: {
    id: string;
    doctor: { user: { name: string } };
    total_fee: number;
    treatments: { name: string; price: number }[];
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
  available_policies?: {
    id: string;
    company: { name: string };
    coverages: { name: string; amount: number }[];
  }[];
}

export default function BillDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [bill, setBill] = useState<BillDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPolicy, setSelectedPolicy] = useState<string>('');
  const [updating, setUpdating] = useState(false);
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchBill();
    }
  }, [params.id]);

  const fetchBill = async () => {
    try {
      const response = await apiClient.getBillById(params.id as string);
      setBill(response);
    } catch (error) {
      toast.error('Failed to fetch bill details');
      router.push('/dashboard/bills');
    } finally {
      setLoading(false);
    }
  };

  const updateBillWithPolicy = async () => {
    if (!bill || !selectedPolicy) return;

    setUpdating(true);
    try {
      await apiClient.updateBill(bill.id, {
        policy_id: selectedPolicy
      });
      toast.success('Policy applied successfully');
      fetchBill();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to apply policy');
    } finally {
      setUpdating(false);
    }
  };

  const payBill = async () => {
    if (!bill) return;

    setPaying(true);
    try {
      await apiClient.payBill(bill.id);
      toast.success('Bill paid successfully');
      fetchBill();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to process payment');
    } finally {
      setPaying(false);
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

  if (!bill) {
    return (
      <div className="text-center">
        <p className="text-gray-500">Bill not found</p>
        <Link href="/dashboard/bills">
          <Button className="mt-4">Back to Bills</Button>
        </Link>
      </div>
    );
  }

  const canSelectPolicy = bill.status === 'unpaid' && bill.appointment && !bill.policy;
  const canPay = bill.status === 'unpaid';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/bills">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Bill Details</h1>
            <p className="text-gray-600">ID: {bill.id}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            bill.status === 'paid' 
              ? 'bg-green-100 text-green-800'
              : bill.status === 'unpaid'
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-blue-100 text-blue-800'
          }`}>
            {bill.status.replace('_', ' ').toUpperCase()}
          </span>
        </div>
      </div>

      {/* Bill Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Bill Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Bill Date</p>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                <p className="font-medium">{new Date(bill.created_at).toLocaleDateString()}</p>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-500">Patient</p>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-gray-400" />
                <p className="font-medium">{user?.name}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Services Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Services Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Appointment */}
          {bill.appointment && (
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  <span className="font-medium">Appointment</span>
                </div>
                <span className="font-medium">{formatCurrency(bill.appointment.total_fee)}</span>
              </div>
              <p className="text-sm text-gray-600">
                ID: {bill.appointment.id} | Dr. {bill.appointment.doctor.user.name}
              </p>
              {bill.appointment.treatments && bill.appointment.treatments.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm font-medium text-gray-700">Treatments:</p>
                  <ul className="text-sm text-gray-600">
                    {bill.appointment.treatments.map((treatment, index) => (
                      <li key={index} className="flex justify-between">
                        <span>{treatment.name}</span>
                        <span>{formatCurrency(treatment.price)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Prescription */}
          {bill.prescription && (
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Pill className="h-5 w-5 text-green-600" />
                  <span className="font-medium">Prescription</span>
                </div>
                <span className="font-medium">{formatCurrency(bill.prescription.total_price)}</span>
              </div>
              <p className="text-sm text-gray-600">
                ID: {bill.prescription.id}
              </p>
            </div>
          )}

          {/* Reservation */}
          {bill.reservation && (
            <div className="p-4 bg-purple-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-purple-600" />
                  <span className="font-medium">Room Reservation</span>
                </div>
                <span className="font-medium">{formatCurrency(bill.reservation.total_fee)}</span>
              </div>
              <p className="text-sm text-gray-600">
                ID: {bill.reservation.id}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Insurance Policy */}
      {canSelectPolicy && bill.available_policies && bill.available_policies.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Apply Insurance Policy
            </CardTitle>
            <CardDescription>
              Select a policy to reduce your bill amount
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Select Policy</label>
              <Select value={selectedPolicy} onValueChange={setSelectedPolicy}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a policy" />
                </SelectTrigger>
                <SelectContent>
                  {bill.available_policies.map((policy) => (
                    <SelectItem key={policy.id} value={policy.id}>
                      {policy.id} - {policy.company.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedPolicy && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Available Coverages:</p>
                <div className="space-y-2">
                  {bill.available_policies
                    ?.find(p => p.id === selectedPolicy)
                    ?.coverages.map((coverage, index) => (
                      <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <span className="text-sm">{coverage.name}</span>
                        <span className="text-sm font-medium">{formatCurrency(coverage.amount)}</span>
                      </div>
                    ))}
                </div>
              </div>
            )}

            <Button onClick={updateBillWithPolicy} disabled={!selectedPolicy || updating}>
              {updating ? 'Applying...' : 'Apply Policy'}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Applied Policy */}
      {bill.policy && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Applied Insurance Policy
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="font-medium">Policy: {bill.policy.id}</p>
              <p className="text-sm text-gray-600">Company: {bill.policy.company.name}</p>
            </div>

            {bill.treatments_covered && bill.treatments_covered.length > 0 && (
              <div>
                <p className="font-medium text-gray-700 mb-2">Treatments Covered:</p>
                <div className="space-y-2">
                  {bill.treatments_covered.map((covered, index) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span className="text-sm">{covered.treatment}</span>
                      <span className="text-sm font-medium text-green-600">
                        -{formatCurrency(covered.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Payment Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span className="font-medium">{formatCurrency(bill.subtotal)}</span>
          </div>
          
          {bill.treatments_covered && bill.treatments_covered.length > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Insurance Coverage</span>
              <span className="font-medium">
                -{formatCurrency(bill.treatments_covered.reduce((sum, c) => sum + c.amount, 0))}
              </span>
            </div>
          )}
          
          <div className="border-t pt-3 flex justify-between text-lg font-bold">
            <span>Total Amount Due</span>
            <span className={bill.status === 'paid' ? 'text-green-600' : 'text-red-600'}>
              {formatCurrency(bill.total_amount_due)}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Payment Action */}
      {canPay && (
        <Card>
          <CardHeader>
            <CardTitle>Payment</CardTitle>
            <CardDescription>
              Complete your payment to finalize this bill
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Dialog>
              <DialogTrigger asChild>
                <Button size="lg" className="w-full">
                  <CreditCard className="h-5 w-5 mr-2" />
                  Pay {formatCurrency(bill.total_amount_due)}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Confirm Payment</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to pay {formatCurrency(bill.total_amount_due)} for this bill?
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">Bill ID: {bill.id}</p>
                    <p className="text-lg font-medium">Amount: {formatCurrency(bill.total_amount_due)}</p>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline">Cancel</Button>
                    <Button onClick={payBill} disabled={paying}>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      {paying ? 'Processing...' : 'Confirm Payment'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      )}

      {/* Paid Status */}
      {bill.status === 'paid' && (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center gap-2 text-green-700">
              <CheckCircle className="h-6 w-6" />
              <span className="text-lg font-medium">Bill Paid Successfully</span>
            </div>
            <p className="text-center text-green-600 mt-2">
              Thank you for your payment. This bill has been settled.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}