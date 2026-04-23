'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState, useCallback } from 'react';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { useAdminToken, authHeaders } from '@/lib/use-admin-token';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import { businessConfig } from '@/config/business.config';
import type { Service } from '@/types';

interface ServiceFormState {
  name: string;
  description: string;
  duration: number;
  price: number;
  active: boolean;
  order: number;
}

const defaultForm: ServiceFormState = {
  name: '', description: '', duration: 30, price: 20, active: true, order: 0,
};

export default function AdminServicesPage() {
  const { getToken } = useAdminToken();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Service | null>(null);
  const [form, setForm] = useState<ServiceFormState>(defaultForm);
  const [saving, setSaving] = useState(false);
  const { currency } = businessConfig.booking;

  const fetchServices = useCallback(async () => {
    const res = await fetch('/api/services');
    if (res.ok) setServices(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { fetchServices(); }, [fetchServices]);

  function openCreate() {
    setEditing(null);
    setForm(defaultForm);
    setDialogOpen(true);
  }

  function openEdit(service: Service) {
    setEditing(service);
    setForm({
      name: service.name,
      description: service.description ?? '',
      duration: service.duration,
      price: service.price,
      active: service.active,
      order: service.order,
    });
    setDialogOpen(true);
  }

  async function saveService() {
    setSaving(true);
    try {
      const token = await getToken();
      const url = editing ? `/api/services/${editing.id}` : '/api/services';
      const method = editing ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { ...authHeaders(token), 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      toast.success(editing ? 'Service updated' : 'Service created');
      setDialogOpen(false);
      fetchServices();
    } catch {
      toast.error('Failed to save service');
    } finally {
      setSaving(false);
    }
  }

  async function deleteService(id: string) {
    if (!confirm('Delete this service?')) return;
    try {
      const token = await getToken();
      await fetch(`/api/services/${id}`, { method: 'DELETE', headers: authHeaders(token) });
      toast.success('Service deleted');
      fetchServices();
    } catch {
      toast.error('Failed to delete service');
    }
  }

  return (
    <div className="flex flex-col flex-1">
      <AdminHeader title="Services" />
      <div className="p-3 sm:p-6">
        <div className="flex justify-end mb-4 sm:mb-6">
          <Button onClick={openCreate} className="bg-[#6366f1] hover:bg-[#4f46e5] text-black gap-2">
            <Plus className="h-4 w-4" />
            Add Service
          </Button>
        </div>

        {loading ? (
          <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-16 bg-muted rounded-lg animate-pulse" />)}</div>
        ) : services.length === 0 ? (
          <p className="text-muted-foreground text-center py-16">No services yet. Add your first service.</p>
        ) : (
          <div className="space-y-3">
            {services.map((s) => (
              <div key={s.id} className="bg-card border border-border rounded-lg p-3 sm:p-4 flex items-start sm:items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm sm:text-base">{s.name}</span>
                    <Badge variant={s.active ? 'default' : 'secondary'} className="text-xs">
                      {s.active ? 'Active' : 'Hidden'}
                    </Badge>
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                    {s.duration} min · {currency}{s.price.toFixed(2)}
                    {s.description && ` · ${s.description}`}
                  </p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button variant="outline" size="sm" onClick={() => openEdit(s)}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => deleteService(s.id)} className="text-destructive hover:text-destructive">
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Service' : 'New Service'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <Label>Name *</Label>
              <Input value={form.name} onChange={(e) => setForm(f => ({...f, name: e.target.value}))} className="mt-1" />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea value={form.description} onChange={(e) => setForm(f => ({...f, description: e.target.value}))} rows={2} className="mt-1" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Duration (mins) *</Label>
                <Input type="number" value={form.duration} onChange={(e) => setForm(f => ({...f, duration: Number(e.target.value)}))} min={5} max={480} className="mt-1" />
              </div>
              <div>
                <Label>Price ({currency}) *</Label>
                <Input type="number" value={form.price} onChange={(e) => setForm(f => ({...f, price: Number(e.target.value)}))} min={0} step={0.5} className="mt-1" />
              </div>
            </div>
            <div>
              <Label>Display Order</Label>
              <Input type="number" value={form.order} onChange={(e) => setForm(f => ({...f, order: Number(e.target.value)}))} min={0} className="mt-1" />
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => setForm(f => ({...f, active: !f.active}))}>
                {form.active
                  ? <ToggleRight className="h-6 w-6 text-[#6366f1]" />
                  : <ToggleLeft className="h-6 w-6 text-muted-foreground" />}
              </button>
              <Label className="cursor-pointer" onClick={() => setForm(f => ({...f, active: !f.active}))}>
                {form.active ? 'Active (visible to customers)' : 'Hidden'}
              </Label>
            </div>
            <div className="flex gap-3 pt-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)} className="flex-1">Cancel</Button>
              <Button onClick={saveService} disabled={saving || !form.name} className="flex-1 bg-[#6366f1] hover:bg-[#4f46e5] text-black">
                {saving ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
