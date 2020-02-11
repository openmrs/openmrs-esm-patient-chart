export const mockDrugSearchResults = {
  data: {
    results: [
      {
        uuid: "18f43c99-2329-426e-97b5-c3356e6afe54",
        name: "aspirin",
        strength: "81mg",
        dosageForm: {
          display: "Tablet",
          uuid: "1513AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"
        },
        concept: {
          uuid: "1074AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"
        }
      }
    ]
  }
};
export const mockDurationUnitsResults = {
  data: {
    answers: [
      { uuid: "1074AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA", display: "Months" },
      { uuid: "1073AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA", display: "Weeks" },
      { uuid: "1072AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA", display: "Days" },
      { uuid: "1734AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA", display: "Years" },
      { uuid: "1733AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA", display: "Minutes" },
      { uuid: "1822AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA", display: "Hours" },
      {
        uuid: "162582AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
        display: "Number of occurrences"
      },
      { uuid: "162583AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA", display: "Seconds" }
    ]
  }
};

export const mockPatientEncounterIDResults = {
  data: {
    results: [{ uuid: "0926163e-8a28-43c2-a2cf-9851dc72f39d" }]
  }
};
