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
describe("weekly general", () => {
    it("weekly number are the right ones", () => {
        login();
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
