import { useState, useEffect } from 'react';
import { FileText, Download, FolderOpen } from 'lucide-react';
import db from '@/lib/shared/kliv-database.js';
import EmptyState from '@/components/EmptyState';

const categoryIcons: Record<string, string> = {
  'Governance': '📋',
  'Financial': '💰',
  'Policy': '📜',
  'Insurance': '🛡️',
  'Operations': '⚙️',
};

const Documents = () => {
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('all');

  useEffect(() => {
    const load = async () => {
      try {
        const data = await db.query('documents', { order: 'category.asc,name.asc' });
        setDocuments(data);
      } catch (err) {
        console.log('Load docs error:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const categories = ['all', ...new Set(documents.map(d => d.category))];
  const filtered = categoryFilter === 'all' ? documents : documents.filter(d => d.category === categoryFilter);

  const formatDate = (ts: number) => ts ? new Date(ts * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '';

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-4xl mx-auto space-y-6" style={{ animation: 'fade-in 0.4s ease-out' }}>
      <div>
        <h1 className="text-2xl font-bold text-foreground">Community Documents</h1>
        <p className="text-sm text-muted-foreground">Bylaws, policies, and important community files</p>
      </div>

      <div className="flex gap-1 flex-wrap">
        {categories.map(c => (
          <button
            key={c}
            onClick={() => setCategoryFilter(c)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${categoryFilter === c ? 'bg-navy text-white dark:bg-amber dark:text-navy-dark' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
          >
            {c === 'all' ? 'All' : c}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1,2,3].map(i => <div key={i} className="h-16 bg-muted rounded-xl skeleton-shimmer" />)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={FolderOpen} title="No documents" description="Community documents will be uploaded here." />
      ) : (
        <div className="space-y-2">
          {filtered.map(doc => (
            <div key={doc._row_id} className="glass-strong rounded-xl p-4 flex items-center gap-4 hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-lg shrink-0">
                {categoryIcons[doc.category] || '📄'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{doc.name}</p>
                <p className="text-xs text-muted-foreground">{doc.category}{doc.file_size ? ` · ${doc.file_size}` : ''} · Uploaded {formatDate(doc._created_at)}</p>
              </div>
              <button className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors shrink-0" title="Download">
                <Download className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Documents;
