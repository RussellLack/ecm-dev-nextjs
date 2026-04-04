"use client";

interface ProgressBarProps {
  current: number;
  total: number;
  sectionTitle?: string;
}

export default function ProgressBar({ current, total, sectionTitle }: ProgressBarProps) {
  const percent = total > 0 ? Math.round((current / total) * 100) : 0;

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-2">
        {sectionTitle && (
          <span className="text-white/60 font-barlow text-sm">{sectionTitle}</span>
        )}
        <span className="text-white/40 font-barlow text-sm ml-auto">
          {current} of {total}
        </span>
      </div>
      <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
        <div
          className="h-full bg-ecm-lime rounded-full transition-all duration-500 ease-out"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
