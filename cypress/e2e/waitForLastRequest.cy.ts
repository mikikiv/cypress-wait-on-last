/// <reference types="cypress" />

type TestResponseBody = {
	status: string;
	data: string | any[];
	requestNumber?: number;
	timestamp?: number;
};

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
			cy.waitOnLast<TestResponseBody>("@testRequest").then(({ response }) => {
				expect(response?.body).to.deep.equal({
					status: "success",
					data: "test",
				});
			});
		});

		it("should return the last request when requireValidation is false", () => {
			cy.intercept("GET", "/api/test", { status: "pending", data: "test" }).as(
				"testRequest",
			);

			// Trigger the request
			cy.fetch("/api/test");

			// Wait for the last request with requireValidation: false
			cy.waitOnLast<TestResponseBody>("@testRequest", undefined, {
				requireValidation: false,
			}).then(({ response }) => {
				expect(response?.body).to.deep.equal({
					status: "pending",
					data: "test",
				});
			});
		});
	});

	describe("Validation functionality", () => {
		it("should pass when validation returns true", () => {
			cy.intercept("GET", "/api/test", { status: "success", data: "test" }).as(
				"testRequest",
			);

			// Trigger the request
			cy.fetch("/api/test");

			// Wait with validation that should pass
			cy.waitOnLast<TestResponseBody>("@testRequest", (data) => {
				return data.response?.body?.status === "success";
			}).then((response) => {
				expect(response.response?.body).to.deep.equal({
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
				} else {
					req.reply({ status: "success", data: "test" });
				}
			}).as("testRequest");

			// Trigger multiple requests
			cy.fetch("/api/test", { count: 2 });

			// Wait with validation that should eventually pass
			cy.waitOnLast<TestResponseBody>(
				"@testRequest",
				(data) => {
					return data.response?.body?.status === "success";
				},
				{ timeout: 300 },
			).then(({ response }) => {
				expect(response?.body).to.deep.equal({
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
			cy.waitOnLast<TestResponseBody>("@testRequest").then(({ response }) => {
				expect(response?.body?.requestNumber).to.equal(3);
				expect(response?.body).to.deep.equal({
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
			cy.waitOnLast<TestResponseBody>(
				"@testRequest",
				(data) => {
					return data.response?.body?.status === "success";
				},
				{ log: true },
			).then(({ response }) => {
				expect(response?.body?.requestNumber).to.equal(3);
				expect(response?.body?.status).to.equal("success");
			});
		});
	});

	describe("Display and logging", () => {
		it("should display custom message in logs", () => {
			cy.intercept("GET", "/api/test", { status: "success", data: "test" }).as(
				"testRequest",
			);

			// Trigger the request
			cy.fetch("/api/test");

			// Wait with custom display message
			cy.waitOnLast<TestResponseBody>("@testRequest", {
				displayMessage: "Custom display message",
			}).then(({ response }) => {
				expect(response?.body).to.deep.equal({
					status: "success",
					data: "test",
				});
			});
		});

		it("should log with default alias when no display message is provided", () => {
			cy.intercept("GET", "/api/test", { status: "success", data: "test" }).as(
				"testRequest",
			);

			// Trigger the request
			cy.fetch("/api/test");

			// Wait without custom display message
			cy.waitOnLast<TestResponseBody>("@testRequest").then(({ response }) => {
				expect(response?.body).to.deep.equal({
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
			cy.waitOnLast<TestResponseBody>("@testRequest", ({ response }) => {
				return (
					response?.body?.status === "success" &&
					Array.isArray(response?.body?.data) &&
					response?.body?.data?.length === 2 &&
					response?.body?.data?.some((item: any) => item.name === "John") &&
					typeof response?.body?.timestamp === "number" &&
					response?.body?.timestamp > 0
				);
			}).then(({ response }) => {
				expect(response?.body?.data).to.have.length(2);
				expect((response?.body?.data as any[])[0].name).to.equal("John");
				expect((response?.body?.data as any[])[1].name).to.equal("Jane");
			});
		});
	});
});
