import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

type Props = {
  title: string;
  description: string;
  icon: React.ReactNode;
  path: string;
  color: string;
  hoverBorder: string;
  hoverShadow: string;
  ctaText: string;
  ctaLabel: string;
};

export default function HomeTile({
  title,
  description,
  icon,
  path,
  color,
  hoverBorder,
  hoverShadow,
  ctaText,
  ctaLabel,
}: Props) {
  return (
    <Link
      to={path}
      className={`group block h-full bg-white rounded-[2.5rem] p-10 shadow-sm border border-stone-200 hover:shadow-2xl hover:scale-[1.02] transition-all duration-500 ${hoverBorder} ${hoverShadow}`}
    >
      <div className={`w-16 h-16 ${color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      <h3 className="text-2xl font-bold mb-3">{title}</h3>
      <p className="text-stone-500 text-sm leading-relaxed mb-6">
        {description}
      </p>
      <div className={`flex items-center gap-2 font-bold text-sm uppercase tracking-widest ${ctaText}`}>
        {ctaLabel}
        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </div>
    </Link>
  );
}
