import "@4tw/cypress-drag-drop";
Cypress.Commands.add("addBlankEvent", () => {
    cy.get("body").then(($body) => {
        if ($body.find(".monthly-top-button button").length === 0) {
            cy.login();
        }
    });
    cy.get(".monthly-top-button button").click();
    cy.get("input[placeholder='Event name']").type("test event");
    cy.intercept(Cypress.env("api_url") + "create").as("create");
    cy.intercept(Cypress.env("api_url")).as("api");
    cy.get(".add-button-line .button-full").click();
    cy.wait("@create");
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
Cypress.Commands.add("popups", (alt) => {
    cy.wait(500);
    cy.get("body").then(($body) => {
        let shldCtn = false;
        if ($body.find(".true-code-popup").length !== 0) {
            cy.get(".input-contained").type(alt ? Cypress.env("pass_alt") : Cypress.env("code"));
            cy.get(".code-in-line button").click();
            cy.wait("@api");
            shldCtn = true;
        }
        if ($body.find(".verif-cross").length !== 0) {
            cy.get(".verif-cross").click();
            shldCtn = true;
        }
        if (shldCtn) {
            cy.popups(alt);
        }
    });
});
Cypress.Commands.add("login", (noEvt, alt) => {
    cy.intercept(Cypress.env("api_url")).as("api");
    cy.visit("127.0.0.1:3000/calendar");
    cy.wait("@api");
    cy.wait(500);
    cy.get("body").then(($body) => {
        if ($body.find("header").length === 0) {
            cy.visit("http://127.0.0.1:3000/login");
            cy.get("input[type=email]").type(alt ? Cypress.env("email_alt") : Cypress.env("email"));
            cy.get("input[type=password]").type(alt ? Cypress.env("pass_alt") : Cypress.env("password"));
            cy.intercept(Cypress.env("api_url")).as("api");
            cy.get(".login-submit button").click();
            cy.wait("@api");
        }
    });
    cy.wait(500);
    cy.popups(alt);
    if (noEvt !== true) {
        cy.get(".monthly-top-button button").click();
        cy.get("input[placeholder='Event name']").type("test event");
        cy.intercept(Cypress.env("api_url") + "create").as("create");
        cy.intercept(Cypress.env("api_url")).as("api");
        cy.get(".add-button-line .button-full").click();
        cy.wait("@create");
        cy.wait("@api");
        cy.get(".fa-trash").each((x, y) => {
            cy.get(".fa-trash").eq(y).click({ force: true });
            cy.intercept(Cypress.env("api_url") + "eventDelete?key=*").as("delete");
            cy.intercept(Cypress.env("api_url")).as("api");
            cy.get(".last-button").click();
            cy.wait("@delete");
            cy.wait("@api");
        });
        cy.wait(1000);
    }
});
