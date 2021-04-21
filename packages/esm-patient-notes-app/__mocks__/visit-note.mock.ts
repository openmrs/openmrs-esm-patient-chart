export const currentSessionResponse = {
  data: {
    locale: "en_GB",
    currentProvider: {
      uuid: "b0f8686c-9de0-466e-abe6-d14e133b9337",
      display: "674737-1 - JJ Dick",
      person: {
        uuid: "4c357d29-f3e7-4b82-b808-aef52b46d8bd",
        display: "JJ Dick"
      },
      identifier: "674737-1"
    },
    sessionLocation: {
      uuid: "b1a8b05e-3542-4037-bbd3-998ee9c40574",
      display: "Inpatient Ward",
      name: "Inpatient Ward",
      parentLocation: {
        uuid: "aff27d58-a15c-49a6-9beb-d30dcfc0c66e",
        display: "Amani Hospital"
      }
    },
    user: {
      uuid: "bff0f63d-d192-46c7-9bbd-932affa29b80",
      display: "user-dev",
      username: "user-dev",
      systemId: "9-1",
      userProperties: {
        loginAttempts: "0",
        lockoutTimestamp: "",
        "emrapi.lastViewedPatientIds": "88,37,470,552"
      },
      person: {
        uuid: "4c357d29-f3e7-4b82-b808-aef52b46d8bd",
        display: "JJ Dick"
      }
    }
  }
};

export const providersResponse = {
  data: {
    results: [
      {
        person: {
          uuid: "4c357d29-f3e7-4b82-b808-aef52b46d8bd",
          display: "User 2"
        },
        uuid: "b0f8686c-9de0-466e-abe6-d14e133b9337"
      },
      {
        person: {
          uuid: "fbd7a058-88c4-4747-b572-32aaf8ef6ac9",
          display: "Admin 2"
        },
        uuid: "d70ba2a2-4900-404b-bde3-7ce9e2de3cd6"
      },
      {
        person: {
          uuid: "5699bd1d-6619-4238-abc7-bed4ac005c8a",
          display: "Tetema Tetema"
        },
        uuid: "5106e0ac-80a5-4d96-951b-cf881e3f06f3"
      },
      {
        person: {
          uuid: "945957d8-4b1e-4145-99cc-f1de95d33253",
          display: "User One"
        },
        uuid: "28f22c92-fa65-4310-b9dd-85b1c7180e24"
      }
    ]
  }
};

export const locationsResponse = {
  data: {
    results: [
      {
        uuid: "aff27d58-a15c-49a6-9beb-d30dcfc0c66e",
        display: "Amani Hospital"
      },
      {
        uuid: "b1a8b05e-3542-4037-bbd3-998ee9c40574",
        display: "Inpatient Ward"
      },
      {
        uuid: "2131aff8-2e2a-480a-b7ab-4ac53250262b",
        display: "Isolation Ward"
      },
      { uuid: "7fdfa2cb-bc95-405a-88c6-32b7673c0453", display: "Laboratory" },
      {
        uuid: "f76c0c8e-2c3a-443c-b26d-96a9f3847764",
        display: "Mosoriot Pharmacy"
      }
    ]
  }
};

export const mockFetchLocationByUuidResponse = {
  data: {
    uuid: "b1a8b05e-3542-4037-bbd3-998ee9c40574",
    display: "Inpatient Ward"
  }
};

export const mockFetchProviderByUuidResponse = {
  data: {
    person: {
      uuid: "4c357d29-f3e7-4b82-b808-aef52b46d8bd",
      display: "User 2"
    },
    uuid: "b0f8686c-9de0-466e-abe6-d14e133b9337"
  }
};

export const diagnosisSearchResponse = {
  results: [
    {
      word: null,
      conceptName: {
        id: 19739,
        uuid: "19739BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB",
        conceptNameType: "FULLY_SPECIFIED",
        name: "Diabetes Mellitus"
      },
      concept: {
        id: 119481,
        uuid: "119481AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
        conceptMappings: [
          {
            conceptMapType: "SAME-AS",
            conceptReferenceTerm: {
              code: "73211009",
              name: null,
              conceptSource: {
                name: "SNOMED CT"
              }
            }
          }
        ],
        preferredName: "Diabetes Mellitus"
      }
    },
    {
      word: null,
      conceptName: {
        id: 42200,
        uuid: "42200BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB",
        conceptNameType: "FULLY_SPECIFIED",
        name: "Diabetes Mellitus, Type II"
      },
      concept: {
        id: 142473,
        uuid: "142473AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
        conceptMappings: [
          {
            conceptMapType: "SAME-AS",
            conceptReferenceTerm: {
              code: "6692",
              name: null,
              conceptSource: {
                name: "PIH"
              }
            }
          }
        ],
        preferredName: "Diabetes Mellitus, Type II"
      }
    }
  ]
};
