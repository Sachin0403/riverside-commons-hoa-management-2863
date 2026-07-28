import { useState, useEffect } from 'react';
import { Wrench, Plus, Search, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import db from '@/lib/shared/kliv-database.js';
import { useToast } from '@/hooks/use-toast';
import { type UserRole, canManageMaintenance, getUserUnit } from '@/lib/roles';
import StatusBadge from '@/components/StatusBadge';
import EmptyState from '@/components/EmptyState';

interface Props {
  role: UserRole;
  user: any;
}

const categories = ['Plumbing', 'Electrical', 'HVAC', 'Elevator', 'Common Area', 'Parking', 'Landscaping', 'Security', 'Other'];
const statuses = ['new', 'in_progress', 'completed', 'closed'];
const priorities = ['low', 'medium', 'high', 'urgent'];

const Maintenance = ({ role, user }: Props) => {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const perPage = 10;
  const { toast } = useToast();
  const isManager = canManageMaintenance(role);
  const unitNumber = getUserUnit(user);

  // Form state
  const [formTitle, setFormTitle] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formCategory, setFormCategory] = useState('Plumbing');
  const [formPriority, setFormPriority] = useState('medium');
  const [formUnit, setFormUnit] = useState(unitNumber || '');
  const [saving, setSaving] = useState(false);

  // Detail/edit
  const [selected, setSelected] = useState<any>(null);
  const [editStatus, setEditStatus] = useState('');
  const [editNotes, setEditNotes] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const params: any = { order: '_created_at.desc', limit: String(perPage), offset: String((page - 1) * perPage) };
      if (statusFilter !== 'all') params.status = `eq.${statusFilter}`;
      if (search) params.title = `like.%${search}%`;
      const [data, count] = await Promise.all([
        db.query('maintenance_requests', params),
        db.count('maintenance_requests', statusFilter !== 'all' ? { status: `eq.${statusFilter}` } : {}),
      ]);
      setRequests(data);
      setTotal(count);
    } catch (err) {
      console.log('Load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [page, statusFilter]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;
    setSaving(true);
    try {
      await db.insert('maintenance_requests', {
        unit_number: formUnit || unitNumber || 'N/A',
        category: formCategory,
        title: formTitle.trim(),
        description: formDesc.trim(),
        priority: formPriority,
        status: 'new',
      });
      toast({ title: 'Request submitted', description: 'Your maintenance request has been created.' });
      setFormTitle(''); setFormDesc(''); setShowForm(false);
      setPage(1);
      load();
    } catch (err) {
      toast({ title: 'Error', description: 'Could not submit request.', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const updateRequest = async () => {
    if (!selected) return;
    try {
      await db.update('maintenance_requests', { _row_id: `eq.${selected._row_id}` }, {
        status: editStatus,
        resolution_notes: editNotes,
      });
      toast({ title: 'Updated', description: 'Request status updated.' });
      setSelected(null);
      load();
    } catch (err) {
      toast({ title: 'Error', description: 'Could not update.', variant: 'destructive' });
    }
  };

  const formatDate = (ts: number) => ts ? new Date(ts * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '';
  const totalPages = Math.ceil(total / perPage);

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-5xl mx-auto space-y-6" style={{ animation: 'fade-in 0.4s ease-out' }}>
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Maintenance Requests</h1>
          <p className="text-sm text-muted-foreground">{total} total requests</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-navy text-white text-sm font-medium hover:bg-navy-light transition-colors dark:bg-amber dark:text-navy-dark">
          <Plus className="w-4 h-4" /> New Request
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="glass-strong rounded-xl p-5 space-y-4">
          <div className="grid sm:grid-cols-3 gap-4">
            {isManager && (
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Unit</label>
                <input value={formUnit} onChange={e => setFormUnit(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm" placeholder="e.g. 4B" />
              </div>
            )}
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Category</label>
              <select value={formCategory} onChange={e => setFormCategory(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm">
                {categories.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Priority</label>
              <select value={formPriority} onChange={e => setFormPriority(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm">
                {priorities.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
              </select>
            </div>
          </div>
          <input value={formTitle} onChange={e => setFormTitle(e.target.value)} placeholder="Brief description of the issue" className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm" required />
          <textarea value={formDesc} onChange={e => setFormDesc(e.target.value)} placeholder="Detailed description..." rows={3} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm resize-none" />
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-muted-foreground">Cancel</button>
            <button type="submit" disabled={saving} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-navy text-white text-sm font-medium disabled:opacity-50 dark:bg-amber dark:text-navy-dark">
              {saving && <Loader2 className="w-4 h-4 animate-spin" />} Submit
            </button>
          </div>
        </form>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            onKeyDown={e => e.key === 'Enter' && load()}
            placeholder="Search requests..."
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-input bg-background text-sm"
          />
        </div>
        <div className="flex gap-1 flex-wrap">
          {['all', ...statuses].map(s => (
            <button
              key={s}
              onClick={() => { setStatusFilter(s); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${statusFilter === s ? 'bg-navy text-white dark:bg-amber dark:text-navy-dark' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
            >
              {s === 'all' ? 'All' : s.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}
            </button>
          ))}
        </div>
      </div>

      {/* Detail modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="glass-strong rounded-xl p-6 max-w-lg w-full space-y-4" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold">{selected.title}</h3>
            <p className="text-sm text-muted-foreground">Unit {selected.unit_number} · {selected.category}</p>
            <p className="text-sm">{selected.description || 'No description provided.'}</p>
            <div className="flex gap-2"><StatusBadge status={selected.status} /><StatusBadge status={selected.priority} /></div>
            {isManager && (
              <div className="space-y-3 pt-3 border-t border-border">
                <select value={editStatus} onChange={e => setEditStatus(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm">
                  {statuses.map(s => <option key={s} value={s}>{s.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}</option>)}
                </select>
                <textarea value={editNotes} onChange={e => setEditNotes(e.target.value)} placeholder="Resolution notes..." rows={2} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm resize-none" />
                <div className="flex justify-end gap-2">
                  <button onClick={() => setSelected(null)} className="px-4 py-2 text-sm text-muted-foreground">Close</button>
                  <button onClick={updateRequest} className="px-4 py-2 rounded-lg bg-navy text-white text-sm font-medium dark:bg-amber dark:text-navy-dark">Update</button>
                </div>
              </div>
            )}
            {!isManager && (
              <button onClick={() => setSelected(null)} className="px-4 py-2 text-sm text-muted-foreground">Close</button>
            )}
          </div>
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="space-y-2">
          {[1,2,3,4,5].map(i => <div key={i} className="h-16 bg-muted rounded-xl skeleton-shimmer" />)}
        </div>
      ) : requests.length === 0 ? (
        <EmptyState icon={Wrench} title="No requests found" description="No maintenance requests match your filters." action={{ label: 'New Request', onClick: () => setShowForm(true) }} />
      ) : (
        <>
          <div className="space-y-2">
            {requests.map(r => (
              <div
                key={r._row_id}
                onClick={() => { setSelected(r); setEditStatus(r.status); setEditNotes(r.resolution_notes || ''); }}
                className="glass-strong rounded-xl p-4 hover:shadow-md transition-all cursor-pointer flex items-center justify-between gap-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground truncate">{r.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Unit {r.unit_number} · {r.category} · {formatDate(r._created_at)}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <StatusBadge status={r.priority} />
                  <StatusBadge status={r.status} />
                </div>
              </div>
            ))}
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-2 rounded-lg hover:bg-muted disabled:opacity-30">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm text-muted-foreground">Page {page} of {totalPages}</span>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-2 rounded-lg hover:bg-muted disabled:opacity-30">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Maintenance;
