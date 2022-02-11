const concepts = {
  name: 'Bloodwork',
  class: 'ConvSet', // convienence set
  tests: [],
  sub_sets: [
    {
      name: 'Hematology',
      class: 'ConvSet',
      tests: [],
      sub_sets: [
        {
          name: 'Complete Blood Count',
          class: 'LabSet',
          tests: [
            {
              name: 'Hematocrit',
              class: 'Test',
              values: {},
              attributes: {},
            },
            {
              name: 'Platlets',
              class: 'Test',
              values: {},
              attributes: {},
            },
            {
              name: 'Mean corpuscular hemoglobin',
              class: 'Test',
              values: {},
              attributes: {},
            },
          ],
          sub_sets: [],
        },
      ],
    },
    {
      name: 'Chemistry',
      class: 'ConvSet',
      tests: [],
      sub_sets: [
        {
          name: 'Serum chemistry panel',
          class: 'LabSet',
          tests: [
            {
              name: 'Serum calcium',
              class: 'Test',
              values: {},
              attributes: {},
            },
            {
              name: 'Serum glutamic-pyruvic transaminase',
              class: 'Test',
              values: {},
              attributes: {},
            },
            {
              name: 'Serum albumin',
              class: 'Test',
              values: {},
              attributes: {},
            },
          ],
          sub_sets: [],
        },
      ],
    },
  ],
};

export default concepts;
