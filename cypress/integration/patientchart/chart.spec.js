describe("Patient chart", function() {
  beforeEach(() => {
    //TODO:https://callstack.com/blog/testing-react-app-with-cypress/
    cy.readFile("cypress/fixtures/user.json").as("user");
    cy.get("@user").then(user => {
      expect(true).to.equal(true);
      cy.visit("https://openmrs-spa.org/openmrs/spa/login");
      cy.get("#username")
        .type(user.username)
        .should("have.value", "user1");
      cy.get("#password").type("Admin123");
      // .should("have.value", "Admin123");
      cy.get("form").submit();
    });
  });
  it("Authenticate user, choose location and redirect to home", function() {
    cy.url().should("include", "/location");
    //Choose outpatient clinic
    cy.get('.omrs-radio-button [id="58c57d25-8d39-41ab-8422-108a0c277d98"]')
      .not("disabled")
      .check({ force: true })
      .should("be.checked");
    cy.get("form").submit();
    cy.url().should("include", "/home");
  });

  it("Search for patient and redirect to patient chart", () => {
    //cy.visit("https://openmrs-spa.org/openmrs/spa/location")
    cy.url().should("include", "/location");
    //Choose outpatient clinic
    cy.get('.omrs-radio-button [id="58c57d25-8d39-41ab-8422-108a0c277d98"]')
      .not("disabled")
      .check({ force: true })
      .should("be.checked");
    cy.get("form").submit();
    cy.visit("https://openmrs-spa.org/openmrs/spa/home/patient-search");
    cy.get("input:first").should(
      "have.attr",
      "placeholder",
      "Search for patient"
    );
    cy.get("input:first").type("John Wilson");
    cy.visit(
      "https://openmrs-spa.org/openmrs/spa/patient/8673ee4f-e2ab-4077-ba55-4980f408773e/chart"
    );
  });
});
