import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, DollarSign, Wrench, Megaphone, CalendarDays, AlertTriangle, TrendingUp, Clock } from 'lucide-react';
import db from '@/lib/shared/kliv-database.js';
import DashboardCard from '@/components/DashboardCard';
import SkeletonCard from '@/components/SkeletonCard';
import StatusBadge from '@/components/StatusBadge';
import { type UserRole, canViewFinancials, getUserUnit } from '@/lib/roles';

interface Props {
  role: UserRole;
  user: any;
}

const Dashboard = ({ role, user }: Props) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>({});
  const [recentAnnouncements, setRecentAnnouncements] = useState<any[]>([]);
  const [recentRequests, setRecentRequests] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, [role]);

  const loadData = async () => {
    try {
      const [units, overdueDues, openReqs, announcements, requests, nextMeeting] = await Promise.all([
        db.query('units', { select: 'count' }),
        db.query('dues', { select: 'count', status: 'eq.overdue' }),
        db.query('maintenance_requests', { select: 'count', status: 'in.(new,in_progress)' }),
        db.query('announcements', { order: '_created_at.desc', limit: '3' }),
        db.query('maintenance_requests', { order: '_created_at.desc', limit: '5' }),
        db.query('meeting_minutes', { order: 'meeting_date.desc', limit: '1' }),
      ]);
      console.log('Dashboard data:', { units, overdueDues, openReqs });
      const unitCount = units?.[0]?.count ?? 0;
      const overdueCount = overdueDues?.[0]?.count ?? 0;
      const openRequestCount = openReqs?.[0]?.count ?? 0;

      setStats({
        unitCount: unitCount,
        overdueCount: overdueCount,
        openRequestCount: openRequestCount,
        nextMeeting: nextMeeting[0]?.meeting_date || 'TBD',
      });
      setRecentAnnouncements(announcements);
      setRecentRequests(requests);
    } catch (err) {
      console.log('Dashboard load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const unitNumber = getUserUnit(user);
  const greeting = `Welcome back, ${user?.firstName || 'there'}`;

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-6" style={{ animation: 'fade-in 0.4s ease-out' }}>
      <div>
        <h1 className="text-2xl font-bold text-foreground">{greeting}</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {role === 'board-member' && 'Board Member Dashboard — Riverside Commons'}
          {role === 'property-manager' && 'Property Manager Dashboard — Riverside Commons'}
          {role === 'resident' && `Unit ${unitNumber} — Riverside Commons`}
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : (
          <>
            <DashboardCard title="Total Units" value={stats.unitCount || 0} subtitle="Riverside Commons" icon={Building2} color="navy" />
            <DashboardCard title="Overdue Dues" value={stats.overdueCount || 0} subtitle="Require attention" icon={AlertTriangle} color={stats.overdueCount > 0 ? 'red' : 'emerald'} />
            <DashboardCard title="Open Requests" value={stats.openRequestCount || 0} subtitle="In progress" icon={Wrench} color="amber" />
            <DashboardCard title="Last Meeting" value={stats.nextMeeting !== 'TBD' ? new Date(stats.nextMeeting).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'TBD'} subtitle="Board meeting" icon={CalendarDays} color="navy" />
          </>
        )}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Announcements */}
        <div className="glass-strong rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-amber" />
              Recent Announcements
            </h2>
            <button onClick={() => navigate('/announcements')} className="text-xs font-medium text-amber hover:text-amber-dark transition-colors">
              View all
            </button>
          </div>
          {loading ? (
            <div className="space-y-3">
              {[1,2,3].map(i => (
                <div key={i} className="h-16 bg-muted rounded-lg skeleton-shimmer" />
              ))}
            </div>
          ) : recentAnnouncements.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">No announcements yet</p>
          ) : (
            <div className="space-y-3">
              {recentAnnouncements.map((a: any) => (
                <div key={a._row_id} className="p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer" onClick={() => navigate('/announcements')}>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium text-foreground">{a.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{a.body}</p>
                    </div>
                    {a.pinned === 1 && (
                      <span className="text-[10px] bg-amber/10 text-amber-dark dark:text-amber px-1.5 py-0.5 rounded font-medium shrink-0">Pinned</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Maintenance Requests */}
        <div className="glass-strong rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
              <Wrench className="w-4 h-4 text-amber" />
              Recent Requests
            </h2>
            <button onClick={() => navigate('/maintenance')} className="text-xs font-medium text-amber hover:text-amber-dark transition-colors">
              View all
            </button>
          </div>
          {loading ? (
            <div className="space-y-3">
              {[1,2,3].map(i => (
                <div key={i} className="h-16 bg-muted rounded-lg skeleton-shimmer" />
              ))}
            </div>
          ) : recentRequests.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">No maintenance requests</p>
          ) : (
            <div className="space-y-3">
              {recentRequests.map((r: any) => (
                <div key={r._row_id} className="p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer" onClick={() => navigate('/maintenance')}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{r.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Unit {r.unit_number} · {r.category}</p>
                    </div>
                    <StatusBadge status={r.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
