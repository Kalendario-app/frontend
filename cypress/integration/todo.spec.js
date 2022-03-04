it("todo work", () => {
    cy.login(true);
    cy.get(".todo-container > .calendar-select-top > #calendar-add").click();
    cy.get(".input-open").type("test");
    cy.get(".input-open").type("{enter}");
    cy.get(".input-open").type("{esc}");
    cy.get(".todo-item").each(($el) => {
        cy.wait(500);
        cy.get(".todo-item").eq(0).click();
    });
    /*cy.get(".todo-list").then(($list) => {
        if ($list.find(".todo-item").length !== 0) {
            cy.get(".todo-item").eq(0).click();
        }
    });*/
    cy.get(".todo-container > .calendar-select-top > #calendar-add").click();
    cy.get(".input-open").type("test");
    cy.get(".input-open").type("{enter}");
    cy.get(".input-open").type("{esc}");
    cy.get(".todo-list").should("contain", "test");
});
