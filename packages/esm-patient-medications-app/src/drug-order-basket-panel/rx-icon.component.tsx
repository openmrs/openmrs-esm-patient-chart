import React from 'react';

interface RxIconProps {
  isTablet: boolean;
}

function RxIcon({ isTablet }: RxIconProps) {
  const size = isTablet ? 40 : 24;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g clip-path="url(#clip0_11156_284438)">
        <path d="M24 0H0V24H24V0Z" fill="#BAE6FF" />
        <path
          d="M7 19.0208V5.00029H12.5924C14.8905 4.9776 16.3746 6.29147 16.4974 8.6203C16.5374 9.37725 16.3564 10.4385 16.0984 10.9525C15.8404 11.4665 15.1686 12.5446 13.6799 12.8291L14.6294 14.6554L16.3928 12.432H18L15.252 15.8701L16.9039 19.0208H14.9881L14.0908 17.2643L12.7308 19.0208H11.0881L13.4648 15.9874L11.9557 12.9865H8.67359V19.0208H7ZM8.67754 11.5522H12.8245C13.3068 11.5208 14.7039 11.5208 14.7039 8.71341C14.7039 6.86701 13.5819 6.48032 12.5746 6.48612H8.67754V11.5522Z"
          fill="#00539A"
        />
      </g>
      <defs>
        <clipPath id="clip0_11156_284438">
          <rect width={size} height={size} fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
}

export default RxIcon;
