export const mockAppointmentsResponse = {
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
  data: [
    {
      uuid: "68ab2e6e-7af7-4b2c-bd6f-7e2ecf30faee",
      appointmentNumber: "0000",
      patient: {
        identifier: "100HWJ",
        name: "Wafula John Rock",
        uuid: "64cb4894-848a-4027-8174-05c52989c0ca"
      },
      service: {
        appointmentServiceId: 1,
        name: "Outpatient",
        description: null,
        speciality: {},
        startTime: "",
        endTime: "",
        maxAppointmentsLimit: null,
        durationMins: null,
        location: {},
        uuid: "243cc533-8be3-4ad6-aefd-024d67058234",
        color: "#006400",
        initialAppointmentStatus: "Requested",
        creatorName: null
      },
      serviceType: {
        duration: 15,
        name: "Triage",
        uuid: "5e508452-288f-4f53-9517-d95d667e9955"
      },
      provider: null,
      location: null,
      startDateTime: 1583656246000,
      endDateTime: 1583657100000,
      appointmentKind: "WalkIn",
      status: "Scheduled",
      comments: "N/A",
      additionalInfo: null,
      providers: [],
      recurring: false
    },
    {
      uuid: "76579b10-d661-4218-a309-2f7d89cfbf23",
      appointmentNumber: "0000",
      patient: {
        identifier: "100HWJ",
        name: "Wafula John Rock",
        uuid: "64cb4894-848a-4027-8174-05c52989c0ca"
      },
      service: {
        appointmentServiceId: 1,
        name: "Inpatient",
        description: null,
        speciality: {},
        startTime: "",
        endTime: "",
        maxAppointmentsLimit: null,
        durationMins: null,
        location: {},
        uuid: "243cc533-8be3-4ad6-aefd-024d67058234",
        color: "#006400",
        initialAppointmentStatus: "Requested",
        creatorName: null
      },
      serviceType: {
        duration: 10,
        name: "Consultation",
        uuid: "12f73c3e-38d0-4abe-8b72-72349172229f"
      },
      provider: null,
      location: null,
      startDateTime: 1584270000000,
      endDateTime: 1584270600000,
      appointmentKind: "WalkIn",
      status: "Unscheduled",
      comments:
        "This patient is due for future consultation on the progress of fracture on the left am. Ultra sound is scheduled to take place and enhancement of the born structure.",
      additionalInfo: null,
      providers: [],
      recurring: false
    }
  ]
};

export const mockAppointmentResponse = {
  data: {
    uuid: "68ab2e6e-7af7-4b2c-bd6f-7e2ecf30faee",
    appointmentNumber: "0000",
    patient: {
      identifier: "100HWJ",
      name: "Wafula John Rock",
      uuid: "64cb4894-848a-4027-8174-05c52989c0ca"
    },
    service: {
      appointmentServiceId: 1,
      name: "Outpatient",
      description: null,
      speciality: {},
      startTime: "",
      endTime: "",
      maxAppointmentsLimit: null,
      durationMins: null,
      location: {},
      uuid: "243cc533-8be3-4ad6-aefd-024d67058234",
      color: "#006400",
      initialAppointmentStatus: "Requested",
      creatorName: null
    },
    serviceType: {
      duration: 15,
      name: "Triage",
      uuid: "5e508452-288f-4f53-9517-d95d667e9955"
    },
    provider: null,
    location: null,
    startDateTime: 1584948900000,
    endDateTime: 1584949800000,
    appointmentKind: "WalkIn",
    status: "Scheduled",
    comments: "N/A",
    additionalInfo: null,
    providers: [],
    recurring: false
  }
};

