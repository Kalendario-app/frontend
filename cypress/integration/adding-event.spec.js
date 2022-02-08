const { findByRole, findByPlaceholderText, getByAltText } = require("@testing-library/react");

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
        //wait for the code popup to show up
        //type code
        cy.get(".code-in-line input").type("test");
        //click submit
        cy.get(".code-in-line button").click();
        //wait for the event to show up
        //click add event
        cy.get(".monthly-top-button button").click();
        //type in event name
        cy.get("input[placeholder='Event name']").type("test event");
        //click add
        cy.get(".add-button-line .button-full").click();
        //wait for the event to show up
        //check if the event is right
        //click on the event
        //delete the event
    });
});
