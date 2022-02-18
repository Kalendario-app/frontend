const monthConv = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

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
    let tempMn = date.getMinutes();
    if (tempMn < 10) {
        tempMn = "0" + tempMn;
    }
    let temp;
    if (flDay) {
        temp = date.getFullYear() + "-" + tempM + "-" + tempD;
    } else {
        temp = date.getFullYear() + "-" + tempM + "-" + tempD + "T" + tempH + ":" + tempMn;
    }
    return temp;
}

describe("adding event", () => {
    it("user can add event via the button", () => {
        cy.login();
        cy.get(".monthly-top-button button").click();
        cy.get("input[placeholder='Event name']").type("test event");
        cy.intercept("https://api.kalendario.app/api/create").as("add");
        cy.get(".add-button-line .button-full").click();
        cy.wait("@add");
        cy.get(".today-num-bubble").as("bubble");
        cy.get(".monthly-card-today").as("dayCard");
        cy.wait(10);
        cy.get("@bubble").should("contain", new Date().getDate());
        cy.get(".monthly-card-today").as("dayCard");
        cy.wait(10);
        cy.get("@dayCard").should("contain", "test event");
        cy.get("@dayCard").find(".monthly-item").eq(0).as("event");
        cy.wait(10);
        cy.get("@event").click();
        cy.get(".detail-line").eq(0).as("eventTime");
        cy.get(".detail-line").eq(1).as("eventDuration");
        cy.get(".detail-line").eq(2).as("eventCalendar");
        cy.get("@eventTime").should("contain", new Date().getDate() + ", " + monthConv[new Date().getMonth()] + ", " + new Date().getFullYear());
        cy.get("@eventDuration").should("contain", "1h00");
        cy.get("@eventCalendar").should("contain", "Default Calendar");
        cy.get(".fa-ellipsis-h").click();
        cy.intercept("https://api.kalendario.app/api").as("api");
        cy.get(".detail-drop-delete").click();
        cy.wait("@api");
        cy.get("@dayCard").should("not.contain", "test event");
    });
    it("user can add event via double click", () => {
        cy.login();
        cy.wait(1000);
        cy.get(".monthly-card-today").trigger("dblclick", "center");
        cy.get("input[placeholder='Event name']").type("test event");
        cy.intercept("https://api.kalendario.app/api/create").as("add");
        cy.get(".add-button-line .button-full").click();
        cy.wait("@add");
        cy.get(".monthly-card-today").as("dayCard");
        cy.get(".today-num-bubble").as("bubble");
        cy.wait(10);
        cy.get("@bubble").should("contain", new Date().getDate());
        cy.wait(10);
        cy.get("@dayCard").should("contain", "test event");
        cy.get("@dayCard").find(".monthly-item").eq(0).as("event");
        cy.wait(10);
        cy.get("@event").click();
        cy.get(".detail-line").eq(0).as("eventTime");
        cy.get(".detail-line").eq(1).as("eventDuration");
        cy.get(".detail-line").eq(2).as("eventCalendar");
        cy.get("@eventTime").should("contain", new Date().getDate() + ", " + monthConv[new Date().getMonth()] + ", " + new Date().getFullYear());
        cy.get("@eventDuration").should("contain", "1h00");
        cy.get("@eventCalendar").should("contain", "Default Calendar");
        cy.get(".fa-ellipsis-h").click();
        cy.intercept("https://api.kalendario.app/api/eventDelete").as("delete");
        cy.intercept("https://api.kalendario.app/api").as("api");
        cy.get(".detail-drop-delete").click();
        cy.wait("@delete");
        cy.wait("@api");
        cy.get(".today-num-bubble").as("bubble");
        cy.wait(10);
        cy.get("@bubble").parent().as("DayCard");
        cy.wait(10);
        cy.get("@dayCard").should("not.contain", "test event");
    });
    it("user can add event via drag of the button", () => {
        cy.login();
        cy.get(".monthly-card-today").as("dayCard");
        cy.wait(1000);
        cy.get(".monthly-top-button button").drag("@dayCard");
        cy.get("input[placeholder='Event name']").type("test event");
        cy.intercept("https://api.kalendario.app/api/create").as("add");
        cy.get(".add-button-line .button-full").click();
        cy.wait("@add");
        cy.get(".today-num-bubble").as("bubble");
        cy.get(".monthly-card-today").as("dayCard");
        cy.get("@bubble").should("contain", new Date().getDate());
        cy.wait(10);
        cy.get("@dayCard").should("contain", "test event");
        cy.get("@dayCard").find(".monthly-item").eq(0).as("event");
        cy.wait(10);
        cy.get("@event").click();
        cy.get(".detail-line").eq(0).as("eventTime");
        cy.get(".detail-line").eq(1).as("eventDuration");
        cy.get(".detail-line").eq(2).as("eventCalendar");
        cy.get("@eventTime").should("contain", new Date().getDate() + ", " + monthConv[new Date().getMonth()] + ", " + new Date().getFullYear());
        cy.get("@eventDuration").should("contain", "1h00");
        cy.get("@eventCalendar").should("contain", "Default Calendar");
        cy.get(".fa-ellipsis-h").click();
        cy.intercept("https://api.kalendario.app/api").as("api");
        cy.get(".detail-drop-delete").click();
        cy.wait("@api");
        cy.get(".monthly-card-today").as("dayCard");
        cy.wait(10);
        cy.get("@dayCard").should("not.contain", "test event");
    });
    it("user cant add incorrect events (empty, end after start, end and start at the same time)", () => {
        cy.login();
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
