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
    beforeEach(() => {
      cy.intercept("GET", "/api/test", (req) => {
        req.reply({
          status: "success",
          data: "test",
        });
      }).as("testRequest");

      cy.fetch("/api/test");
    });

    it("should wait for matching request when no validation is provided", () => {
      // Wait for the last request without validation
      cy.waitOnLast<TestResponseBody>("@testRequest").then(({ response }) => {
        expect(response?.body).to.deep.equal({
          status: "success",
          data: "test",
        });
      });
    });

    it("should return the last request when requireValidation is false", () => {
      // Second request
      cy.intercept("GET", "/api/test", { status: "pending", data: "test" }).as(
        "testRequest",
      );
      cy.fetch("/api/test");

      // Wait for the last request with requireValidation: false
      cy.waitOnLast<TestResponseBody>("@testRequest", {
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
    beforeEach(() => {
      cy.intercept("GET", "/api/test", { status: "success", data: "test" }).as(
        "testRequest",
      );
      cy.fetch("/api/test");
    });

    it("should pass when validation returns true", () => {
      // Wait with validation that should pass
      cy.waitOnLast<TestResponseBody>("@testRequest", (data) => {
        return data?.response?.body?.status === "success";
      }).then((response) => {
        expect(response.response?.body).to.deep.equal({
          status: "success",
          data: "test",
        });
      });
    });

    it("accepts an empty param in the validate function", () => {
      cy.waitOnLast("@testRequest", () => {
        expect(true).to.be.true;
      }).then((data) => {
        expect(data?.response?.body).to.deep.equal({
          status: "success",
          data: "test",
        });
      });
    });

    it("should return the last request when the validation function does not return a boolean", () => {
      //@ts-expect-error
      cy.waitOnLast("@testRequest", () => {
        return { foo: "bar" };
      }).then((data) => {
        expect(data?.response?.body).to.deep.equal({
          status: "success",
          data: "test",
        });
      });
    });
  });

  describe("Multiple requests handling", () => {
    it("should retry when validation fails initially but passes later", () => {
      let callCount = 0;
      let attempt = 0;
      cy.intercept("GET", "/api/test", (req) => {
        callCount++;
        if (callCount === 1) {
          req.reply({ status: "pending", data: "test" });
        } else {
          req.reply({ status: "success", data: "test" });
        }
      }).as("testRequest");

      // Trigger multiple requests
      cy.fetch("/api/test", { count: 2, delay: 100 });

      // Wait with validation that should eventually pass
      cy.waitOnLast<TestResponseBody>(
        "@testRequest",
        (data) => {
          attempt++;
          return data?.response?.body?.status === "success";
        },
        { timeout: 300 },
      ).then(({ response }) => {
        expect(response?.body).to.deep.equal({
          status: "success",
          data: "test",
        });
        // more than 1 request was made
        expect(callCount).to.be.greaterThan(1);
        // more than 1 attempt to validate
        expect(attempt).to.be.gt(1);
      });
    });

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
      cy.fetch("/api/test", { count: 3, delay: 300 });

      // Wait with validation that should pass on the last request
      cy.waitOnLast<TestResponseBody>(
        "@testRequest",
        (data) => {
          return data?.response?.body?.status === "success";
        },
        { log: true },
      ).then(({ response }) => {
        expect(response?.body?.requestNumber).to.equal(3);
        expect(response?.body?.status).to.equal("success");
      });
    });
  });

  describe("Display and logging", () => {
    beforeEach(() => {
      cy.intercept("GET", "/api/test", { status: "success", data: "test" }).as(
        "testRequest",
      );

      // Trigger the request
      cy.fetch("/api/test");
    });

    it("should display custom message in logs", () => {
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
      cy.waitOnLast<TestResponseBody>("@testRequest", (data) => {
        const response = data?.response;
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

    it("should handle large numbers of requests efficiently", () => {
      cy.intercept("GET", "/api/test", { status: "success", data: "test" }).as(
        "testRequest",
      );
      cy.fetch("/api/test", { count: 100, delay: 5 });

      const startTime = Date.now();
      cy.waitOnLast("@testRequest", () => {
        expect(true).to.be.true;
      }).then(({ response }) => {
        const elapsed = Date.now() - startTime;
        expect(elapsed).to.be.lessThan(1500); // Should complete quickly
        expect(response?.body?.status).to.equal("success");
      });
    });
  });
});
