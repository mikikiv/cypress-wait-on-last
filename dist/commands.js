"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
Cypress.Commands.add("waitOnLast", (alias, validate = () => true, _a = {}) => {
    var { requireValidation = true, displayMessage, errorMessage } = _a, options = __rest(_a, ["requireValidation", "displayMessage", "errorMessage"]);
    const maxAttempts = 60;
    cy.wait(alias, (() => {
        const { timeout: _timeout } = options, waitOptions = __rest(options, ["timeout"]);
        return waitOptions;
    })()).then(() => {
        return cy.get(`${alias}.all`, { log: false }).then(() => {
            var _a;
            let attempts = 0;
            const getLastRequest = ({ log }) => {
                return cy
                    .wait((options === null || options === void 0 ? void 0 : options.timeout) ||
                    Cypress.config("defaultCommandTimeout") / maxAttempts, {
                    log: false,
                })
                    .get(`${alias}.all`, { log })
                    .then((allResponses) => {
                    const lastResponse = allResponses === null || allResponses === void 0 ? void 0 : allResponses[allResponses.length - 1];
                    if (!lastResponse) {
                        attempts++;
                        return getLastRequest({ log: false });
                    }
                    const valid = validate(lastResponse);
                    if (requireValidation && !valid && attempts < maxAttempts) {
                        attempts++;
                        return getLastRequest({ log: false });
                    }
                    if (requireValidation && !valid) {
                        if (errorMessage)
                            throw Error(errorMessage);
                        throw new Error(`Validation failed for alias "${alias}"`);
                    }
                    Cypress.log({
                        type: "parent",
                        displayName: `waitOnLast`,
                        message: displayMessage ? displayMessage : alias,
                        consoleProps() {
                            return {
                                yielded: lastResponse,
                                validate,
                                displayMessage,
                                requireValidation,
                                command: "waitOnLast",
                            };
                        },
                    });
                    return lastResponse;
                });
            };
            return getLastRequest({ log: (_a = options === null || options === void 0 ? void 0 : options.log) !== null && _a !== void 0 ? _a : true });
        });
    });
});
