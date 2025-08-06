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
// Function overloads for different parameter combinations
const waitOnLast = ({ alias, validate, options, }) => {
    // Implementation
    const _a = options || {}, { requireValidation = true, displayMessage, errorMessage } = _a, waitOptions = __rest(_a, ["requireValidation", "displayMessage", "errorMessage"]);
    const maxAttempts = 60;
    const defaultValidate = () => true;
    const validationFn = validate || defaultValidate;
    return cy
        .wait(alias, (() => {
        const { timeout: _timeout } = waitOptions, options = __rest(waitOptions, ["timeout"]);
        return options;
    })())
        .then(() => {
        var _a;
        const waitTimeout = (waitOptions.timeout || Cypress.config("defaultCommandTimeout")) /
            maxAttempts;
        return cy
            .get(`${alias}.all`, { log: (_a = waitOptions.log) !== null && _a !== void 0 ? _a : false })
            .then(() => {
            var _a;
            let attempts = 0;
            const getLastRequest = ({ log }) => {
                return cy
                    .wait(waitTimeout, {
                    log: false,
                })
                    .get(`${alias}.all`, { log })
                    .then((allResponses) => {
                    var _a, _b;
                    const lastResponse = allResponses === null || allResponses === void 0 ? void 0 : allResponses[allResponses.length - 1];
                    if (!lastResponse) {
                        attempts++;
                        return getLastRequest({ log: (_a = waitOptions.log) !== null && _a !== void 0 ? _a : false });
                    }
                    const valid = validationFn(lastResponse);
                    const isValid = valid !== false;
                    if (requireValidation && !isValid && attempts < maxAttempts) {
                        attempts++;
                        return getLastRequest({ log: (_b = waitOptions.log) !== null && _b !== void 0 ? _b : false });
                    }
                    if (requireValidation && !isValid) {
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
                                validate: validationFn,
                                displayMessage,
                                requireValidation,
                                command: "waitOnLast",
                            };
                        },
                    });
                    return lastResponse;
                });
            };
            return getLastRequest({
                log: (_a = waitOptions === null || waitOptions === void 0 ? void 0 : waitOptions.log) !== null && _a !== void 0 ? _a : true,
            });
        });
    });
};
// Create the final command with both overloads
function waitOnLastCommand(alias, validateOrOptions, options) {
    // Allow the second parameter to be a function or options
    const isValidateFunction = typeof validateOrOptions === "function";
    if (isValidateFunction) {
        return waitOnLast({
            alias,
            validate: validateOrOptions,
            options,
        });
    }
    else {
        return waitOnLast({
            alias,
            options: validateOrOptions,
        });
    }
}
Cypress.Commands.add("waitOnLast", waitOnLastCommand);
