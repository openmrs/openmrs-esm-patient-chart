const patientSummaryExtensionOrder: {
  [x: string]: number;
} = {
  // 0th order is given to Offline tools
  Vitals: 1,
  Biometrics: 2,
  Conditions: 3,
  Medications: 4,
};

export const getPatientSummaryOrder: (x: string) => number = (extensionName) =>
  patientSummaryExtensionOrder[extensionName] ?? Math.max(...Object.values(patientSummaryExtensionOrder)) + 1;
