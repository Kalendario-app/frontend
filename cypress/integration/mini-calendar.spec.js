const monthConv = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

it("mini-calendar", () => {
    cy.login();
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
    cy.addBlankEvent();
    cy.get(".fa-trash").click();
    cy.get(".last-button").click();
    cy.addBlankEvent();
    cy.get(".mini-selected > .mini-dot div").should("have.class", "mini-dot1");
    cy.addBlankEvent();
    cy.wait(1000);
    cy.get(".mini-selected > .mini-dot div + div").should("have.class", "mini-dot2");
    cy.get(".fa-trash").click();
    cy.get(".last-button").click();
});
