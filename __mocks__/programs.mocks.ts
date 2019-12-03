export const mockProgramsResponse = {
  headers: null,
  ok: true,
  redirected: true,
  status: 200,
  statusText: "ok",
  trailer: null,
  type: null,
  url: "",
  clone: null,
  body: null,
  bodyUsed: null,
  arrayBuffer: null,
  blob: null,
  formData: null,
  json: null,
  text: null,
  data: {
    results: [
      {
        uuid: "b033f8c3-7e0b-4118-aa1d-76c550f2978d",
        program: {
          uuid: "64f950e6-1b07-4ac0-8e7e-f3e148f3463f",
          name: "HIV Care and Treatment",
          allWorkflows: [],
          links: [
            {
              rel: "self",
              uri:
                "http://localhost:8090/openmrs/ws/rest/v1/program/64f950e6-1b07-4ac0-8e7e-f3e148f3463f"
            }
          ]
        },
        display: "HIV Care and Treatment",
        dateEnrolled: "2019-11-01T00:00:00.000+0000",
        dateCompleted: null,
        links: [
          {
            rel: "self",
            uri:
              "http://localhost:8090/openmrs/ws/rest/v1/programenrollment/b033f8c3-7e0b-4118-aa1d-76c550f2978d"
          },
          {
            rel: "full",
            uri:
              "http://localhost:8090/openmrs/ws/rest/v1/programenrollment/b033f8c3-7e0b-4118-aa1d-76c550f2978d?v=full"
          }
        ]
      }
    ]
  }
};
