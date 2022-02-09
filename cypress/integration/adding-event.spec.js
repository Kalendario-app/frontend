import { findByRole, findByPlaceholderText, getByAltText } from "@testing-library/react";

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
function toHtmlDate(dte, fll) {
    var flDay;
    if (fll !== undefined) {
        flDay = fll;
    } else {
        flDay = false;
    }
    var date = new Date(dte);
    let tempM = date.getMonth() + 1;
    if (tempM < 10) {
        tempM = "0" + tempM;
    }
    let tempD = date.getDate();
    if (tempD < 10) {
        tempD = "0" + tempD;
    }
    let tempH = date.getHours();
    if (tempH < 10) {
        tempH = "0" + tempH;
    }
    let temp;
    if (flDay) {
        temp = date.getFullYear() + "-" + tempM + "-" + tempD;
    } else {
        temp = date.getFullYear() + "-" + tempM + "-" + tempD + "T" + tempH + ":00";
    }
    return temp;
}

describe("adding event", () => {
    /*it("user can add event via the button", () => {
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
    it("user can add event via drag of the button", () => {
        login();
        cy.get(".today-num-bubble").as("bubble");
        cy.get("@bubble").parent().parent().as("dayCard");
        cy.get(".monthly-top-button button").drag("@dayCard");
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
    });*/
    it("user cant add incorrect events (empty, end after start, end and start at the same time)", () => {
        login();
        cy.get(".monthly-top-button button").click();
        cy.get(".add-button-line .button-full").click();
        cy.get(".add-error-line").should("contain", "Please provide a name");

        cy.get("input[placeholder='Event name']").type("test event");

        cy.get(":nth-child(2) > .input-open").type(toHtmlDate(new Date(new Date().getTime() - 86400000)));
        cy.get(".add-button-line .button-full").click();
        cy.get(".add-error-line").should("contain", "Event can't end before starting");

        let dte = toHtmlDate(new Date());
        cy.get(":nth-child(5) > :nth-child(1) > .input-open").type(dte);
        cy.get(":nth-child(2) > .input-open").type(dte);
        cy.get(".add-button-line .button-full").click();
        cy.get(".add-error-line").should("contain", "Event can't end before starting");
    });
});
