import { Form } from "../packages/esm-patient-forms-app/src/types";

export const mockForms: Array<Form> = [
  {
    encounterTypeName: "Vitals",
    encounterTypeUuid: "67a71486-1a54-468f-ac3e-7091a9a79584",
    name: "Biometrics",
    published: false,
    retired: false,
    uuid: "1dfe36b9-7a85-429a-b71d-008a6afca574",
  },
  {
    encounterTypeName: "Admission",
    encounterTypeUuid: "e22e39fd-7db2-45e7-80f1-60fa0d5a4378",
    name: "Admission (Simple)",
    published: false,
    retired: false,
    uuid: "d2c7532c-fb01-11e2-8ff2-fd54ab5fdb2a",
  },
  {
    encounterTypeName: "Vitals",
    encounterTypeUuid: "67a71486-1a54-468f-ac3e-7091a9a79584",
    name: "POC Vitals v1.0",
    published: true,
    retired: false,
    uuid: "c51b0cbe-32d8-4ea5-81d2-8f3ade30c2de",
  },
];

export const mockPatientEncounters = [
  {
    uuid: "5859f098-45d6-4c4e-9447-53dd4032d7d7",
    encounterDateTime: "2021-03-16T08:17:34.000Z",
    encounterTypeUuid: "67a71486-1a54-468f-ac3e-7091a9a79584",
    encounterTypeName: "Vitals",
    form: {
      uuid: "c51b0cbe-32d8-4ea5-81d2-8f3ade30c2de",
      name: "POC Vitals v1.0",
      published: true,
      retired: false,
      encounterTypeUuid: "67a71486-1a54-468f-ac3e-7091a9a79584",
      encounterTypeName: "Vitals",
      checked: true,
    },
  },
];
