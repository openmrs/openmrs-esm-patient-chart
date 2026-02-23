import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import GrowthChart from './growth-chart/growth-chart.component';

const Root: React.FC = () => (
  <BrowserRouter basename={window.getOpenmrsSpaBase()}>
    <Routes>
      <Route path="patient-growth-chart-app" element={<GrowthChart patientUuid="dev-test-patient-uuid" />} />
    </Routes>
  </BrowserRouter>
);

export default Root;
