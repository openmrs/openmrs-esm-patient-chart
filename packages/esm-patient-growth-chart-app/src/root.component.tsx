import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import PatientGrowthChartApp from './patient-growth-chart-app.component';

const Root: React.FC = () => (
  <BrowserRouter basename={window.getOpenmrsSpaBase()}>
    <Routes>
      <Route path="patient-growth-chart-app" element={<PatientGrowthChartApp />} />
    </Routes>
  </BrowserRouter>
);

export default Root;
