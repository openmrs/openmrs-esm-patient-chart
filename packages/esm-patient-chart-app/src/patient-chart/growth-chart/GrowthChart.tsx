// GSoC 2025 - Basic Growth Chart added with Recharts (weight vs age). Sets up future enhancements like percentiles and dynamic data.

import React from 'react';
import styles from './growth-chart.module.scss';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const data = [
  { age: '0', weight: 3.5 },
  { age: '1', weight: 5.0 },
  { age: '2', weight: 6.4 },
  { age: '3', weight: 7.2 },
  { age: '4', weight: 8.0 },
  { age: '5', weight: 8.5 },
  // ... aur data add kar sakta hai
];

const GrowthChart = () => {
  return (
    <div style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer>
        <LineChart data={data}>
          <CartesianGrid stroke="#ccc" />
          <XAxis dataKey="age" label={{ value: 'Age (months)', position: 'insideBottomRight', offset: -5 }} />
          <YAxis label={{ value: 'Weight (kg)', angle: -90, position: 'insideLeft' }} />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="weight" stroke="#8884d8" name="Patient Weight" />
          {/* Future mein WHO percentile curves bhi add karenge */}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default GrowthChart;
