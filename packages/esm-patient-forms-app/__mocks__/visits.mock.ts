import {
  visitItem,
  visitMode,
  visitStatus
} from "../src/widgets/visit/visit-utils";

export const mockVisitTypes = [
  {
    uuid: "some-uuid1",
    name: "Outpatient Visit",
    display: "Outpatient Visit"
  },
  {
    uuid: "some-uuid2",
    name: "HIV Return Visit",
    display: "HIV Return Visit"
  }
];

export const mockVisitTypesDataResponse = {
  data: {
    results: mockVisitTypes
  }
};

export const mockVisits = {
  data: {
    results: [
      {
        uuid: "15dd49ba-4283-472f-bce3-05401f85c0d3",
        patient: {
          uuid: "5a4e7a05-e275-4c14-acab-cb86f3e16353",
          display: "102EWH - Test Patient Registration"
        },
        visitType: {
          uuid: "7b0f5697-27e3-40c4-8bae-f4049abfb4ed",
          display: "Facility Visit"
        },
        location: {
          uuid: "7fdfa2cb-bc95-405a-88c6-32b7673c0453",
          display: "Laboratory"
        },
        startDatetime: "2020-07-28T10:29:00.000+0000",
        stopDatetime: "2020-07-29T10:29:00.000+0000",
        encounters: []
      }
    ]
  }
};

export const mockCurrentVisit: visitItem = {
  mode: visitMode.LOADING,
  visitData: {
    uuid: "17f512b4-d264-4113-a6fe-160cb38cb46e",
    encounters: [],
    patient: { uuid: "8673ee4f-e2ab-4077-ba55-4980f408773e" },
    visitType: {
      uuid: "7b0f5697-27e3-40c4-8bae-f4049abfb4ed",
      name: "Facility Visit",
      display: "Facility Visit"
    },
    attributes: [],
    location: {
      uuid: "6351fcf4-e311-4a19-90f9-35667d99a8af",
      name: "Registration Desk",
      display: "Registration Desk"
    },
    startDatetime: new Date("2021-03-16T08:16:00.000+0000"),
    stopDatetime: null
  },
  status: visitStatus.ONGOING
};
