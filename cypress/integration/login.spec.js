describe("User should be able to login", () => {
  it("Type username and password to login", () => {
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
      cy.url().should("include", "/location");
    });
  });
});
