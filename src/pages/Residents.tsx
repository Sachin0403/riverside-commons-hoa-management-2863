import { useState, useEffect } from 'react';
import { Users, Search } from 'lucide-react';
import db from '@/lib/shared/kliv-database.js';
import StatusBadge from '@/components/StatusBadge';
import EmptyState from '@/components/EmptyState';

const Residents = () => {
  const [units, setUnits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const data = await db.query('units', { order: 'unit_number.asc' });
        setUnits(data);
      } catch (err) {
        console.log('Load units error:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = search
    ? units.filter(u => u.unit_number.toLowerCase().includes(search.toLowerCase()) || u.owner_name.toLowerCase().includes(search.toLowerCase()))
    : units;

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-5xl mx-auto space-y-6" style={{ animation: 'fade-in 0.4s ease-out' }}>
      <div>
        <h1 className="text-2xl font-bold text-foreground">Resident Directory</h1>
        <p className="text-sm text-muted-foreground">{units.length} units at Riverside Commons</p>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by unit or name..." className="w-full pl-9 pr-3 py-2 rounded-lg border border-input bg-background text-sm" />
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[1,2,3,4,5,6].map(i => <div key={i} className="h-24 bg-muted rounded-xl skeleton-shimmer" />)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={Users} title="No units found" description="No units match your search." />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map(u => (
            <div key={u._row_id} className="glass-strong rounded-xl p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-2">
                <div className="w-9 h-9 rounded-lg bg-navy/10 dark:bg-navy-light/20 flex items-center justify-center text-xs font-bold text-navy dark:text-blue-300">
                  {u.unit_number}
                </div>
                <StatusBadge status={u.status || 'occupied'} />
              </div>
              <p className="text-sm font-medium text-foreground">{u.owner_name}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Floor {u.floor}{u.square_footage ? ` · ${u.square_footage} sq ft` : ''}
              </p>
              {u.move_in_date && (
                <p className="text-xs text-muted-foreground/60 mt-1">Since {u.move_in_date}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Residents;
