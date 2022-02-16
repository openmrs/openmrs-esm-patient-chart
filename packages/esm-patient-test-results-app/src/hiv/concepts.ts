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
            },
            {
              display: 'Platelets',
            },
            {
              display: 'Haemoglobin',
            },
            {
              display: 'White blood cells',
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
            },
            {
              display: 'Serum carbon dioxide',
            },
            {
              display: 'Blood urea nitrogen',
            },
          ],
          subSets: [],
        },
      ],
    },
  ],
};

export default concepts;
