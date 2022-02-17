const mockConceptTree = {
  display: 'Bloodwork',
  subSets: [
    {
      display: 'Hematology',
      subSets: [
        {
          display: 'Complete Blood Count',
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
        },
      ],
    },
    {
      display: 'Chemistry',
      subSets: [
        {
          display: 'Serum chemistry panel',
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
        },
      ],
    },
  ],
};

export default mockConceptTree;
