export const mockEncounterResponse = {
  uuid: "7e98713a-1572-4b44-92c1-c504bd6c5ce2",
  display: "Visit Note 28/01/2015",
  encounterDatetime: "2015-01-28T08:00:33.000+0000",
  patient: {
    uuid: "8673ee4f-e2ab-4077-ba55-4980f408773e",
    display: "100GEJ - John Wilson",
  },
  location: {
    uuid: "8d6c993e-c2cc-11de-8d13-0010c6dffd0f",
    display: "Unknown Location",
  },
  form: {
    uuid: "c75f120a-04ec-11e3-8780-2b40bef9a44b",
    display: "Visit Note",
  },
  encounterType: {
    uuid: "d7151f82-c1f3-4152-a605-2f9ea7414a79",
    display: "Visit Note",
  },
  obs: [
    {
      uuid: "4d06417e-61ad-41a5-a9fc-638a1ccd4b86",
      display:
        "Visit Diagnoses: Presumed diagnosis, Primary, Vitamin A Deficiency with Keratomalacia",
    },
    {
      uuid: "78765452-58a8-4f0a-91ff-831647a2e9dc",
      display:
        "Visit Diagnoses: Other disease of hard tissue of teeth, Secondary, Confirmed diagnosis",
    },
    {
      uuid: "06c212a3-61f5-401d-8afd-2917c662c0ea",
      display:
        "Text of encounter note: Duis aute irure dolor in reprehenderit in voluptat",
    },
  ],
  orders: [],
  voided: false,
  visit: {
    uuid: "a3e2a749-15e9-4c67-afa7-aab9a0bdd832",
    display: "Facility Visit @ Unknown Location - 28/01/2015 06:04",
  },
  encounterProviders: [],
  resourceVersion: "1.9",
};

export const mockFormattedNotes = [
  {
    id: "7e2a4abb-4caa-44ad-b3cf-39cd9c59afd8",
    encounterAuthor: "Dr. G. Testerson",
    encounterDate: "2020-02-19T08:26:05",
    encounterType: "Vitals",
    encounterLocation: "Isolation Ward"
  }
];

export const mockAlternativeEncounterResponse = {
  uuid: "3b9ab69d-4479-49f3-bf73-2bf23ada3edf",
  display: "Vitals 28/01/2015",
  encounterDatetime: "2015-01-28T06:06:33.000+0000",
  patient: {
    uuid: "8673ee4f-e2ab-4077-ba55-4980f408773e",
    display: "100GEJ - John Wilson",
  },
  location: {
    uuid: "b1a8b05e-3542-4037-bbd3-998ee9c40574",
    display: "Inpatient Ward",
  },
  form: {
    uuid: "a000cb34-9ec1-4344-a1c8-f692232f6edd",
    display: "Vitals",
  },
  encounterType: {
    uuid: "67a71486-1a54-468f-ac3e-7091a9a79584",
    display: "Vitals",
  },
  obs: [
    {
      uuid: "662b2614-4de0-48cb-a829-c2a5f743e4c6",
      display: "Weight (kg): 65.0",
    },
    {
      uuid: "5580d10c-82f6-4b3a-bd95-66d372007774",
      display: "Height (cm): 180.0",
    },
    {
      uuid: "92f19d94-155b-4aa0-be96-d39149b7bb30",
      display: "Systolic blood pressure: 120.0",
    },
    {
      uuid: "310e36b6-8bd2-4f11-9af5-def1c31a8264",
      display: "Pulse: 60.0",
    },
    {
      uuid: "ad4677b2-9d0d-44aa-825b-808973ecc071",
      display: "Blood oxygen saturation: 92.0",
    },
    {
      uuid: "30250613-5cf2-416b-a0fd-f24dcbbb7962",
      display: "Temperature (C): 37.0",
    },
    {
      uuid: "31b38aec-4765-4e97-bded-78e21b854973",
      display: "Diastolic blood pressure: 80.0",
    },
  ],
  orders: [],
  voided: false,
  visit: null,
  encounterProviders: [
    {
      uuid: "1ef282c4-c716-4aec-9c35-ba4c4e0441d5",
      display: "Super User: Clinician",
    },
  ],
  resourceVersion: "1.9",
};
