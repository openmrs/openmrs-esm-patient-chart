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
              values: {},
              attributes: {},
            },
            {
              display: 'Platlets',
              concept: 'Test',
              values: {},
              attributes: {},
            },
            {
              display: 'Mean corpuscular hemoglobin',
              concept: 'Test',
              values: {},
              attributes: {},
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
              display: 'Serum calcium',
              concept: 'Test',
              values: {},
              attributes: {},
            },
            {
              display: 'Serum glutamic-pyruvic transaminase',
              concept: 'Test',
              values: {},
              attributes: {},
            },
            {
              display: 'Serum albumin',
              concept: 'Test',
              values: {},
              attributes: {},
            },
          ],
          subSets: [],
        },
      ],
    },
  ],
};

export default concepts;