export const mockAppointmentsServiceFullResponse = {
  data: [
    {
      appointmentServiceId: 1,
      name: "Outpatient",
      description: null,
      speciality: {},
      startTime: "",
      endTime: "",
      maxAppointmentsLimit: null,
      durationMins: null,
      location: {},
      uuid: "e2ec9cf0-ec38-4d2b-af6c-59c82fa30b90",
      color: "#006400",
      initialAppointmentStatus: "Scheduled",
      creatorName: null,
      weeklyAvailability: [
        {
          dayOfWeek: "MONDAY",
          startTime: "07:00:00",
          endTime: "20:00:00",
          maxAppointmentsLimit: null,
          uuid: "7c7c53c8-c104-40cc-9926-50fc6fe4c4c1"
        },
        {
          dayOfWeek: "TUESDAY",
          startTime: "07:00:00",
          endTime: "20:00:00",
          maxAppointmentsLimit: null,
          uuid: "7683b94e-6c48-4132-b402-54837a8c0fb2"
        },
        {
          dayOfWeek: "SUNDAY",
          startTime: "07:00:00",
          endTime: "20:00:00",
          maxAppointmentsLimit: null,
          uuid: "00be8427-0037-4984-8875-6a5a2bc57e8e"
        },
        {
          dayOfWeek: "FRIDAY",
          startTime: "07:00:00",
          endTime: "20:00:00",
          maxAppointmentsLimit: null,
          uuid: "af6b8d5b-be05-4e24-8601-30573f848bec"
        },
        {
          dayOfWeek: "THURSDAY",
          startTime: "07:00:00",
          endTime: "20:00:00",
          maxAppointmentsLimit: null,
          uuid: "eb35e91b-6909-41fe-9d09-750b83fb3b9c"
        },
        {
          dayOfWeek: "SATURDAY",
          startTime: "07:00:00",
          endTime: "20:00:00",
          maxAppointmentsLimit: null,
          uuid: "7f6347fd-c514-4fd2-ab79-d7fd760bf82f"
        },
        {
          dayOfWeek: "WEDNESDAY",
          startTime: "07:00:00",
          endTime: "20:00:00",
          maxAppointmentsLimit: null,
          uuid: "dad83f54-a0a2-4ba9-819b-01e906c89b69"
        }
      ],
      serviceTypes: [
        {
          duration: 15,
          name: "Chemotherapy",
          uuid: "53d58ff1-0c45-4e2e-9bd2-9cc826cb46e1"
        }
      ]
    },
    {
      appointmentServiceId: 2,
      name: "Inpatient",
      description: null,
      speciality: {},
      startTime: "",
      endTime: "",
      maxAppointmentsLimit: null,
      durationMins: null,
      location: {},
      uuid: "f1c1a452-d2de-4392-ac23-cd4a4f5e84aa",
      color: "#006400",
      initialAppointmentStatus: "Scheduled",
      creatorName: null,
      weeklyAvailability: [
        {
          dayOfWeek: "MONDAY",
          startTime: "07:00:00",
          endTime: "20:00:00",
          maxAppointmentsLimit: null,
          uuid: "7c7c53c8-c104-40cc-9926-50fc6fe4c4c1"
        },
        {
          dayOfWeek: "TUESDAY",
          startTime: "07:00:00",
          endTime: "20:00:00",
          maxAppointmentsLimit: null,
          uuid: "7683b94e-6c48-4132-b402-54837a8c0fb2"
        },
        {
          dayOfWeek: "SUNDAY",
          startTime: "07:00:00",
          endTime: "20:00:00",
          maxAppointmentsLimit: null,
          uuid: "00be8427-0037-4984-8875-6a5a2bc57e8e"
        },
        {
          dayOfWeek: "FRIDAY",
          startTime: "07:00:00",
          endTime: "20:00:00",
          maxAppointmentsLimit: null,
          uuid: "af6b8d5b-be05-4e24-8601-30573f848bec"
        }
      ],
      serviceTypes: [
        {
          duration: 15,
          name: "Radiotherapy",
          uuid: "330ab4ac-d450-4f0f-bbe2-3c59eb8a0f87"
        }
      ]
    }
  ]
};

export const mockAppointmentsServiceResponse = {
  data: {
    appointmentServiceId: 1,
    name: "Outpatient",
    description: null,
    speciality: {},
    startTime: "",
    endTime: "",
    maxAppointmentsLimit: null,
    durationMins: null,
    location: {},
    uuid: "e2ec9cf0-ec38-4d2b-af6c-59c82fa30b90",
    color: "#006400",
    initialAppointmentStatus: "Scheduled",
    creatorName: null,
    weeklyAvailability: [
      {
        dayOfWeek: "MONDAY",
        startTime: "07:00:00",
        endTime: "20:00:00",
        maxAppointmentsLimit: null,
        uuid: "7c7c53c8-c104-40cc-9926-50fc6fe4c4c1"
      },
      {
        dayOfWeek: "TUESDAY",
        startTime: "07:00:00",
        endTime: "20:00:00",
        maxAppointmentsLimit: null,
        uuid: "7683b94e-6c48-4132-b402-54837a8c0fb2"
      },
      {
        dayOfWeek: "SUNDAY",
        startTime: "07:00:00",
        endTime: "20:00:00",
        maxAppointmentsLimit: null,
        uuid: "00be8427-0037-4984-8875-6a5a2bc57e8e"
      },
      {
        dayOfWeek: "FRIDAY",
        startTime: "07:00:00",
        endTime: "20:00:00",
        maxAppointmentsLimit: null,
        uuid: "af6b8d5b-be05-4e24-8601-30573f848bec"
      },
      {
        dayOfWeek: "THURSDAY",
        startTime: "07:00:00",
        endTime: "20:00:00",
        maxAppointmentsLimit: null,
        uuid: "eb35e91b-6909-41fe-9d09-750b83fb3b9c"
      },
      {
        dayOfWeek: "SATURDAY",
        startTime: "07:00:00",
        endTime: "20:00:00",
        maxAppointmentsLimit: null,
        uuid: "7f6347fd-c514-4fd2-ab79-d7fd760bf82f"
      },
      {
        dayOfWeek: "WEDNESDAY",
        startTime: "07:00:00",
        endTime: "20:00:00",
        maxAppointmentsLimit: null,
        uuid: "dad83f54-a0a2-4ba9-819b-01e906c89b69"
      }
    ],
    serviceTypes: [
      {
        duration: 15,
        name: "Chemotherapy",
        uuid: "53d58ff1-0c45-4e2e-9bd2-9cc826cb46e1"
      }
    ]
  }
};
