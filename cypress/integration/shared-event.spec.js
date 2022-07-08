// shared-event.js created with Cypress
//
// Start writing your Cypress tests below!
// If you're unfamiliar with how Cypress works,
// check out the link below and learn how to write your first test:
// https://on.cypress.io/writing-first-test
describe("shared event", () => {
    it("social work", () => {
        cy.login(true, true);
        cy.wait(500);
        cy.get("body").then(($body) => {
            if ($body.find(".verif-cross").length !== 0) {
                cy.get(".verif-cross").click();
            }
        });
        cy.get(".social-icon").click();
        cy.get(".input-contained").type("test@kalendario.test");
        cy.get(".search-res-name").should("contain", "Test1");
        cy.get(".search-res-item").click();
        cy.get(".social-cross").click();
        cy.get(".profil-pic").click();
        cy.get(".logout").click();
        cy.visit("http://127.0.0.1:3000/login");
        cy.login(true);
        cy.wait(500);
        cy.get("body").then(($body) => {
            if ($body.find(".verif-cross").length !== 0) {
                cy.get(".verif-cross").click();
            }
        });
        cy.get(".social-icon").click();
        cy.get(".social-right").should("contain", "Test1");
        cy.get(".friend-request-cross").each(($el) => {
            cy.get($el).click({ force: true });
        });
        cy.wait(500);
        cy.get(".social-right").should("not.contain", "Test1");
        cy.get(".input-contained").type("test.test@kalendario.test");
        cy.get(".search-res-item").click();
        cy.get(".social-cross").click();
        cy.get(".profil-pic").click();
        cy.get(".logout").click();
        cy.visit("http://127.0.0.1:3000/login");
        cy.login(false, true);
        cy.wait(500);
        cy.get("body").then(($body) => {
            if ($body.find(".verif-cross").length !== 0) {
                cy.get(".verif-cross").click();
            }
        });
        cy.get(".social-icon").click();
        cy.get(".friend-check").each(($el) => {
            cy.get($el).click({ force: true });
        });
        cy.get(".social-cross").click();
        cy.get(".profil-pic").click();
        cy.get(".logout").click();
        cy.visit("http://127.0.0.1:3000/login");
        cy.login();
        cy.get(".social-icon").click();
        cy.get(".social-left").should("contain", "T2");
        cy.log("do stuff");
        cy.get(".social-cross").click();
        //do stuff
        cy.get(".monthly-top-button button").click();
        cy.get("input[placeholder='Event name']").type("test event");
        cy.get(".guest-input").type("test");
        cy.intercept(Cypress.env("api_url") + "create").as("create");
        cy.intercept(Cypress.env("api_url")).as("api");
        cy.get(".guest-search-list > :nth-child(1)").click();
        cy.wait(500);
        cy.get(".add-button-line .button-full").click();
        cy.wait("@create");
        cy.wait("@api");
        cy.get(".monthly-calendar").should("contain", "test event");
        cy.get('.events-list > [draggable="true"]').click();
        cy.get(".fa-ellipsis-h").click();
        cy.get(".detail-drop-edit").click();
        cy.get(":nth-child(2) > .input-wrapper > .input-open").type(" 2");
        cy.intercept(Cypress.env("api_url") + "editEvent").as("edit");
        cy.get(".add-button-line > .button-full").click();
        cy.wait("@edit");
        cy.get(".monthly-calendar").should("contain", "test event 2");
        cy.get('.events-list > [draggable="true"]').click();
        cy.get(".fa-ellipsis-h").click();
        cy.intercept("https://api.kalendario.app/api/eventDelete?key=*").as("delete");
        cy.intercept("https://api.kalendario.app/api").as("api");
        cy.get(".detail-drop-delete").click();
        cy.wait("@delete");
        cy.wait("@api");
        cy.get(".monthly-calendar").should("not.contain", "test event 2");
        cy.get(".monthly-top-button button").click();
        cy.get("input[placeholder='Event name']").type("test event");
        cy.get(".guest-input").type("test");
        cy.intercept(Cypress.env("api_url") + "create").as("create");
        cy.intercept(Cypress.env("api_url")).as("api");
        cy.get(".guest-search-list > :nth-child(1)").click();
        cy.wait(500);
        cy.get(".add-button-line .button-full").click();
        cy.wait("@create");
        cy.wait("@api");
        //comeback on main and social
        cy.get(".social-icon").click();
        cy.get(".friend-reject").each(($e) => {
            cy.get($e).click({ force: true });
        });
        cy.get(".social-cross").click();
        cy.get(".profil-pic").click();
        cy.get(".logout").click();
        cy.visit("http://127.0.0.1:3000/login");
        cy.login(true, true);
        cy.wait(500);
        cy.get("body").then(($body) => {
            if ($body.find(".verif-cross").length !== 0) {
                cy.get(".verif-cross").click();
            }
        });
        cy.get(".monthly-calendar").should("contain", "test event");
        cy.get(".social-icon").click();
        cy.wait(500);
        cy.get(".friend-reject").eq(0).click();
        cy.visit("http://127.0.0.1:3000/calendar");
        cy.wait("@api");
        cy.wait(500);
        cy.get("body").then(($body) => {
            if ($body.find(".true-code-popup").length !== 0) {
                cy.get(".input-contained").type(Cypress.env("pass_alt"));
                cy.get(".code-in-line button").click();
                cy.wait("@api");
            }
            cy.wait(500);
            if ($body.find(".verif-cross").length !== 0) {
                cy.get(".verif-cross").click();
            }
        });
        cy.get("body").then(($body) => {
            if ($body.find(".verif-cross").length !== 0) {
                cy.get(".verif-cross").click();
            }
        });
        cy.get(".social-icon").click();
        cy.get(".social-left").should("not.contain", "test");
    });
});
