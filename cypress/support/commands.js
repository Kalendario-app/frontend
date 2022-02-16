import "@4tw/cypress-drag-drop";
Cypress.Commands.add("addBlankEvent", () => {
    cy.get(".monthly-top-button button").click();
    cy.get("input[placeholder='Event name']").type("test event");
    cy.intercept("https://api.kalendario.app/api").as("api");
    cy.get(".add-button-line .button-full").click();
    cy.wait("@api");
});
Cypress.Commands.add("deleteEvent", () => {
    cy.get(".monthly-card-today").as("dayCard");
    cy.get("@dayCard").find(".monthly-item").eq(0).as("event");
    cy.wait(500);
    cy.get("@event").click();
    cy.get(".fa-ellipsis-h").click();
    cy.get(".detail-drop-delete").click();
    cy.wait(1000);
    cy.get("@dayCard").should("not.contain", "test event");
});
Cypress.Commands.add("login", () => {
    cy.visit("127.0.0.1:3000/login");
    cy.get("input[type=email]").type(Cypress.env("email"));
    cy.get("input[type=password]").type(Cypress.env("password"));
    cy.intercept("https://api.kalendario.app/api/login?mdp=*").as("login");
    cy.intercept("https://api.kalendario.app/api/").as("api");
    cy.get(".login-submit button").click();
    cy.wait("@api");
    cy.get("body").then((body) => {
        if (body.find(".code-in-line").length > 0) {
            cy.get(".input-contained").type(Cypress.env("code"));
            cy.get(".code-in-line button").click();
        }
        if (body.find(".verif-cross").length > 0) {
            cy.get(".verif-cross").click();
        }
    });
    cy.addBlankEvent();
    cy.get(".fa-trash").click();
    cy.intercept("https://api.kalendario.app/api/").as("api");
    cy.get(".last-button").click();
    cy.wait("@api");
    cy.wait("@api");
});
