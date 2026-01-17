import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import PatientGrowthChartApp from './growth-chart/growth-chart-main.component';

const Root: React.FC = () => (
  <BrowserRouter basename={window.getOpenmrsSpaBase()}>
    <Routes>
      <Route path="patient-growth-chart-app" element={<PatientGrowthChartApp patientUuid="dev-test-patient-uuid" />} />
    </Routes>
  </BrowserRouter>
);

export default Root;
