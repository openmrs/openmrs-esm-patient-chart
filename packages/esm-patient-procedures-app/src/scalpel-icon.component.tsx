import React from 'react';
import scalpelIcon from './scalpel.png';

interface ScalpelIconProps {
  size?: number;
  className?: string;
}

const ScalpelIcon: React.FC<ScalpelIconProps> = ({ size = 16, className = '' }) => {
  const iconSrc = typeof scalpelIcon === 'string' ? scalpelIcon : (scalpelIcon as any).default;
  return <img src={iconSrc} alt="Procedures" width={size} height={size} className={className} />;
};

export default ScalpelIcon;
