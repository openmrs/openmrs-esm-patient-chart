const patientCurrentVisits = [
  {
    visitType: {
      uuid: "some-uuid1",
      name: "Outpatient Visit",
      display: "Outpatient Visit",
    },
    startDatetime: new Date(),
    location: {
      uuid: "b1a8b05e-3542-4037-bbd3-998ee9c40574",
      display: "Inpatient Ward",
      name: "Inpatient Ward",
    },
  },
];

const patientEndedVisits = [
  {
    visitType: {
      uuid: "some-uuid1",
      name: "Outpatient Visit",
      display: "Outpatient Visit",
    },
    startDatetime: new Date(),
    stopDatetime: new Date(),
    location: {
      uuid: "some-uuid1",
      name: "Mosoriot",
      display: "Mosoriot",
    },
  },
];

export const mockPatientCurrentVisitsResponse = {
  data: {
    results: patientCurrentVisits,
  },
};

export const mockPatientNoVisitsResponse = {
  data: {
    results: [],
  },
};

export const mockPatientEndedVisitsResponse = {
  data: {
    results: patientEndedVisits,
  },
};
