export interface CentilePoint {
  age: number; // in months
  p3: number;
  p50: number;
  p97: number;
}

// WHO Weight-for-age reference values for Boys (0-60 months)
export const boysWeightReference: CentilePoint[] = [
  { age: 0, p3: 2.5, p50: 3.3, p97: 4.4 },
  { age: 3, p3: 5.0, p50: 6.4, p97: 8.0 },
  { age: 6, p3: 6.0, p50: 7.9, p97: 10.3 },
  { age: 9, p3: 7.2, p50: 8.9, p97: 11.0 },
  { age: 12, p3: 7.7, p50: 9.6, p97: 12.4 },
  { age: 18, p3: 8.8, p50: 10.9, p97: 14.1 },
  { age: 24, p3: 9.7, p50: 12.2, p97: 15.9 },
  { age: 30, p3: 10.5, p50: 13.3, p97: 16.9 },
  { age: 36, p3: 11.3, p50: 14.3, p97: 19.0 },
  { age: 42, p3: 12.0, p50: 15.3, p97: 19.7 },
  { age: 48, p3: 12.7, p50: 16.3, p97: 22.0 },
  { age: 54, p3: 13.4, p50: 17.3, p97: 22.7 },
  { age: 60, p3: 14.1, p50: 18.3, p97: 25.3 },
];

// WHO Weight-for-age reference values for Girls (0-60 months)
export const girlsWeightReference: CentilePoint[] = [
  { age: 0, p3: 2.4, p50: 3.2, p97: 4.2 },
  { age: 3, p3: 4.5, p50: 5.8, p97: 7.5 },
  { age: 6, p3: 5.8, p50: 7.3, p97: 9.2 },
  { age: 9, p3: 6.5, p50: 8.2, p97: 10.5 },
  { age: 12, p3: 6.9, p50: 8.9, p97: 11.5 },
  { age: 18, p3: 8.1, p50: 10.2, p97: 13.2 },
  { age: 24, p3: 9.0, p50: 11.5, p97: 14.8 },
  { age: 30, p3: 9.9, p50: 12.7, p97: 16.4 },
  { age: 36, p3: 10.8, p50: 13.9, p97: 18.1 },
  { age: 42, p3: 11.6, p50: 15.0, p97: 19.7 },
  { age: 48, p3: 12.3, p50: 16.0, p97: 21.4 },
  { age: 54, p3: 13.0, p50: 17.2, p97: 23.2 },
  { age: 60, p3: 13.7, p50: 18.2, p97: 24.9 },
];
