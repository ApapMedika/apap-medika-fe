'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { apiClient } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Pill, 
  Plus, 
  Search, 
  Eye, 
  Edit, 
  Trash2,
  Package,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface Medicine {
  id: string;
  name: string;
  price: number;
  stock: number;
  description: string;
  updated_at: string;
  updated_by: string;
}

export default function MedicinesPage() {
  const { user } = useAuth();
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchMedicines();
  }, []);

  const fetchMedicines = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getMedicines();
      setMedicines(response.results || response);
    } catch (error) {
      toast.error('Failed to fetch medicines');
      console.error('Error fetching medicines:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteMedicine = async (id: string) => {
    try {
      await apiClient.deleteMedicine(id);
      toast.success('Medicine deleted successfully');
      fetchMedicines();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete medicine');
    }
  };

  const filteredMedicines = medicines.filter(medicine => 
    medicine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    medicine.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
    }).format(amount);
  };

  const canAdd = user?.role === 'pharmacist';
  const canEdit = user?.role === 'pharmacist';
  const lowStockMedicines = medicines.filter(m => m.stock < 10);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Medicines</h1>
          <p className="text-gray-600">Manage medicine inventory and stock levels</p>
        </div>
        
        <div className="flex gap-2">
          {canAdd && (
            <>
              <Link href="/dashboard/medicines/restock">
                <Button variant="outline" className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Restock Medicines
                </Button>
              </Link>
              <Link href="/dashboard/medicines/create">
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add Medicine
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Low Stock Alert */}
      {lowStockMedicines.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-700">
              <AlertTriangle className="h-5 w-5" />
              Low Stock Alert
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-orange-700 mb-2">
              {lowStockMedicines.length} medicine(s) have low stock (less than 10 units):
            </p>
            <div className="flex flex-wrap gap-2">
              {lowStockMedicines.slice(0, 5).map((medicine) => (
                <span key={medicine.id} className="px-2 py-1 bg-orange-100 text-orange-800 text-sm rounded">
                  {medicine.name} ({medicine.stock} left)
                </span>
              ))}
              {lowStockMedicines.length > 5 && (
                <span className="px-2 py-1 bg-orange-100 text-orange-800 text-sm rounded">
                  +{lowStockMedicines.length - 5} more
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search medicines by name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Medicines Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            Medicine Inventory ({filteredMedicines.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredMedicines.length === 0 ? (
            <div className="text-center py-8">
              <Pill className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-500">No medicines found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-medium text-gray-900">ID</th>
                    <th className="text-left p-3 font-medium text-gray-900">Name</th>
                    <th className="text-left p-3 font-medium text-gray-900">Stock</th>
                    <th className="text-left p-3 font-medium text-gray-900">Price</th>
                    <th className="text-left p-3 font-medium text-gray-900">Last Updated</th>
                    <th className="text-left p-3 font-medium text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMedicines.map((medicine) => (
                    <tr key={medicine.id} className="border-b hover:bg-gray-50">
                      <td className="p-3 font-mono text-sm">{medicine.id}</td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-blue-600" />
                          <span className="font-medium">{medicine.name}</span>
                        </div>
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          medicine.stock < 10 
                            ? 'bg-red-100 text-red-800' 
                            : medicine.stock < 50 
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {medicine.stock} units
                        </span>
                      </td>
                      <td className="p-3 font-medium">
                        {formatCurrency(medicine.price)}
                      </td>
                      <td className="p-3 text-sm text-gray-500">
                        {new Date(medicine.updated_at).toLocaleDateString()}
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <Link href={`/dashboard/medicines/${medicine.id}`}>
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          
                          {canEdit && (
                            <>
                              <Link href={`/dashboard/medicines/${medicine.id}/edit`}>
                                <Button variant="outline" size="sm">
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </Link>
                              
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="outline" size="sm">
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Delete Medicine</DialogTitle>
                                  </DialogHeader>
                                  <p>Are you sure you want to delete {medicine.name}?</p>
                                  <div className="flex justify-end gap-2">
                                    <Button variant="outline">Cancel</Button>
                                    <Button 
                                      variant="destructive" 
                                      onClick={() => deleteMedicine(medicine.id)}
                                    >
                                      Delete
                                    </Button>
                                  </div>
                                </DialogContent>
                              </Dialog>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}