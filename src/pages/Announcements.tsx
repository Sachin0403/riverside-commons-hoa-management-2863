import { useState, useEffect } from 'react';
import { Megaphone, Plus, Pin, Trash2, Loader2 } from 'lucide-react';
import db from '@/lib/shared/kliv-database.js';
import { useToast } from '@/hooks/use-toast';
import { type UserRole, canManageAnnouncements } from '@/lib/roles';
import EmptyState from '@/components/EmptyState';

interface Props {
  role: UserRole;
  user: any;
}

const Announcements = ({ role, user }: Props) => {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [pinned, setPinned] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const canManage = canManageAnnouncements(role);

  const load = async () => {
    try {
      const data = await db.query('announcements', { order: 'pinned.desc,_created_at.desc', limit: '50' });
      setAnnouncements(data);
    } catch (err) {
      console.log('Load announcements error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;
    setSaving(true);
    try {
      await db.insert('announcements', {
        title: title.trim(),
        body: body.trim(),
        author: `${user?.firstName} ${user?.lastName}`,
        pinned: pinned ? 1 : 0,
      });
      toast({ title: 'Announcement posted', description: 'Residents will see this immediately.' });
      setTitle(''); setBody(''); setPinned(false); setShowForm(false);
      load();
    } catch (err) {
      console.log('Post error:', err);
      toast({ title: 'Error', description: 'Could not post announcement.', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this announcement? This cannot be undone.')) return;
    try {
      await db.delete('announcements', { _row_id: `eq.${id}` });
      toast({ title: 'Deleted', description: 'Announcement removed.' });
      load();
    } catch (err) {
      toast({ title: 'Error', description: 'Could not delete.', variant: 'destructive' });
    }
  };

  const formatDate = (ts: number) => {
    if (!ts) return '';
    return new Date(ts * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-4xl mx-auto space-y-6" style={{ animation: 'fade-in 0.4s ease-out' }}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Announcements</h1>
          <p className="text-sm text-muted-foreground">Community updates and news</p>
        </div>
        {canManage && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-navy text-white text-sm font-medium hover:bg-navy-light transition-colors dark:bg-amber dark:text-navy-dark"
          >
            <Plus className="w-4 h-4" /> New
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="glass-strong rounded-xl p-5 space-y-4">
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Announcement title"
            className="w-full px-3.5 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring/20"
            required
          />
          <textarea
            value={body}
            onChange={e => setBody(e.target.value)}
            placeholder="Write your announcement..."
            rows={4}
            className="w-full px-3.5 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring/20 resize-none"
            required
          />
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
              <input type="checkbox" checked={pinned} onChange={e => setPinned(e.target.checked)} className="rounded" />
              <Pin className="w-3.5 h-3.5" /> Pin to top
            </label>
            <div className="flex gap-2">
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground">Cancel</button>
              <button type="submit" disabled={saving} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-navy text-white text-sm font-medium hover:bg-navy-light disabled:opacity-50 dark:bg-amber dark:text-navy-dark">
                {saving && <Loader2 className="w-4 h-4 animate-spin" />} Post
              </button>
            </div>
          </div>
        </form>
      )}

      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="h-24 bg-muted rounded-xl skeleton-shimmer" />)}
        </div>
      ) : announcements.length === 0 ? (
        <EmptyState
          icon={Megaphone}
          title="No announcements yet"
          description="Community announcements will appear here."
          action={canManage ? { label: 'Post Announcement', onClick: () => setShowForm(true) } : undefined}
        />
      ) : (
        <div className="space-y-3">
          {announcements.map(a => (
            <div key={a._row_id} className="glass-strong rounded-xl p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {a.pinned === 1 && <Pin className="w-3.5 h-3.5 text-amber" />}
                    <h3 className="text-base font-semibold text-foreground">{a.title}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{a.body}</p>
                  <p className="text-xs text-muted-foreground/60 mt-3">
                    {a.author && `By ${a.author} · `}{formatDate(a._created_at)}
                  </p>
                </div>
                {canManage && (
                  <button onClick={() => handleDelete(a._row_id)} className="text-muted-foreground/40 hover:text-red-500 transition-colors shrink-0">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Announcements;
