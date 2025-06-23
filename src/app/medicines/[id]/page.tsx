'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { apiClient } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  ArrowLeft, 
  Package, 
  Edit, 
  Trash2,
  Plus,
  Calendar,
  User
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface MedicineDetail {
  id: string;
  name: string;
  price: number;
  stock: number;
  description: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string;
}

export default function MedicineDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [medicine, setMedicine] = useState<MedicineDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [stockAmount, setStockAmount] = useState<number>(1);
  const [addingStock, setAddingStock] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchMedicine();
    }
  }, [params.id]);

  const fetchMedicine = async () => {
    try {
      const response = await apiClient.getMedicineById(params.id as string);
      setMedicine(response);
    } catch (error) {
      toast.error('Failed to fetch medicine details');
      router.push('/dashboard/medicines');
    } finally {
      setLoading(false);
    }
  };

  const addStock = async () => {
    if (!medicine || stockAmount < 1) {
      toast.error('Please enter a valid stock amount');
      return;
    }

    setAddingStock(true);
    try {
      await apiClient.updateMedicineStock(medicine.id, stockAmount);
      toast.success('Stock added successfully');
      setStockAmount(1);
      fetchMedicine();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to add stock');
    } finally {
      setAddingStock(false);
    }
  };

  const deleteMedicine = async () => {
    if (!medicine) return;

    try {
      await apiClient.deleteMedicine(medicine.id);
      toast.success('Medicine deleted successfully');
      router.push('/dashboard/medicines');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete medicine');
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

  if (!medicine) {
    return (
      <div className="text-center">
        <p className="text-gray-500">Medicine not found</p>
        <Link href="/dashboard/medicines">
          <Button className="mt-4">Back to Medicines</Button>
        </Link>
      </div>
    );
  }

  const canEdit = user?.role === 'pharmacist';
  const canDelete = user?.role === 'pharmacist';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/medicines">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Medicine Details</h1>
            <p className="text-gray-600">ID: {medicine.id}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            medicine.stock < 10 
              ? 'bg-red-100 text-red-800' 
              : medicine.stock < 50 
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-green-100 text-green-800'
          }`}>
            {medicine.stock} units in stock
          </span>
        </div>
      </div>

      {/* Medicine Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Medicine Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm text-gray-500">Medicine Name</Label>
              <p className="font-medium text-lg">{medicine.name}</p>
            </div>
            <div>
              <Label className="text-sm text-gray-500">Price per Unit</Label>
              <p className="font-medium text-lg">{formatCurrency(medicine.price)}</p>
            </div>
            <div>
              <Label className="text-sm text-gray-500">Current Stock</Label>
              <p className="font-medium text-lg">{medicine.stock} units</p>
            </div>
            <div>
              <Label className="text-sm text-gray-500">Total Value</Label>
              <p className="font-medium text-lg">{formatCurrency(medicine.price * medicine.stock)}</p>
            </div>
          </div>

          {medicine.description && (
            <div>
              <Label className="text-sm text-gray-500">Description</Label>
              <p className="mt-1">{medicine.description}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      {canEdit && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Add Stock */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Add Stock</CardTitle>
              <CardDescription>
                Add units to current inventory
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="stockAmount">Quantity to Add</Label>
                <Input
                  id="stockAmount"
                  type="number"
                  min="1"
                  value={stockAmount}
                  onChange={(e) => setStockAmount(parseInt(e.target.value) || 1)}
                  placeholder="Enter quantity"
                />
              </div>
              <Button onClick={addStock} disabled={addingStock} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                {addingStock ? 'Adding...' : 'Add Stock'}
              </Button>
            </CardContent>
          </Card>

          {/* Edit Medicine */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Edit Medicine</CardTitle>
              <CardDescription>
                Update medicine information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href={`/dashboard/medicines/${medicine.id}/edit`}>
                <Button variant="outline" className="w-full">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Data
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Delete Medicine */}
          {canDelete && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Delete Medicine</CardTitle>
                <CardDescription>
                  Remove from inventory permanently
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="destructive" className="w-full">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Delete Medicine</DialogTitle>
                      <DialogDescription>
                        Are you sure you want to delete {medicine.name}? This action cannot be undone.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline">Cancel</Button>
                      <Button variant="destructive" onClick={deleteMedicine}>
                        Delete
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Metadata */}
      <Card>
        <CardHeader>
          <CardTitle>Metadata</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Created At</p>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                <p>{new Date(medicine.created_at).toLocaleString()}</p>
              </div>
            </div>
            <div>
              <p className="text-gray-500">Created By</p>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-gray-400" />
                <p>{medicine.created_by}</p>
              </div>
            </div>
            <div>
              <p className="text-gray-500">Last Updated</p>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                <p>{new Date(medicine.updated_at).toLocaleString()}</p>
              </div>
            </div>
            <div>
              <p className="text-gray-500">Updated By</p>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-gray-400" />
                <p>{medicine.updated_by}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}