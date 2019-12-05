export const mockAllegenResponse = {
  setMembers: [
    {
      name: {
        uuid: "162298AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
        display: "ACE inhibitors"
      }
    },
    {
      name: {
        uuid: "162299AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
        display: "ARBs (angiotensin II receptor blockers)"
      }
    },
    {
      name: { uuid: "71617AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA", display: "Aspirin" }
    },
    {
      name: {
        uuid: "162301AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
        display: "Cephalosporins"
      }
    },
    {
      name: {
        uuid: "73667AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
        display: "Codeine"
      }
    },
    {
      name: {
        uuid: "162305AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
        display: "Heparins"
      }
    },
    {
      name: {
        uuid: "162307AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
        display: "Statins"
      }
    },
    {
      name: {
        uuid: "162302AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
        display: "Erythromycins"
      }
    },
    {
      name: {
        uuid: "80106AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
        display: "Morphine"
      }
    },
    {
      name: {
        uuid: "162306AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
        display: "NSAIDs"
      }
    },
    {
      name: {
        uuid: "162297AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
        display: "Penicillins"
      }
    },
    {
      name: {
        uuid: "162170AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
        display: "Sulfonamides"
      }
    },
    {
      name: {
        uuid: "5622AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
        display: "Other"
      }
    }
  ]
};

