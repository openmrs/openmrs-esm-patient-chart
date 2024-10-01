import React from 'react';

export const summaryDashboardMeta = {
  slot: 'patient-chart-summary-dashboard-slot',
  path: 'Patient Summary',
  title: 'Patient Summary',
  icon: React.createElement(
    'svg',
    {
      width: '16',
      height: '16',
      viewBox: '0 0 16 16',
      fill: 'none',
      xmlns: 'http://www.w3.org/2000/svg',
    },
    React.createElement('path', { d: 'M9 9H5V10H9V9Z', fill: '#161616' }),
    React.createElement('path', { d: 'M11 6.5H5V7.5H11V6.5Z', fill: '#161616' }),
    React.createElement('path', { d: 'M7.5 11.5H5V12.5H7.5V11.5Z', fill: '#161616' }),
    React.createElement('path', {
      d: 'M12.5 2.5H11V2C11 1.73478 10.8946 1.48043 10.7071 1.29289C10.5196 1.10536 10.2652 1 10 1H6C5.73478 1 5.48043 1.10536 5.29289 1.29289C5.10536 1.48043 5 1.73478 5 2V2.5H3.5C3.23478 2.5 2.98043 2.60536 2.79289 2.79289C2.60536 2.98043 2.5 3.23478 2.5 3.5V14C2.5 14.2652 2.60536 14.5196 2.79289 14.7071C2.98043 14.8946 3.23478 15 3.5 15H12.5C12.7652 15 13.0196 14.8946 13.2071 14.7071C13.3946 14.5196 13.5 14.2652 13.5 14V3.5C13.5 3.23478 13.3946 2.98043 13.2071 2.79289C13.0196 2.60536 12.7652 2.5 12.5 2.5ZM6 2H10V4H6V2ZM12.5 14H3.5V3.5H5V5H11V3.5H12.5V14Z',
      fill: '#161616',
    }),
  ),
};

export const encountersDashboardMeta = {
  slot: 'patient-chart-encounters-dashboard-slot',
  path: 'Visits',
  title: 'Visits',
};
