import { useState, useEffect } from 'react';
import { DollarSign, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import db from '@/lib/shared/kliv-database.js';
import StatusBadge from '@/components/StatusBadge';
import EmptyState from '@/components/EmptyState';
import { type UserRole, getUserUnit } from '@/lib/roles';

interface Props {
  role: UserRole;
  user: any;
  myDuesOnly?: boolean;
}

const Dues = ({ role, user, myDuesOnly }: Props) => {
  const [dues, setDues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const perPage = 15;
  const unitNumber = getUserUnit(user);

  const load = async () => {
    setLoading(true);
    try {
      const params: any = { order: 'due_date.desc', limit: String(perPage), offset: String((page - 1) * perPage) };
      if (statusFilter !== 'all') params.status = `eq.${statusFilter}`;
      if (myDuesOnly && unitNumber) params.unit_number = `eq.${unitNumber}`;

      const countParams: any = {};
      if (statusFilter !== 'all') countParams.status = `eq.${statusFilter}`;
      if (myDuesOnly && unitNumber) countParams.unit_number = `eq.${unitNumber}`;

      const [data, count] = await Promise.all([
        db.query('dues', params),
        db.count('dues', countParams),
      ]);
      setDues(data);
      setTotal(count);
    } catch (err) {
      console.log('Load dues error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [page, statusFilter]);
  const totalPages = Math.ceil(total / perPage);

  const formatCurrency = (amount: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-5xl mx-auto space-y-6" style={{ animation: 'fade-in 0.4s ease-out' }}>
      <div>
        <h1 className="text-2xl font-bold text-foreground">{myDuesOnly ? 'My Dues' : 'Dues & Payments'}</h1>
        <p className="text-sm text-muted-foreground">{myDuesOnly ? `Payment history for Unit ${unitNumber}` : 'All unit assessments and payment status'}</p>
      </div>

      <div className="flex gap-1 flex-wrap">
        {['all', 'paid', 'pending', 'overdue'].map(s => (
          <button
            key={s}
            onClick={() => { setStatusFilter(s); setPage(1); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${statusFilter === s ? 'bg-navy text-white dark:bg-amber dark:text-navy-dark' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1,2,3,4,5].map(i => <div key={i} className="h-14 bg-muted rounded-xl skeleton-shimmer" />)}
        </div>
      ) : dues.length === 0 ? (
        <EmptyState icon={DollarSign} title="No dues records" description="No payment records match your filters." />
      ) : (
        <>
          {/* Table for larger screens */}
          <div className="hidden md:block glass-strong rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Unit</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Period</th>
                  <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">Amount</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Due Date</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Paid Date</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {dues.map(d => (
                  <tr key={d._row_id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-3 text-sm font-medium">{d.unit_number}</td>
                    <td className="px-5 py-3 text-sm text-muted-foreground">{d.period}</td>
                    <td className="px-5 py-3 text-sm text-right font-medium">{formatCurrency(d.amount)}</td>
                    <td className="px-5 py-3 text-sm text-muted-foreground">{d.due_date}</td>
                    <td className="px-5 py-3 text-sm text-muted-foreground">{d.paid_date || '—'}</td>
                    <td className="px-5 py-3"><StatusBadge status={d.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Cards for mobile */}
          <div className="md:hidden space-y-2">
            {dues.map(d => (
              <div key={d._row_id} className="glass-strong rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Unit {d.unit_number}</span>
                  <StatusBadge status={d.status} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{d.period} · Due {d.due_date}</span>
                  <span className="text-sm font-semibold">{formatCurrency(d.amount)}</span>
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

export default Dues;
