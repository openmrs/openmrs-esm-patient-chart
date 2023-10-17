import React from 'react';
import style from './lab-icon.scss';

interface LabIconProps {
  isTablet: boolean;
}

export default function LabIcon({ isTablet }: LabIconProps) {
  const size = isTablet ? 40 : 24;
  return (
    <div className={style.background}>
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M17.616 15.81 14 10.836V6h1V5H9v1h1v4.837L6.384 15.81A2.01 2.01 0 0 0 8.01 19h7.982a2.01 2.01 0 0 0 1.625-3.19zM11 11.162V6h2v5.163L14.336 13H9.664L11 11.163zM15.99 18H8.01a1.01 1.01 0 0 1-.817-1.603L8.936 14h6.128l1.743 2.397A1.01 1.01 0 0 1 15.991 18z"
          fill="#6929C4"
        />
      </svg>
    </div>
  );
}
