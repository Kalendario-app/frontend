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

const monthConv = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

it("mini-calendar", () => {
    login();
    cy.get(".mini-selected").should("contain", new Date().getDate());
    cy.get(".mini-top > :nth-child(1)").should("contain", monthConv[new Date().getMonth()] + " " + new Date().getFullYear());
    cy.get(".mini-nav-next").click();
    cy.get(".mini-top > :nth-child(1)").should(
        "contain",
        monthConv[new Date(new Date().setMonth(new Date().getMonth() + 1)).getMonth()] + " " + new Date(new Date().setMonth(new Date().getMonth() + 1)).getFullYear()
    );
    cy.get(".mini-nav-prev").click();
    cy.get(".mini-nav-prev").click();
    cy.get(".mini-top > :nth-child(1)").should(
        "contain",
        monthConv[new Date(new Date().setMonth(new Date().getMonth() - 1)).getMonth()] + " " + new Date(new Date().setMonth(new Date().getMonth() - 1)).getFullYear()
    );
    cy.get(".mini-nav-next").click();
    addBlankEvent();
    cy.get(".fa-trash").click();
    cy.get(".last-button").click();
    addBlankEvent();
    cy.get(".mini-selected > .mini-dot div").should("have.class", "mini-dot1");
    addBlankEvent();
    cy.wait(1000);
    cy.get(".mini-selected > .mini-dot div + div").should("have.class", "mini-dot2");
    cy.get(".fa-trash").click();
    cy.get(".last-button").click();
});
