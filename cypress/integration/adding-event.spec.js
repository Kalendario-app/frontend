const { findByRole, findByPlaceholderText, getByAltText } = require("@testing-library/react");

const monthConv = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

describe("adding event via the add button works", () => {
    it("user can add event", () => {
        //visit /login
        cy.visit("127.0.0.1:3000/login");
        //type in username
        cy.get("input[type=email]").type("test@test.com");
        //type in password
        cy.get("input[type=password]").type("test");
        //click login button
        cy.get(".login-submit button").click();
        //type code
        cy.get(".code-in-line input").type("test");
        //click submit
        cy.get(".code-in-line button").click();
        //click add event
        cy.get(".monthly-top-button button").click();
        //type in event name
        cy.get("input[placeholder='Event name']").type("test event");
        //click add
        cy.get(".add-button-line .button-full").click();
        //check if the event is right
        //chercher la number bubble du jour, puis chercher l'élement parent et vérif qu'il contient bien l'évenenement, checker aussi que le numéro dans la bulle est le bon, checker aussi dans les détails que la date de l'évent est la bonne
        cy.get(".today-num-bubble").as("bubble");
        cy.get("@bubble").parent().parent().as("dayCard");
        cy.get("@bubble").should("contain", new Date().getDate());
        cy.get("@dayCard").should("contain", "test event");
        //click on the event
        cy.get("@dayCard").find(".monthly-item").eq(0).as("event");
        cy.wait(500);
        cy.get("@event").click();
        cy.get(".detail-line").eq(0).as("eventTime");
        cy.get(".detail-line").eq(1).as("eventDuration");
        cy.get(".detail-line").eq(2).as("eventCalendar");
        cy.get("@eventTime").should("contain", new Date().getDate() + ", " + monthConv[new Date().getMonth()] + ", " + new Date().getFullYear());
        cy.get("@eventDuration").should("contain", "1h00");
        cy.get("@eventCalendar").should("contain", "Default Calendar");
        //delete the event
        cy.get(".fa-ellipsis-h").click();
        cy.get(".detail-drop-delete").click();
        //check if the event isn't there anymore
        cy.wait(500);
        cy.get("@dayCard").should("not.contain", "test event");
    });
});
