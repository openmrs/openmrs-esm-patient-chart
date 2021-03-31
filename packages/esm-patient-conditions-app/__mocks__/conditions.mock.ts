import { Condition } from "../src/conditions/conditions.resource";

export const mockPatientConditionsResult: Condition[] = [
  {
    clinicalStatus: "active",
    conceptId: "160148AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
    display: "Malaria, confirmed",
    onsetDateTime: "2019-11-04T00:00:00+00:00",
    recordedDate: "2019-11-04T04:49:28+00:00",
    id: "1e9160ee-8927-409c-b8f3-346c9736f8d7"
  },
  {
    clinicalStatus: "active",
    conceptId: "116128AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
    display: "Anaemia",
    onsetDateTime: "2019-02-28T00:00:00+00:00",
    recordedDate: "2019-02-28T11:15:22+00:00",
    id: "5be1a412-406a-43ed-a2de-d4995884baa1"
  },
  {
    clinicalStatus: "active",
    conceptId: "116128AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
    display: "Anosmia",
    onsetDateTime: "2020-10-01T00:00:00+00:00",
    recordedDate: "2020-10-25T09:36:55+00:00",
    id: "1a790e53-2ff5-4689-9ea7-d7da8cca367e"
  },
  {
    clinicalStatus: "active",
    conceptId: "160161AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
    display: "Generalized Skin Infection due to AIDS",
    onsetDateTime: "2020-06-30T00:00:00+00:00",
    recordedDate: "2020-06-19T06:41:25+00:00",
    id: "43578769-f1a4-46af-b08b-d9fe8a07066f"
  },
  {
    clinicalStatus: "inactive",
    conceptId: "512AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
    display: "Rash",
    onsetDateTime: "2019-06-19T00:00:00+00:00",
    recordedDate: "2019-06-19T06:40:22+00:00",
    id: "37d2ed09-a85f-44b3-9e4e-dd77b3f4dacd"
  },
  {
    clinicalStatus: "active",
    conceptId: "143264AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
    display: "Cough",
    onsetDateTime: "2020-01-19T00:00:00+00:00",
    recordedDate: "2020-01-19T06:43:01+00:00",
    id: "2a7c1279-407d-43f4-af87-5a59562ec2c9"
  }
];

export const mockPatientConditionResult: Condition =
  mockPatientConditionsResult[0];