export const mockAllergyReactions = {
  setMembers: [
    {
      uuid: "121677AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
      display: "Mental status change",
      name: {
        display: "Mental status change",
        uuid: "127084BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB",
        name: "Mental status change",
        locale: "en",
        localePreferred: true,
        conceptNameType: null,
        links: [
          {
            rel: "self",
            uri:
              "http://localhost:8090/openmrs/ws/rest/v1/concept/121677AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/name/127084BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB"
          },
          {
            rel: "full",
            uri:
              "http://localhost:8090/openmrs/ws/rest/v1/concept/121677AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/name/127084BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB?v=full"
          }
        ],
        resourceVersion: "1.9"
      },
      datatype: {
        uuid: "8d4a4c94-c2cc-11de-8d13-0010c6dffd0f",
        display: "N/A",
        links: [
          {
            rel: "self",
            uri:
              "http://localhost:8090/openmrs/ws/rest/v1/conceptdatatype/8d4a4c94-c2cc-11de-8d13-0010c6dffd0f"
          }
        ]
      },
      conceptClass: {
        uuid: "8d4918b0-c2cc-11de-8d13-0010c6dffd0f",
        display: "Diagnosis",
        links: [
          {
            rel: "self",
            uri:
              "http://localhost:8090/openmrs/ws/rest/v1/conceptclass/8d4918b0-c2cc-11de-8d13-0010c6dffd0f"
          }
        ]
      },
      set: false,
      version: "",
      retired: false,
      names: [
        {
          uuid: "134528BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB",
          display: "Le changement de l'état mental",
          links: [
            {
              rel: "self",
              uri:
                "http://localhost:8090/openmrs/ws/rest/v1/concept/121677AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/name/134528BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB"
            }
          ]
        },
        {
          uuid: "134529BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB",
          display: "Chanjman eta mantal",
          links: [
            {
              rel: "self",
              uri:
                "http://localhost:8090/openmrs/ws/rest/v1/concept/121677AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/name/134529BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB"
            }
          ]
        },
        {
          uuid: "21808BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB",
          display: "Altered Mental Status",
          links: [
            {
              rel: "self",
              uri:
                "http://localhost:8090/openmrs/ws/rest/v1/concept/121677AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/name/21808BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB"
            }
          ]
        },
        {
          uuid: "80786BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB",
          display: "estado mental alterado",
          links: [
            {
              rel: "self",
              uri:
                "http://localhost:8090/openmrs/ws/rest/v1/concept/121677AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/name/80786BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB"
            }
          ]
        },
        {
          uuid: "127084BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB",
          display: "Mental status change",
          links: [
            {
              rel: "self",
              uri:
                "http://localhost:8090/openmrs/ws/rest/v1/concept/121677AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/name/127084BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB"
            }
          ]
        }
      ],
      descriptions: [],
      mappings: [
        {
          uuid: "185768ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB",
          display: "CIEL: 121677",
          links: [
            {
              rel: "self",
              uri:
                "http://localhost:8090/openmrs/ws/rest/v1/concept/121677AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/mapping/185768ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB"
            }
          ]
        },
        {
          uuid: "70242ABBBBBBBBBBBBBBBBBBBBBBBBBBBBBB",
          display: "SNOMED CT: 419284004",
          links: [
            {
              rel: "self",
              uri:
                "http://localhost:8090/openmrs/ws/rest/v1/concept/121677AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/mapping/70242ABBBBBBBBBBBBBBBBBBBBBBBBBBBBBB"
            }
          ]
        },
        {
          uuid: "266979ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB",
          display: "IMO ProblemIT: 72276",
          links: [
            {
              rel: "self",
              uri:
                "http://localhost:8090/openmrs/ws/rest/v1/concept/121677AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/mapping/266979ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB"
            }
          ]
        },
        {
          uuid: "95967ABBBBBBBBBBBBBBBBBBBBBBBBBBBBBB",
          display: "ICD-10-WHO: F99",
          links: [
            {
              rel: "self",
              uri:
                "http://localhost:8090/openmrs/ws/rest/v1/concept/121677AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/mapping/95967ABBBBBBBBBBBBBBBBBBBBBBBBBBBBBB"
            }
          ]
        }
      ],
      answers: [],
      setMembers: [],
      attributes: [],
      links: [
        {
          rel: "self",
          uri:
            "http://localhost:8090/openmrs/ws/rest/v1/concept/121677AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"
        },
        {
          rel: "full",
          uri:
            "http://localhost:8090/openmrs/ws/rest/v1/concept/121677AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA?v=full"
        }
      ],
      resourceVersion: "2.0"
    },
    {
      uuid: "121629AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
      display: "Anaemia",
      name: {
        display: "Anaemia",
        uuid: "21761BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB",
        name: "Anaemia",
        locale: "en",
        localePreferred: true,
        conceptNameType: "FULLY_SPECIFIED",
        links: [
          {
            rel: "self",
            uri:
              "http://localhost:8090/openmrs/ws/rest/v1/concept/121629AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/name/21761BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB"
          },
          {
            rel: "full",
            uri:
              "http://localhost:8090/openmrs/ws/rest/v1/concept/121629AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/name/21761BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB?v=full"
          }
        ],
        resourceVersion: "1.9"
      },
      datatype: {
        uuid: "8d4a4c94-c2cc-11de-8d13-0010c6dffd0f",
        display: "N/A",
        links: [
          {
            rel: "self",
            uri:
              "http://localhost:8090/openmrs/ws/rest/v1/conceptdatatype/8d4a4c94-c2cc-11de-8d13-0010c6dffd0f"
          }
        ]
      },
      conceptClass: {
        uuid: "8d4918b0-c2cc-11de-8d13-0010c6dffd0f",
        display: "Diagnosis",
        links: [
          {
            rel: "self",
            uri:
              "http://localhost:8090/openmrs/ws/rest/v1/conceptclass/8d4918b0-c2cc-11de-8d13-0010c6dffd0f"
          }
        ]
      },
      set: false,
      version: "",
      retired: false,
      names: [
        {
          uuid: "21764BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB",
          display: "Kubura amaraso",
          links: [
            {
              rel: "self",
              uri:
                "http://localhost:8090/openmrs/ws/rest/v1/concept/121629AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/name/21764BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB"
            }
          ]
        },
        {
          uuid: "130249BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB",
          display: "Bệnh thiếu máu",
          links: [
            {
              rel: "self",
              uri:
                "http://localhost:8090/openmrs/ws/rest/v1/concept/121629AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/name/130249BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB"
            }
          ]
        },
        {
          uuid: "131466BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB",
          display: "Thiếu máu",
          links: [
            {
              rel: "self",
              uri:
                "http://localhost:8090/openmrs/ws/rest/v1/concept/121629AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/name/131466BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB"
            }
          ]
        },
        {
          uuid: "80822BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB",
          display: "anemia",
          links: [
            {
              rel: "self",
              uri:
                "http://localhost:8090/openmrs/ws/rest/v1/concept/121629AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/name/80822BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB"
            }
          ]
        },
        {
          uuid: "134614BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB",
          display: "Anemi",
          links: [
            {
              rel: "self",
              uri:
                "http://localhost:8090/openmrs/ws/rest/v1/concept/121629AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/name/134614BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB"
            }
          ]
        },
        {
          uuid: "21762BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB",
          display: "Anémie",
          links: [
            {
              rel: "self",
              uri:
                "http://localhost:8090/openmrs/ws/rest/v1/concept/121629AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/name/21762BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB"
            }
          ]
        },
        {
          uuid: "127495BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB",
          display: "রক্তস্বল্পতা",
          links: [
            {
              rel: "self",
              uri:
                "http://localhost:8090/openmrs/ws/rest/v1/concept/121629AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/name/127495BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB"
            }
          ]
        },
        {
          uuid: "111240BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB",
          display: "АНЕМИЯ",
          links: [
            {
              rel: "self",
              uri:
                "http://localhost:8090/openmrs/ws/rest/v1/concept/121629AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/name/111240BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB"
            }
          ]
        },
        {
          uuid: "127494BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB",
          display: "Anemia",
          links: [
            {
              rel: "self",
              uri:
                "http://localhost:8090/openmrs/ws/rest/v1/concept/121629AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/name/127494BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB"
            }
          ]
        },
        {
          uuid: "21765BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB",
          display: "Upungufu wa damu mwilini",
          links: [
            {
              rel: "self",
              uri:
                "http://localhost:8090/openmrs/ws/rest/v1/concept/121629AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/name/21765BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB"
            }
          ]
        },
        {
          uuid: "21761BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB",
          display: "Anaemia",
          links: [
            {
              rel: "self",
              uri:
                "http://localhost:8090/openmrs/ws/rest/v1/concept/121629AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/name/21761BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB"
            }
          ]
        },
        {
          uuid: "21763BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB",
          display: "anemia",
          links: [
            {
              rel: "self",
              uri:
                "http://localhost:8090/openmrs/ws/rest/v1/concept/121629AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/name/21763BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB"
            }
          ]
        },
        {
          uuid: "100564BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB",
          display: "Anaemic",
          links: [
            {
              rel: "self",
              uri:
                "http://localhost:8090/openmrs/ws/rest/v1/concept/121629AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/name/100564BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB"
            }
          ]
        }
      ],
      descriptions: [
        {
          uuid: "6449FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF",
          display:
            "A reduction in the number of circulating erythrocytes or in the quantity of hemoglobin.",
          links: [
            {
              rel: "self",
              uri:
                "http://localhost:8090/openmrs/ws/rest/v1/concept/121629AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/description/6449FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF"
            }
          ]
        },
        {
          uuid: "6450FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF",
          display: "ugonjwa wa kuvuja damu",
          links: [
            {
              rel: "self",
              uri:
                "http://localhost:8090/openmrs/ws/rest/v1/concept/121629AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/description/6450FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF"
            }
          ]
        }
      ],
      mappings: [
        {
          uuid: "185735ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB",
          display: "CIEL: 121629",
          links: [
            {
              rel: "self",
              uri:
                "http://localhost:8090/openmrs/ws/rest/v1/concept/121629AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/mapping/185735ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB"
            }
          ]
        },
        {
          uuid: "133869ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB",
          display: "AMPATH: 3",
          links: [
            {
              rel: "self",
              uri:
                "http://localhost:8090/openmrs/ws/rest/v1/concept/121629AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/mapping/133869ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB"
            }
          ]
        },
        {
          uuid: "70276ABBBBBBBBBBBBBBBBBBBBBBBBBBBBBB",
          display: "SNOMED CT: 271737000",
          links: [
            {
              rel: "self",
              uri:
                "http://localhost:8090/openmrs/ws/rest/v1/concept/121629AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/mapping/70276ABBBBBBBBBBBBBBBBBBBBBBBBBBBBBB"
            }
          ]
        },
        {
          uuid: "88742ABBBBBBBBBBBBBBBBBBBBBBBBBBBBBB",
          display: "ICD-10-WHO: D64.9",
          links: [
            {
              rel: "self",
              uri:
                "http://localhost:8090/openmrs/ws/rest/v1/concept/121629AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/mapping/88742ABBBBBBBBBBBBBBBBBBBBBBBBBBBBBB"
            }
          ]
        },
        {
          uuid: "267206ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB",
          display: "IMO ProblemIT: 37980",
          links: [
            {
              rel: "self",
              uri:
                "http://localhost:8090/openmrs/ws/rest/v1/concept/121629AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/mapping/267206ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB"
            }
          ]
        },
        {
          uuid: "136180ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB",
          display: "AMPATH: 6030",
          links: [
            {
              rel: "self",
              uri:
                "http://localhost:8090/openmrs/ws/rest/v1/concept/121629AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/mapping/136180ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB"
            }
          ]
        },
        {
          uuid: "143600ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB",
          display: "PIH: 3",
          links: [
            {
              rel: "self",
              uri:
                "http://localhost:8090/openmrs/ws/rest/v1/concept/121629AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/mapping/143600ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB"
            }
          ]
        }
      ],
      answers: [],
      setMembers: [],
      attributes: [],
      links: [
        {
          rel: "self",
          uri:
            "http://localhost:8090/openmrs/ws/rest/v1/concept/121629AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"
        },
        {
          rel: "full",
          uri:
            "http://localhost:8090/openmrs/ws/rest/v1/concept/121629AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA?v=full"
        }
      ],
      resourceVersion: "2.0"
    },
    {
      uuid: "148888AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
      display: "Anaphylaxis",
      name: {
        display: "Anaphylaxis",
        uuid: "48506BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB",
        name: "Anaphylaxis",
        locale: "en",
        localePreferred: true,
        conceptNameType: "FULLY_SPECIFIED",
        links: [
          {
            rel: "self",
            uri:
              "http://localhost:8090/openmrs/ws/rest/v1/concept/148888AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/name/48506BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB"
          },
          {
            rel: "full",
            uri:
              "http://localhost:8090/openmrs/ws/rest/v1/concept/148888AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/name/48506BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB?v=full"
          }
        ],
        resourceVersion: "1.9"
      },
      datatype: {
        uuid: "8d4a4c94-c2cc-11de-8d13-0010c6dffd0f",
        display: "N/A",
        links: [
          {
            rel: "self",
            uri:
              "http://localhost:8090/openmrs/ws/rest/v1/conceptdatatype/8d4a4c94-c2cc-11de-8d13-0010c6dffd0f"
          }
        ]
      },
      conceptClass: {
        uuid: "8d4918b0-c2cc-11de-8d13-0010c6dffd0f",
        display: "Diagnosis",
        links: [
          {
            rel: "self",
            uri:
              "http://localhost:8090/openmrs/ws/rest/v1/conceptclass/8d4918b0-c2cc-11de-8d13-0010c6dffd0f"
          }
        ]
      },
      set: false,
      version: "",
      retired: false,
      names: [
        {
          uuid: "134615BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB",
          display: "Anaphylaxie",
          links: [
            {
              rel: "self",
              uri:
                "http://localhost:8090/openmrs/ws/rest/v1/concept/148888AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/name/134615BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB"
            }
          ]
        },
        {
          uuid: "57491BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB",
          display: "anafilaxis",
          links: [
            {
              rel: "self",
              uri:
                "http://localhost:8090/openmrs/ws/rest/v1/concept/148888AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/name/57491BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB"
            }
          ]
        },
        {
          uuid: "134616BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB",
          display: "Anafilaktik",
          links: [
            {
              rel: "self",
              uri:
                "http://localhost:8090/openmrs/ws/rest/v1/concept/148888AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/name/134616BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB"
            }
          ]
        },
        {
          uuid: "111235BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB",
          display: "АНАФИЛАКСИЯ",
          links: [
            {
              rel: "self",
              uri:
                "http://localhost:8090/openmrs/ws/rest/v1/concept/148888AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/name/111235BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB"
            }
          ]
        },
        {
          uuid: "114498BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB",
          display: "anafylaxie",
          links: [
            {
              rel: "self",
              uri:
                "http://localhost:8090/openmrs/ws/rest/v1/concept/148888AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/name/114498BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB"
            }
          ]
        },
        {
          uuid: "48506BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB",
          display: "Anaphylaxis",
          links: [
            {
              rel: "self",
              uri:
                "http://localhost:8090/openmrs/ws/rest/v1/concept/148888AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/name/48506BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB"
            }
          ]
        },
        {
          uuid: "128037BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB",
          display: "Sốc phản vệ",
          links: [
            {
              rel: "self",
              uri:
                "http://localhost:8090/openmrs/ws/rest/v1/concept/148888AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/name/128037BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB"
            }
          ]
        }
      ],
      descriptions: [
        {
          uuid: "15170FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF",
          display:
            "An acute hypersensitivity reaction due to exposure to a previously encountered antigen. The reaction may include rapidly progressing urticaria, respiratory distress, vascular collapse, systemic shock, and death.",
          links: [
            {
              rel: "self",
              uri:
                "http://localhost:8090/openmrs/ws/rest/v1/concept/148888AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/description/15170FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF"
            }
          ]
        }
      ],
      mappings: [
        {
          uuid: "150048ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB",
          display: "3BT: 10005487",
          links: [
            {
              rel: "self",
              uri:
                "http://localhost:8090/openmrs/ws/rest/v1/concept/148888AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/mapping/150048ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB"
            }
          ]
        },
        {
          uuid: "133162ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB",
          display: "PIH: 998",
          links: [
            {
              rel: "self",
              uri:
                "http://localhost:8090/openmrs/ws/rest/v1/concept/148888AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/mapping/133162ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB"
            }
          ]
        },
        {
          uuid: "208315ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB",
          display: "CIEL: 148888",
          links: [
            {
              rel: "self",
              uri:
                "http://localhost:8090/openmrs/ws/rest/v1/concept/148888AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/mapping/208315ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB"
            }
          ]
        },
        {
          uuid: "46784ABBBBBBBBBBBBBBBBBBBBBBBBBBBBBB",
          display: "SNOMED CT: 39579001",
          links: [
            {
              rel: "self",
              uri:
                "http://localhost:8090/openmrs/ws/rest/v1/concept/148888AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/mapping/46784ABBBBBBBBBBBBBBBBBBBBBBBBBBBBBB"
            }
          ]
        },
        {
          uuid: "238853ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB",
          display: "IMO ProblemIT: 37966",
          links: [
            {
              rel: "self",
              uri:
                "http://localhost:8090/openmrs/ws/rest/v1/concept/148888AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/mapping/238853ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB"
            }
          ]
        },
        {
          uuid: "102343ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB",
          display: "ICD-10-WHO: T78.2",
          links: [
            {
              rel: "self",
              uri:
                "http://localhost:8090/openmrs/ws/rest/v1/concept/148888AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/mapping/102343ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB"
            }
          ]
        },
        {
          uuid: "161808ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB",
          display: "ICPC2: A92",
          links: [
            {
              rel: "self",
              uri:
                "http://localhost:8090/openmrs/ws/rest/v1/concept/148888AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/mapping/161808ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB"
            }
          ]
        }
      ],
      answers: [],
      setMembers: [],
      attributes: [],
      links: [
        {
          rel: "self",
          uri:
            "http://localhost:8090/openmrs/ws/rest/v1/concept/148888AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"
        },
        {
          rel: "full",
          uri:
            "http://localhost:8090/openmrs/ws/rest/v1/concept/148888AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA?v=full"
        }
      ],
      resourceVersion: "2.0"
    }
  ]
};

