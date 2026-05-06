import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import PatientProceduresApp from './patient-procedures-app.component';

const Root: React.FC = () => (
  <BrowserRouter basename={window.getOpenmrsSpaBase()}>
    <Routes>
      <Route path="patient-procedures-app" element={<PatientProceduresApp />} />
    </Routes>
  </BrowserRouter>
);

export default Root;
