import React from "react";
import { performPatientAllergySearch } from "./allergy-intolerance.resource";
import { render, cleanup, wait } from "@testing-library/react";
import { act } from "react-dom/test-utils";
import { BrowserRouter, match } from "react-router-dom";
import { AllergyOverviewLevelTwo } from "./allergy-card-level-two.component";
import { useCurrentPatient } from "../../../__mocks__/openmrs-esm-api.mock";

const mockPerformPatientAllergySearch = performPatientAllergySearch as jest.Mock;
const mockUseCurrentPatient = useCurrentPatient as jest.Mock;

jest.mock("./allergy-intolerance.resource", () => ({
  performPatientAllergySearch: jest.fn()
}));

jest.mock("@openmrs/esm-api", () => ({
  useCurrentPatient: jest.fn()
}));

const mockPatientAllergyResult = {
  data: {
    resourceType: "Bundle",
    id: "bbcb90f8-0e9e-4e61-885f-73eb49dce7b9",
    meta: {
      lastUpdated: "2019-11-12T07:36:39.592+00:00"
    },
    type: "searchset",
    total: 2,
    link: [
      {
        relation: "self",
        url:
          "http://localhost:8080/openmrs/ws/fhir/AllergyIntolerance?patient.identifier=10010W"
      }
    ],
    entry: [
      {
        fullUrl:
          "http://localhost:8080/openmrs/ws/fhir/AllergyIntolerance/0ff69971-f82a-4e3d-b59f-9e515cae7a6a",
        resource: {
          resourceType: "AllergyIntolerance",
          id: "0ff69971-f82a-4e3d-b59f-9e515cae7a6a",
          extension: [
            {
              url:
                "http://fhir-es.transcendinsights.com/stu3/StructureDefinition/resource-date-created",
              valueDateTime: "2019-11-11T17:38:11+00:00"
            },
            {
              url: "dateChanged",
              valueDateTime: "2019-11-11T17:39:50+00:00"
            }
          ],
          category: ["medication"],
          criticality: "low",
          code: {
            coding: [
              {
                system: "http://ciel.org",
                code: "162298"
              },
              {
                system: "http://snomed.info/sct",
                code: "41549009"
              },
              {
                system:
                  "http://www.nlm.nih.gov/research/umls/sourcereleasedocs/current/NDFRT/",
                code: "N0000000181"
              },
              {
                system:
                  "http://www.nlm.nih.gov/research/umls/sourcereleasedocs/current/NDFRT/",
                code: "N0000175562"
              },
              {
                system: "med-rt nui",
                code: "N0000175562"
              },
              {
                system: "http://openmrs.org",
                code: "162298AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
                display: "ACE inhibitors"
              }
            ],
            text: "ACE inhibitors"
          },
          patient: {
            id: "90f7f0b4-06a8-4a97-9678-e7a977f4b518",
            reference: "Patient/90f7f0b4-06a8-4a97-9678-e7a977f4b518",
            identifier: {
              id: "90f7f0b4-06a8-4a97-9678-e7a977f4b518"
            },
            display: "John Taylor(Identifier:10010W)"
          },
          note: [
            {
              text:
                "The patient is having a difficulty while using this medication"
            }
          ],
          reaction: [
            {
              manifestation: [
                {
                  coding: [
                    {
                      system: "http://www.semantichealth.org/pubdoc.html",
                      code: "10005487"
                    },
                    {
                      system: "http://www.pih.org/",
                      code: "998"
                    },
                    {
                      system: "http://ciel.org",
                      code: "148888"
                    },
                    {
                      system: "http://snomed.info/sct",
                      code: "39579001"
                    },
                    {
                      system: "https://www.e-imo.com/releases/problem-it",
                      code: "37966"
                    },
                    {
                      system: "http://hl7.org/fhir/sid/icd-10",
                      code: "T78.2"
                    },
                    {
                      system:
                        "http://www.who.int/classifications/icd/adaptations/icpc2/en/",
                      code: "A92"
                    },
                    {
                      system: "http://openmrs.org",
                      code: "148888AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
                      display: "Anaphylaxis"
                    }
                  ],
                  text: "Anaphylaxis"
                }
              ]
            }
          ]
        }
      },
      {
        fullUrl:
          "http://localhost:8080/openmrs/ws/fhir/AllergyIntolerance/981662c2-f861-4e60-ae22-45af8ce13069",
        resource: {
          resourceType: "AllergyIntolerance",
          id: "981662c2-f861-4e60-ae22-45af8ce13069",
          extension: [
            {
              url:
                "http://fhir-es.transcendinsights.com/stu3/StructureDefinition/resource-date-created",
              valueDateTime: "2019-11-11T18:41:27+00:00"
            },
            {
              url:
                "https://purl.org/elab/fhir/StructureDefinition/Creator-crew-version1",
              valueString: "doc"
            },
            {
              url: "dateChanged",
              valueDateTime: "2019-11-12T06:53:15+00:00"
            }
          ],
          category: ["medication"],
          criticality: "high",
          code: {
            coding: [
              {
                system: "http://snomed.info/sct",
                code: "96308008"
              },
              {
                system: "med-rt nui",
                code: "N0000175561"
              },
              {
                system: "http://ciel.org",
                code: "162299"
              },
              {
                system:
                  "http://www.nlm.nih.gov/research/umls/sourcereleasedocs/current/NDFRT/",
                code: "N0000175561"
              },
              {
                system: "http://openmrs.org",
                code: "162299AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
                display: "ARBs (angiotensin II receptor blockers)"
              }
            ],
            text: "ARBs (angiotensin II receptor blockers)"
          },
          patient: {
            id: "90f7f0b4-06a8-4a97-9678-e7a977f4b518",
            reference: "Patient/90f7f0b4-06a8-4a97-9678-e7a977f4b518",
            identifier: {
              id: "90f7f0b4-06a8-4a97-9678-e7a977f4b518"
            },
            display: "John Taylor(Identifier:10010W)"
          },
          note: [
            {
              text:
                "The patient had to be rushed to the emergency room after suffering from this reaction"
            }
          ],
          reaction: [
            {
              manifestation: [
                {
                  text: "Hepatotoxicity"
                },
                {
                  text: "Rash"
                }
              ]
            }
          ]
        }
      }
    ]
  }
};

