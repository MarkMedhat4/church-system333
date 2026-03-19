// ============================================================
// StudentPhoto — Avatar with fallback initials
// ============================================================

'use client';

import Image from 'next/image';
import { useState } from 'react';
import { getPhotoUrl } from '@/services/utils';
import { cn } from '@/services/utils';

interface StudentPhotoProps {
  photoUrl: string | null;
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const SIZE_CLASSES = {
  sm:  'w-8 h-8 text-xs',
  md:  'w-10 h-10 text-sm',
  lg:  'w-14 h-14 text-base',
  xl:  'w-24 h-24 text-2xl',
};

// Generate consistent color from name
function getAvatarColor(name: string): string {
  const colors = [
    'bg-blue-500', 'bg-indigo-500', 'bg-purple-500',
    'bg-pink-500',  'bg-rose-500',   'bg-orange-500',
    'bg-amber-500', 'bg-emerald-500','bg-teal-500',
    'bg-cyan-500',  'bg-sky-500',
  ];
  const index = name.charCodeAt(0) % colors.length;
  return colors[index];
}

export default function StudentPhoto({ photoUrl, name, size = 'md', className }: StudentPhotoProps) {
  const [imgError, setImgError] = useState(false);
  const initial = name?.charAt(0) || '؟';
  const sizeClass = SIZE_CLASSES[size];
  const bgColor = getAvatarColor(name || '');

  if (!photoUrl || imgError) {
    return (
      <div className={cn(
        sizeClass, bgColor,
        'rounded-full flex items-center justify-center flex-shrink-0',
        'font-bold text-white shadow-sm',
        className
      )}>
        {initial}
      </div>
    );
  }

  return (
    <div className={cn(sizeClass, 'rounded-full overflow-hidden flex-shrink-0 shadow-sm', className)}>
      <Image
        src={getPhotoUrl(photoUrl)}
        alt={name}
        width={size === 'xl' ? 96 : size === 'lg' ? 56 : size === 'md' ? 40 : 32}
        height={size === 'xl' ? 96 : size === 'lg' ? 56 : size === 'md' ? 40 : 32}
        className="object-cover w-full h-full"
        onError={() => setImgError(true)}
      />
    </div>
  );
}
