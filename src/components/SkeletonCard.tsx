const SkeletonCard = () => {
  return (
    <div className="glass-strong rounded-xl p-5">
      <div className="flex items-start justify-between">
        <div className="flex-1 space-y-3">
          <div className="h-4 w-24 bg-muted rounded skeleton-shimmer" />
          <div className="h-8 w-16 bg-muted rounded skeleton-shimmer" />
          <div className="h-3 w-32 bg-muted rounded skeleton-shimmer" />
        </div>
        <div className="w-10 h-10 bg-muted rounded-lg skeleton-shimmer" />
      </div>
    </div>
  );
};

export default SkeletonCard;
