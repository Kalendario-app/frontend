const { findByRole, findByPlaceholderText, getByAltText } = require("@testing-library/react");

const monthConv = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function login() {
    cy.visit("127.0.0.1:3000/login");
    cy.get("input[type=email]").type("test@test.com");
    cy.get("input[type=password]").type("test");
    cy.get(".login-submit button").click();
    cy.wait(10);
    cy.get("body").then((body) => {
        if (body.find(".code-in-line").length > 0) {
            cy.get(".input-contained").type("test");
            cy.get(".code-in-line button").click();
        }
    });
}

describe("adding event", () => {
    it("user can add event via the button", () => {
        login();
        cy.get(".monthly-top-button button").click();
        cy.get("input[placeholder='Event name']").type("test event");
        cy.get(".add-button-line .button-full").click();
        cy.get(".today-num-bubble").as("bubble");
        cy.get("@bubble").parent().parent().as("dayCard");
        cy.get("@bubble").should("contain", new Date().getDate());
        cy.get("@dayCard").should("contain", "test event");
        cy.get("@dayCard").find(".monthly-item").eq(0).as("event");
        cy.wait(500);
        cy.get("@event").click();
        cy.get(".detail-line").eq(0).as("eventTime");
        cy.get(".detail-line").eq(1).as("eventDuration");
        cy.get(".detail-line").eq(2).as("eventCalendar");
        cy.get("@eventTime").should("contain", new Date().getDate() + ", " + monthConv[new Date().getMonth()] + ", " + new Date().getFullYear());
        cy.get("@eventDuration").should("contain", "1h00");
        cy.get("@eventCalendar").should("contain", "Default Calendar");
        cy.get(".fa-ellipsis-h").click();
        cy.get(".detail-drop-delete").click();
        cy.wait(500);
        cy.get("@dayCard").should("not.contain", "test event");
    });
    it("user can add event via double click", () => {
        login();
        cy.get(".today-num-bubble").as("bubble");
        cy.get("@bubble").parent().parent().as("dayCard");
        cy.get("@dayCard").trigger("dblclick");
        cy.get("input[placeholder='Event name']").type("test event");
        cy.get(".add-button-line .button-full").click();
        cy.get(".today-num-bubble").as("bubble");
        cy.get("@bubble").parent().parent().as("dayCard");
        cy.get("@bubble").should("contain", new Date().getDate());
        cy.get("@dayCard").should("contain", "test event");
        cy.get("@dayCard").find(".monthly-item").eq(0).as("event");
        cy.wait(500);
        cy.get("@event").click();
        cy.get(".detail-line").eq(0).as("eventTime");
        cy.get(".detail-line").eq(1).as("eventDuration");
        cy.get(".detail-line").eq(2).as("eventCalendar");
        cy.get("@eventTime").should("contain", new Date().getDate() + ", " + monthConv[new Date().getMonth()] + ", " + new Date().getFullYear());
        cy.get("@eventDuration").should("contain", "1h00");
        cy.get("@eventCalendar").should("contain", "Default Calendar");
        cy.get(".fa-ellipsis-h").click();
        cy.get(".detail-drop-delete").click();
        cy.wait(500);
        cy.get("@dayCard").should("not.contain", "test event");
    });
});
