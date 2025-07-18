"use strict";
/// <reference types="cypress" />
describe("waitOnLast Command", () => {
    beforeEach(() => {
        cy.visit("cypress/fixtures/blank.html");
    });
    describe("Basic functionality - waiting for requests without validation", () => {
        it("should wait for matching request when no validation is provided", () => {
            cy.intercept("GET", "/api/test", {
                status: "success",
                data: "test",
            }).as("testRequest");
            cy.fetch("/api/test");
            // Wait for the last request without validation
            cy.waitOnLast("@testRequest").then(({ response }) => {
                expect(response === null || response === void 0 ? void 0 : response.body).to.deep.equal({
                    status: "success",
                    data: "test",
                });
            });
        });
        it("should return the last request when requireValidation is false", () => {
            cy.intercept("GET", "/api/test", { status: "pending", data: "test" }).as("testRequest");
            // Trigger the request
            cy.fetch("/api/test");
            // Wait for the last request with requireValidation: false
            cy.waitOnLast("@testRequest", {
                requireValidation: false,
            }).then(({ response }) => {
                expect(response === null || response === void 0 ? void 0 : response.body).to.deep.equal({
                    status: "pending",
                    data: "test",
                });
            });
        });
    });
    describe("Validation functionality", () => {
        it("should pass when validation returns true", () => {
            cy.intercept("GET", "/api/test", { status: "success", data: "test" }).as("testRequest");
            // Trigger the request
            cy.fetch("/api/test");
            // Wait with validation that should pass
            cy.waitOnLast("@testRequest", (data) => {
                var _a, _b;
                return ((_b = (_a = data.response) === null || _a === void 0 ? void 0 : _a.body) === null || _b === void 0 ? void 0 : _b.status) === "success";
            }).then((response) => {
                var _a;
                expect((_a = response.response) === null || _a === void 0 ? void 0 : _a.body).to.deep.equal({
                    status: "success",
                    data: "test",
                });
            });
        });
        it("should retry when validation fails initially but passes later", () => {
            let callCount = 0;
            cy.intercept("GET", "/api/test", (req) => {
                callCount++;
                if (callCount === 1) {
                    req.reply({ status: "pending", data: "test" });
                }
                else {
                    req.reply({ status: "success", data: "test" });
                }
            }).as("testRequest");
            // Trigger multiple requests
            cy.fetch("/api/test", { count: 2 });
            // Wait with validation that should eventually pass
            cy.waitOnLast("@testRequest", (data) => {
                var _a, _b;
                return ((_b = (_a = data.response) === null || _a === void 0 ? void 0 : _a.body) === null || _b === void 0 ? void 0 : _b.status) === "success";
            }, { timeout: 300 }).then(({ response }) => {
                expect(response === null || response === void 0 ? void 0 : response.body).to.deep.equal({
                    status: "success",
                    data: "test",
                });
                expect(callCount).to.be.greaterThan(1);
            });
        });
    });
    describe("Multiple requests handling", () => {
        it("should return the last request when multiple requests are made", () => {
            let callCount = 0;
            cy.intercept("GET", "/api/test", (req) => {
                callCount++;
                req.reply({
                    status: "success",
                    data: "test",
                    requestNumber: callCount,
                });
            }).as("testRequest");
            // Trigger multiple requests
            cy.fetch("/api/test", { count: 3 });
            // Wait for the last request
            cy.waitOnLast("@testRequest").then(({ response }) => {
                var _a;
                expect((_a = response === null || response === void 0 ? void 0 : response.body) === null || _a === void 0 ? void 0 : _a.requestNumber).to.equal(3);
                expect(response === null || response === void 0 ? void 0 : response.body).to.deep.equal({
                    status: "success",
                    data: "test",
                    requestNumber: 3,
                });
            });
        });
        it("should validate against requests made after waitOnLast is called", () => {
            let callCount = 0;
            cy.intercept("GET", "/api/test", (req) => {
                callCount++;
                req.reply({
                    status: callCount >= 3 ? "success" : "pending",
                    data: "test",
                    requestNumber: callCount,
                });
            }).as("testRequest");
            // These requests delay so that they are made after the waitOnLast call
            cy.fetch("/api/test", { count: 3, delay: 500 });
            // Wait with validation that should pass on the last request
            cy.waitOnLast("@testRequest", (data) => {
                var _a, _b;
                return ((_b = (_a = data.response) === null || _a === void 0 ? void 0 : _a.body) === null || _b === void 0 ? void 0 : _b.status) === "success";
            }, { log: true }).then(({ response }) => {
                var _a, _b;
                expect((_a = response === null || response === void 0 ? void 0 : response.body) === null || _a === void 0 ? void 0 : _a.requestNumber).to.equal(3);
                expect((_b = response === null || response === void 0 ? void 0 : response.body) === null || _b === void 0 ? void 0 : _b.status).to.equal("success");
            });
        });
    });
    describe("Display and logging", () => {
        it("should display custom message in logs", () => {
            cy.intercept("GET", "/api/test", { status: "success", data: "test" }).as("testRequest");
            // Trigger the request
            cy.fetch("/api/test");
            // Wait with custom display message
            cy.waitOnLast("@testRequest", {
                displayMessage: "Custom display message",
            }).then(({ response }) => {
                expect(response === null || response === void 0 ? void 0 : response.body).to.deep.equal({
                    status: "success",
                    data: "test",
                });
            });
        });
        it("should log with default alias when no display message is provided", () => {
            cy.intercept("GET", "/api/test", { status: "success", data: "test" }).as("testRequest");
            // Trigger the request
            cy.fetch("/api/test");
            // Wait without custom display message
            cy.waitOnLast("@testRequest").then(({ response }) => {
                expect(response === null || response === void 0 ? void 0 : response.body).to.deep.equal({
                    status: "success",
                    data: "test",
                });
            });
        });
    });
    describe("Edge cases", () => {
        it("should work with complex validation functions", () => {
            cy.intercept("GET", "/api/test", {
                status: "success",
                data: [
                    { id: 1, name: "John" },
                    { id: 2, name: "Jane" },
                ],
                timestamp: Date.now(),
            }).as("testRequest");
            // Trigger the request
            cy.fetch("/api/test", { count: 2 });
            // Wait with complex validation
            cy.waitOnLast("@testRequest", ({ response }) => {
                var _a, _b, _c, _d, _e, _f, _g, _h;
                return (((_a = response === null || response === void 0 ? void 0 : response.body) === null || _a === void 0 ? void 0 : _a.status) === "success" &&
                    Array.isArray((_b = response === null || response === void 0 ? void 0 : response.body) === null || _b === void 0 ? void 0 : _b.data) &&
                    ((_d = (_c = response === null || response === void 0 ? void 0 : response.body) === null || _c === void 0 ? void 0 : _c.data) === null || _d === void 0 ? void 0 : _d.length) === 2 &&
                    ((_f = (_e = response === null || response === void 0 ? void 0 : response.body) === null || _e === void 0 ? void 0 : _e.data) === null || _f === void 0 ? void 0 : _f.some((item) => item.name === "John")) &&
                    typeof ((_g = response === null || response === void 0 ? void 0 : response.body) === null || _g === void 0 ? void 0 : _g.timestamp) === "number" &&
                    ((_h = response === null || response === void 0 ? void 0 : response.body) === null || _h === void 0 ? void 0 : _h.timestamp) > 0);
            }).then(({ response }) => {
                var _a, _b, _c;
                expect((_a = response === null || response === void 0 ? void 0 : response.body) === null || _a === void 0 ? void 0 : _a.data).to.have.length(2);
                expect(((_b = response === null || response === void 0 ? void 0 : response.body) === null || _b === void 0 ? void 0 : _b.data)[0].name).to.equal("John");
                expect(((_c = response === null || response === void 0 ? void 0 : response.body) === null || _c === void 0 ? void 0 : _c.data)[1].name).to.equal("Jane");
            });
        });
    });
});
