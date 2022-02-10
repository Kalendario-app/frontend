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
        cy.wait(1000);
        if (body.find(".verif-cross").length > 0) {
            cy.get(".verif-cross").click();
        }
    });
}
function addBlankEvent() {
    cy.get(".monthly-top-button button").click();
    cy.get("input[placeholder='Event name']").type("test event");
    cy.get(".add-button-line .button-full").click();
}
function deleteEvent() {
    cy.get(".today-num-bubble").as("bubble");
    cy.get("@bubble").parent().parent().as("dayCard");
    cy.get("@dayCard").find(".monthly-item").eq(0).as("event");
    cy.wait(500);
    cy.get("@event").click();
    cy.get(".fa-ellipsis-h").click();
    cy.get(".detail-drop-delete").click();
    cy.wait(500);
    cy.get("@dayCard").should("not.contain", "test event");
}

describe("calendar select", () => {
    it("event appear and disapear when click on the select calendar", () => {
        login();
        addBlankEvent();
        cy.get(".today-num-bubble").as("bubble");
        cy.get("@bubble").parent().parent().as("dayCard");
        cy.get("@dayCard").should("contain", "test event");
        cy.get(".check-container").click();
        cy.get("@dayCard").should("not.contain", "test event");
        cy.get(".check-container").click();
        deleteEvent();
    });
    it("adding, editing and deleting a calendar work", () => {
        login();
        cy.get("#calendar-add").click();
        cy.get(".input-open").type("test calendar");
        cy.get(".calendar-add-div > .button-full").click();
        cy.get(".calendar-select").should("contain", "test calendar");
        cy.get(".calendar-select").trigger("mouseover", "center");
        cy.get(".fa-pen").click();
        cy.get(".input-open").clear().type("test calendar edited");
        cy.get(".cal-edit-btns > .button-full").click();
        cy.get(".calendar-select").should("contain", "test calendar edited");
        cy.get(".fa-trash").click();
        cy.get(".last-button").click();
        cy.get(".calendar-select").should("not.contain", "test calendar edited");
    });
    it("delete popup show up the right number of events", () => {
        login();
        addBlankEvent();
        cy.get(".fa-trash").click();
        cy.get(".last-button").click();
        addBlankEvent();
        addBlankEvent();
        cy.get(".fa-trash").click();
        cy.get(".calendar-delete-popup > p").should("contain", "Are you sure to delete Default Calendar? It will destroy every event inside of it! (It has 2 events !)");
        cy.get(".last-button").click();
        cy.wait(10);
        cy.get("#calendar-add").click();
        cy.get(".input-open").type("test calendar");
        cy.get(".calendar-add-div > .button-full").click();
        addBlankEvent();
        addBlankEvent();
        cy.get(".fa-trash").click();
        cy.get(".calendar-delete-popup > p").should("contain", "Are you sure to delete test calendar? It will destroy every event inside of it! (It has 2 events !)");
        cy.get(".last-button").click();
    });
});