export const mockPatientAllergy = {
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
    display: "ACE inhibitors",
    uuid: "e68fb587-486b-4894-9fc8-eba08fe682c7",
    allergen: {
      allergenType: "DRUG",
      codedAllergen: {
        uuid: "162298AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
        display: "ACE inhibitors",
        name: {
          display: "ACE inhibitors",
          uuid: "126205BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB",
          name: "ACE inhibitors"
        },
        names: [
          {
            uuid: "134688BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB",
            display: "Enzyme de conversion classe des inhibiteurs de la drogue",
            links: [
              {
                rel: "self",
                uri:
                  "http://localhost:8090/openmrs/ws/rest/v1/concept/162298AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/name/134688BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB"
              }
            ]
          },
          {
            uuid: "125408BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB",
            display: "ACE-inhibitors",
            links: [
              {
                rel: "self",
                uri:
                  "http://localhost:8090/openmrs/ws/rest/v1/concept/162298AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/name/125408BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB"
              }
            ]
          },
          {
            uuid: "135443BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB",
            display: "Inhibiteurs de l’ECA",
            links: [
              {
                rel: "self",
                uri:
                  "http://localhost:8090/openmrs/ws/rest/v1/concept/162298AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/name/135443BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB"
              }
            ]
          },
          {
            uuid: "134689BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB",
            display: "Anjyotansen-konvèti anzim inhibiteurs klas dwòg",
            links: [
              {
                rel: "self",
                uri:
                  "http://localhost:8090/openmrs/ws/rest/v1/concept/162298AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/name/134689BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB"
              }
            ]
          },
          {
            uuid: "125409BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB",
            display: "Angiotensin-converting enzyme inhibitors drug class",
            links: [
              {
                rel: "self",
                uri:
                  "http://localhost:8090/openmrs/ws/rest/v1/concept/162298AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/name/125409BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB"
              }
            ]
          },
          {
            uuid: "126205BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB",
            display: "ACE inhibitors",
            links: [
              {
                rel: "self",
                uri:
                  "http://localhost:8090/openmrs/ws/rest/v1/concept/162298AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/name/126205BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB"
              }
            ]
          },
          {
            uuid: "127561BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB",
            display: "Thuốc ức chế men chuyển",
            links: [
              {
                rel: "self",
                uri:
                  "http://localhost:8090/openmrs/ws/rest/v1/concept/162298AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/name/127561BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB"
              }
            ]
          }
        ],
        descriptions: [],
        mappings: [
          {
            uuid: "275111ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB",
            display: "CIEL: 162298",
            links: [
              {
                rel: "self",
                uri:
                  "http://localhost:8090/openmrs/ws/rest/v1/concept/162298AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/mapping/275111ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB"
              }
            ]
          },
          {
            uuid: "275109ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB",
            display: "SNOMED CT: 41549009",
            links: [
              {
                rel: "self",
                uri:
                  "http://localhost:8090/openmrs/ws/rest/v1/concept/162298AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/mapping/275109ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB"
              }
            ]
          },
          {
            uuid: "279273ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB",
            display: "NDF-RT NUI: N0000000181",
            links: [
              {
                rel: "self",
                uri:
                  "http://localhost:8090/openmrs/ws/rest/v1/concept/162298AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/mapping/279273ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB"
              }
            ]
          },
          {
            uuid: "275110ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB",
            display: "NDF-RT NUI: N0000175562",
            links: [
              {
                rel: "self",
                uri:
                  "http://localhost:8090/openmrs/ws/rest/v1/concept/162298AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/mapping/275110ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB"
              }
            ]
          },
          {
            uuid: "283334ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB",
            display: "MED-RT NUI: N0000175562",
            links: [
              {
                rel: "self",
                uri:
                  "http://localhost:8090/openmrs/ws/rest/v1/concept/162298AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/mapping/283334ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB"
              }
            ]
          }
        ],
        answers: [],
        setMembers: [],
        attributes: [],
        links: [
          {
            rel: "self",
            uri:
              "http://localhost:8090/openmrs/ws/rest/v1/concept/162298AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"
          },
          {
            rel: "full",
            uri:
              "http://localhost:8090/openmrs/ws/rest/v1/concept/162298AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA?v=full"
          }
        ],
        resourceVersion: "2.0"
      },
      nonCodedAllergen: null
    },
    severity: {
      uuid: "1500AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
      display: "Severe",
      name: {
        display: "Severe",
        uuid: "1742BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB",
        name: "Severe",
        locale: "en",
        localePreferred: true,
        conceptNameType: "FULLY_SPECIFIED",
        links: [
          {
            rel: "self",
            uri:
              "http://localhost:8090/openmrs/ws/rest/v1/concept/1500AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/name/1742BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB"
          },
          {
            rel: "full",
            uri:
              "http://localhost:8090/openmrs/ws/rest/v1/concept/1500AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/name/1742BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB?v=full"
          }
        ],
        resourceVersion: "1.9"
      },
      datatype: {
        uuid: "8d4a4c94-c2cc-11de-8d13-0010c6dffd0f",
        display: "N/A",
        links: [
          {
            rel: "self",
            uri:
              "http://localhost:8090/openmrs/ws/rest/v1/conceptdatatype/8d4a4c94-c2cc-11de-8d13-0010c6dffd0f"
          }
        ]
      },
      conceptClass: {
        uuid: "8d491a9a-c2cc-11de-8d13-0010c6dffd0f",
        display: "Finding",
        links: [
          {
            rel: "self",
            uri:
              "http://localhost:8090/openmrs/ws/rest/v1/conceptclass/8d491a9a-c2cc-11de-8d13-0010c6dffd0f"
          }
        ]
      },
      set: false,
      version: "",
      retired: false,
      names: [
        {
          uuid: "106144BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB",
          display: "SÉVÈRE",
          links: [
            {
              rel: "self",
              uri:
                "http://localhost:8090/openmrs/ws/rest/v1/concept/1500AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/name/106144BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB"
            }
          ]
        },
        {
          uuid: "1742BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB",
          display: "Severe",
          links: [
            {
              rel: "self",
              uri:
                "http://localhost:8090/openmrs/ws/rest/v1/concept/1500AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/name/1742BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB"
            }
          ]
        },
        {
          uuid: "134599BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB",
          display: "Sevè",
          links: [
            {
              rel: "self",
              uri:
                "http://localhost:8090/openmrs/ws/rest/v1/concept/1500AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/name/134599BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB"
            }
          ]
        }
      ],
      descriptions: [
        {
          uuid: "16229FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF",
          display: "General qualifier value for the severity assesment",
          links: [
            {
              rel: "self",
              uri:
                "http://localhost:8090/openmrs/ws/rest/v1/concept/1500AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/description/16229FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF"
            }
          ]
        }
      ],
      mappings: [
        {
          uuid: "133263ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB",
          display: "PIH: 1903",
          links: [
            {
              rel: "self",
              uri:
                "http://localhost:8090/openmrs/ws/rest/v1/concept/1500AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/mapping/133263ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB"
            }
          ]
        },
        {
          uuid: "135122ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB",
          display: "AMPATH: 1745",
          links: [
            {
              rel: "self",
              uri:
                "http://localhost:8090/openmrs/ws/rest/v1/concept/1500AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/mapping/135122ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB"
            }
          ]
        },
        {
          uuid: "171742ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB",
          display: "CIEL: 1500",
          links: [
            {
              rel: "self",
              uri:
                "http://localhost:8090/openmrs/ws/rest/v1/concept/1500AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/mapping/171742ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB"
            }
          ]
        },
        {
          uuid: "132651ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB",
          display: "SNOMED CT: 24484000",
          links: [
            {
              rel: "self",
              uri:
                "http://localhost:8090/openmrs/ws/rest/v1/concept/1500AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/mapping/132651ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB"
            }
          ]
        }
      ],
      answers: [],
      setMembers: [],
      attributes: [],
      links: [
        {
          rel: "self",
          uri:
            "http://localhost:8090/openmrs/ws/rest/v1/concept/1500AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"
        },
        {
          rel: "full",
          uri:
            "http://localhost:8090/openmrs/ws/rest/v1/concept/1500AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA?v=full"
        }
      ],
      resourceVersion: "2.0"
    },
    comment: "Patient Allergy comments",
    reactions: [
      {
        reaction: {
          uuid: "121677AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
          display: "Mental status change",
          name: {
            display: "Mental status change",
            uuid: "127084BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB",
            name: "Mental status change",
            locale: "en",
            localePreferred: true,
            conceptNameType: null,
            links: [
              {
                rel: "self",
                uri:
                  "http://localhost:8090/openmrs/ws/rest/v1/concept/121677AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/name/127084BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB"
              },
              {
                rel: "full",
                uri:
                  "http://localhost:8090/openmrs/ws/rest/v1/concept/121677AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/name/127084BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB?v=full"
              }
            ],
            resourceVersion: "1.9"
          },
          datatype: {
            uuid: "8d4a4c94-c2cc-11de-8d13-0010c6dffd0f",
            display: "N/A",
            links: [
              {
                rel: "self",
                uri:
                  "http://localhost:8090/openmrs/ws/rest/v1/conceptdatatype/8d4a4c94-c2cc-11de-8d13-0010c6dffd0f"
              }
            ]
          },
          conceptClass: {
            uuid: "8d4918b0-c2cc-11de-8d13-0010c6dffd0f",
            display: "Diagnosis",
            links: [
              {
                rel: "self",
                uri:
                  "http://localhost:8090/openmrs/ws/rest/v1/conceptclass/8d4918b0-c2cc-11de-8d13-0010c6dffd0f"
              }
            ]
          },
          set: false,
          version: "",
          retired: false,
          names: [
            {
              uuid: "134528BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB",
              display: "Le changement de l'état mental",
              links: [
                {
                  rel: "self",
                  uri:
                    "http://localhost:8090/openmrs/ws/rest/v1/concept/121677AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/name/134528BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB"
                }
              ]
            },
            {
              uuid: "134529BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB",
              display: "Chanjman eta mantal",
              links: [
                {
                  rel: "self",
                  uri:
                    "http://localhost:8090/openmrs/ws/rest/v1/concept/121677AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/name/134529BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB"
                }
              ]
            },
            {
              uuid: "21808BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB",
              display: "Altered Mental Status",
              links: [
                {
                  rel: "self",
                  uri:
                    "http://localhost:8090/openmrs/ws/rest/v1/concept/121677AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/name/21808BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB"
                }
              ]
            },
            {
              uuid: "80786BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB",
              display: "estado mental alterado",
              links: [
                {
                  rel: "self",
                  uri:
                    "http://localhost:8090/openmrs/ws/rest/v1/concept/121677AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/name/80786BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB"
                }
              ]
            },
            {
              uuid: "127084BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB",
              display: "Mental status change",
              links: [
                {
                  rel: "self",
                  uri:
                    "http://localhost:8090/openmrs/ws/rest/v1/concept/121677AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/name/127084BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB"
                }
              ]
            }
          ],
          descriptions: [],
          mappings: [
            {
              uuid: "185768ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB",
              display: "CIEL: 121677",
              links: [
                {
                  rel: "self",
                  uri:
                    "http://localhost:8090/openmrs/ws/rest/v1/concept/121677AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/mapping/185768ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB"
                }
              ]
            },
            {
              uuid: "70242ABBBBBBBBBBBBBBBBBBBBBBBBBBBBBB",
              display: "SNOMED CT: 419284004",
              links: [
                {
                  rel: "self",
                  uri:
                    "http://localhost:8090/openmrs/ws/rest/v1/concept/121677AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/mapping/70242ABBBBBBBBBBBBBBBBBBBBBBBBBBBBBB"
                }
              ]
            },
            {
              uuid: "266979ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB",
              display: "IMO ProblemIT: 72276",
              links: [
                {
                  rel: "self",
                  uri:
                    "http://localhost:8090/openmrs/ws/rest/v1/concept/121677AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/mapping/266979ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB"
                }
              ]
            },
            {
              uuid: "95967ABBBBBBBBBBBBBBBBBBBBBBBBBBBBBB",
              display: "ICD-10-WHO: F99",
              links: [
                {
                  rel: "self",
                  uri:
                    "http://localhost:8090/openmrs/ws/rest/v1/concept/121677AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/mapping/95967ABBBBBBBBBBBBBBBBBBBBBBBBBBBBBB"
                }
              ]
            }
          ],
          answers: [],
          setMembers: [],
          attributes: [],
          links: [
            {
              rel: "self",
              uri:
                "http://localhost:8090/openmrs/ws/rest/v1/concept/121677AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"
            },
            {
              rel: "full",
              uri:
                "http://localhost:8090/openmrs/ws/rest/v1/concept/121677AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA?v=full"
            }
          ],
          resourceVersion: "2.0"
        },
        reactionNonCoded: null
      }
    ],
    patient: {
      uuid: "90f7f0b4-06a8-4a97-9678-e7a977f4b518",
      display: "10010W - John Taylor",
      identifiers: [
        {
          uuid: "21bb350c-799b-4837-9496-2ad213e058a4",
          display: "OpenMRS ID = 10010W",
          links: [
            {
              rel: "self",
              uri:
                "http://localhost:8090/openmrs/ws/rest/v1/patient/90f7f0b4-06a8-4a97-9678-e7a977f4b518/identifier/21bb350c-799b-4837-9496-2ad213e058a4"
            }
          ]
        }
      ],
      person: {
        uuid: "90f7f0b4-06a8-4a97-9678-e7a977f4b518",
        display: "John Taylor",
        gender: "M",
        age: 41,
        birthdate: "1978-08-25T00:00:00.000+0000",
        birthdateEstimated: false,
        dead: false,
        deathDate: null,
        causeOfDeath: null,
        preferredName: {
          uuid: "4b68f067-6f4d-451a-bd80-342fc21ea486",
          display: "John Taylor",
          links: [
            {
              rel: "self",
              uri:
                "http://localhost:8090/openmrs/ws/rest/v1/person/90f7f0b4-06a8-4a97-9678-e7a977f4b518/name/4b68f067-6f4d-451a-bd80-342fc21ea486"
            }
          ]
        },
        preferredAddress: {
          uuid: "e350d53f-0252-4259-8d87-d97a2d58166e",
          display: "Police Line",
          links: [
            {
              rel: "self",
              uri:
                "http://localhost:8090/openmrs/ws/rest/v1/person/90f7f0b4-06a8-4a97-9678-e7a977f4b518/address/e350d53f-0252-4259-8d87-d97a2d58166e"
            }
          ]
        },
        attributes: [],
        voided: false,
        deathdateEstimated: false,
        birthtime: null,
        links: [
          {
            rel: "self",
            uri:
              "http://localhost:8090/openmrs/ws/rest/v1/person/90f7f0b4-06a8-4a97-9678-e7a977f4b518"
          },
          {
            rel: "full",
            uri:
              "http://localhost:8090/openmrs/ws/rest/v1/person/90f7f0b4-06a8-4a97-9678-e7a977f4b518?v=full"
          }
        ],
        resourceVersion: "1.11"
      },
      voided: false,
      links: [
        {
          rel: "self",
          uri:
            "http://localhost:8090/openmrs/ws/rest/v1/patient/90f7f0b4-06a8-4a97-9678-e7a977f4b518"
        },
        {
          rel: "full",
          uri:
            "http://localhost:8090/openmrs/ws/rest/v1/patient/90f7f0b4-06a8-4a97-9678-e7a977f4b518?v=full"
        }
      ],
      resourceVersion: "1.8"
    },
    voided: true,
    auditInfo: {
      creator: {
        uuid: "285f67ce-3d8b-4733-96e5-1e2235e8e804",
        display: "doc",
        links: [
          {
            rel: "self",
            uri:
              "http://localhost:8090/openmrs/ws/rest/v1/user/285f67ce-3d8b-4733-96e5-1e2235e8e804"
          }
        ]
      },
      dateCreated: "2019-12-16T07:10:36.000+0000",
      changedBy: {
        uuid: "285f67ce-3d8b-4733-96e5-1e2235e8e804",
        display: "doc",
        links: [
          {
            rel: "self",
            uri:
              "http://localhost:8090/openmrs/ws/rest/v1/user/285f67ce-3d8b-4733-96e5-1e2235e8e804"
          }
        ]
      },
      dateChanged: "2019-12-16T07:46:42.000+0000",
      voidedBy: {
        uuid: "285f67ce-3d8b-4733-96e5-1e2235e8e804",
        display: "doc",
        links: [
          {
            rel: "self",
            uri:
              "http://localhost:8090/openmrs/ws/rest/v1/user/285f67ce-3d8b-4733-96e5-1e2235e8e804"
          }
        ]
      },
      dateVoided: "2019-12-16T07:46:42.000+0000",
      voidReason: "web service call"
    },
    links: [
      {
        rel: "self",
        uri:
          "http://localhost:8090/openmrs/ws/rest/v1/patient/90f7f0b4-06a8-4a97-9678-e7a977f4b518/allergy/e68fb587-486b-4894-9fc8-eba08fe682c7"
      }
    ],
    resourceVersion: "1.8"
  }
};