const patient: fhir.Patient = {
  resourceType: "Patient",
  id: "8673ee4f-e2ab-4077-ba55-4980f408773e",
  extension: [
    {
      url:
        "http://fhir-es.transcendinsights.com/stu3/StructureDefinition/resource-date-created",
      valueDateTime: "2017-01-18T09:42:40+00:00"
    },
    {
      url:
        "https://purl.org/elab/fhir/StructureDefinition/Creator-crew-version1",
      valueString: "daemon"
    }
  ],
  identifier: [
    {
      id: "1f0ad7a1-430f-4397-b571-59ea654a52db",
      use: "usual",
      system: "OpenMRS ID",
      value: "10010W"
    }
  ],
  active: true,
  name: [
    {
      id: "efdb246f-4142-4c12-a27a-9be60b9592e9",
      use: "usual",
      family: "Wilson",
      given: ["John"]
    }
  ],
  gender: "male",
  birthDate: "1972-04-04",
  deceasedBoolean: false,
  address: [
    {
      id: "0c244eae-85c8-4cc9-b168-96b51f864e77",
      use: "home",
      line: ["Address10351"],
      city: "City0351",
      state: "State0351tested",
      postalCode: "60351",
      country: "Country0351"
    }
  ]
};

describe("AlleryCardLevelTwo />", () => {
  let match: match = { params: {}, isExact: false, path: "/", url: "/" };
  let wrapper: any;

  afterEach(cleanup);
  beforeEach(mockPerformPatientAllergySearch.mockReset);
  beforeEach(mockUseCurrentPatient.mockReset);

  it("render without dying", async () => {
    mockUseCurrentPatient.mockReturnValue([false, patient, patient.id, null]);
    mockPerformPatientAllergySearch.mockReturnValue(
      Promise.resolve(mockPatientAllergyResult)
    );
    wrapper = render(
      <BrowserRouter>
        <AllergyOverviewLevelTwo match={match} />
      </BrowserRouter>
    );

    await wait(() => {
      expect(wrapper).toBeDefined();
    });
  });

  it("should display the patients allergy correctly", async () => {
    mockUseCurrentPatient.mockReturnValue([false, patient, patient.id, null]);
    mockPerformPatientAllergySearch.mockReturnValue(
      Promise.resolve(mockPatientAllergyResult)
    );
    wrapper = render(
      <BrowserRouter>
        <AllergyOverviewLevelTwo match={match} />
      </BrowserRouter>
    );

    await wait(() => {
      expect(wrapper.getByText("ACE inhibitors").textContent).toBeTruthy();
      expect(wrapper.getByText("Anaphylaxis").textContent).toBeTruthy();
    });
  });

  it("should not display the patients allergy when no allergy is returned", async () => {
    mockUseCurrentPatient.mockReturnValue([false, patient, patient.id, null]);
    mockPerformPatientAllergySearch.mockReturnValue(
      Promise.resolve({ data: { total: 0 } })
    );
    wrapper = render(
      <BrowserRouter>
        <AllergyOverviewLevelTwo match={match} />
      </BrowserRouter>
    );

    await wait(() => {
      expect(
        wrapper.getByText("The patient's allergy history is not documented.")
          .textContent
      ).toBeDefined();
    });
  });
});
