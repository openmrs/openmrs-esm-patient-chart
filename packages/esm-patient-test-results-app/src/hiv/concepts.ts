const concepts = {
  display: 'Bloodwork',
  concept: 'ConvSet', // convienence set
  obs: [],
  subSets: [
    {
      display: 'Hematology',
      concept: 'ConvSet',
      obs: [],
      subSets: [
        {
          display: 'Complete Blood Count',
          concept: 'LabSet',
          obs: [
            {
              display: 'Hematocrit',
              concept: 'Test',
            },
            {
              display: 'Platelets',
              concept: 'Test',
            },
            {
              display: 'Haemoglobin',
              concept: 'Test',
            },
            {
              display: 'White blood cells',
              concept: 'Test',
            },
          ],
          subSets: [],
        },
      ],
    },
    {
      display: 'Chemistry',
      concept: 'ConvSet',
      obs: [],
      subSets: [
        {
          display: 'Serum chemistry panel',
          concept: 'LabSet',
          obs: [
            {
              display: 'Serum chloride',
              concept: 'Test',
            },
            {
              display: 'Serum carbon dioxide',
              concept: 'Test',
            },
            {
              display: 'Blood urea nitrogen',
              concept: 'Test',
            },
          ],
          subSets: [],
        },
      ],
    },
  ],
};

export default concepts;
