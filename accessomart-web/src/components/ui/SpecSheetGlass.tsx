import React, { ReactNode } from 'react';

interface SpecSheetGlassProps {
  title: string;
  specs: { label: string; value: string; active?: boolean }[];
  className?: string;
}

export function SpecSheetGlass({ title, specs, className = '' }: SpecSheetGlassProps) {
  return (
    <div className={`
      relative overflow-hidden rounded-xl
      bg-[color-mix(in_srgb,var(--color-surface)_40%,transparent)] 
      backdrop-blur-[20px] 
      border border-surface-container-highest/20
      p-8 shadow-[0_40px_80px_rgba(255,255,255,0.08)]
      ${className}
    `}>
      <h3 className="font-display text-2xl text-on-surface mb-6 uppercase tracking-wide">{title}</h3>
      
      <div className="flex flex-col space-y-6">
        {specs.map((spec, idx) => (
          <div key={idx} className="relative pl-6">
            {/* Active Highlight Line */}
            {spec.active && (
              <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-primary rounded-full shadow-[0_0_8px_var(--color-primary)]" />
            )}
            
            <dt className="text-sm font-semibold tracking-wider text-tertiary uppercase mb-1">
              {spec.label}
            </dt>
            <dd className={`font-sans ${spec.active ? 'text-on-surface text-lg font-medium' : 'text-on-surface-variant'}`}>
              {spec.value}
            </dd>
          </div>
        ))}
      </div>
    </div>
  );
}
