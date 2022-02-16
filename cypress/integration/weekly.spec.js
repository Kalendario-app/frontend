describe("weekly general", () => {
    it("weekly number are the right ones", () => {
        cy.login();
        cy.get(".cal-type-switch-in").select("weekly");
        let nbr = new Date().getDay() - 1;
        if (nbr === -1) {
            nbr = 6;
        }
        cy.get(".weekly-cell h3")
            .eq(nbr)
            .should("contain", new Date().getDate() + "");
    });
});
