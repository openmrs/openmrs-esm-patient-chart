import React from 'react';
import { BrowserRouter, Routes, Route, useParams } from 'react-router-dom';
import GrowthChart from './growth-chart/growth-chart.component';

const GrowthChartWithParams: React.FC = () => {
  const { patientUuid } = useParams();
  return <GrowthChart patientUuid={patientUuid} />;
};

const Root: React.FC = () => (
  <BrowserRouter basename={window.getOpenmrsSpaBase()}>
    <Routes>
      <Route path="patient-growth-chart-app/:patientUuid?" element={<GrowthChartWithParams />} />
    </Routes>
  </BrowserRouter>
);

export default Root;
