import { useState, useEffect } from 'react';
import { ClipboardList, Users, MapPin } from 'lucide-react';
import db from '@/lib/shared/kliv-database.js';
import EmptyState from '@/components/EmptyState';

const MeetingMinutes = () => {
  const [minutes, setMinutes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await db.query('meeting_minutes', { order: 'meeting_date.desc' });
        setMinutes(data);
      } catch (err) {
        console.log('Load minutes error:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-4xl mx-auto space-y-6" style={{ animation: 'fade-in 0.4s ease-out' }}>
      <div>
        <h1 className="text-2xl font-bold text-foreground">Meeting Minutes</h1>
        <p className="text-sm text-muted-foreground">Board meeting records and summaries</p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="h-32 bg-muted rounded-xl skeleton-shimmer" />)}
        </div>
      ) : minutes.length === 0 ? (
        <EmptyState icon={ClipboardList} title="No meeting minutes" description="Board meeting records will appear here." />
      ) : (
        <div className="space-y-4">
          {minutes.map(m => (
            <div key={m._row_id} className="glass-strong rounded-xl p-5">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <h3 className="text-base font-semibold text-foreground">{m.title}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {new Date(m.meeting_date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground shrink-0">
                  {m.attendees_count && (
                    <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {m.attendees_count}</span>
                  )}
                  {m.location && (
                    <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {m.location}</span>
                  )}
                </div>
              </div>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{m.summary}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MeetingMinutes;
