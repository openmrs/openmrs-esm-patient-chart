import React from 'react';
import style from './rx-icon.scss';

interface RxIconProps {
  isTablet: boolean;
}

function RxIcon({ isTablet }: RxIconProps) {
  const size = isTablet ? 40 : 24;
  return (
    <div className={style.background}>
      <svg width={size} height={size} viewBox="0 0 28 28" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M5.667 25.701V2.334h9.32c3.83-.038 6.304 2.152 6.509 6.033.066 1.262-.235 3.03-.665 3.887-.43.857-1.55 2.654-4.031 3.128l1.582 3.044 2.94-3.706H24l-4.58 5.73 2.753 5.251H18.98l-1.495-2.927-2.267 2.927H12.48l3.961-5.055-2.515-5.002h-5.47v10.057h-2.79zm2.796-12.447h6.911c.804-.053 3.133-.053 3.133-4.732 0-3.077-1.87-3.721-3.55-3.712H8.464v8.444z"
          fill="#0072C3"
          fillRule="nonzero"
        />
      </svg>
    </div>
  );
}

export default RxIcon;
