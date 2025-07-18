"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("../../support/index");
require("../../support/commands");
Cypress.Commands.add("fetch", (url, options = { count: 1, delay: 30 }) => {
    cy.window().then((win) => {
        Cypress._.times((options === null || options === void 0 ? void 0 : options.count) || 1, (index) => {
            setTimeout(() => win.fetch(url), ((options === null || options === void 0 ? void 0 : options.delay) || 30) * index);
        });
    });
});
