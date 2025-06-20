# cypress-wait-on-last

Wait for the last matched aliased interception. Allows validation of the alias's content with an optional validation function. Continuously rechecks the newest matching aliased cypress interception and only returns when it is considered valid. Useful for when an unknown number of requests are expected, or race condition issues are present.

## Installation

```bash
npm install cypress-wait-on-last
```

## Setup

In your `cypress/support/e2e.js`:

```javascript
import "cypress-wait-on-last";
```

## Usage

The `waitOnLast` command waits for a network request and optionally validates its response data before proceeding.

### Basic Usage - Wait for Last Request

```javascript
// Intercept a request
cy.intercept("GET", "/api/data").as("getData");

// Wait for the last request (no validation)
cy.waitOnLast("@getData");
```

### Basic Usage - Wait with Validation

```javascript
// Intercept a request
cy.intercept("GET", "/api/data").as("getData");

// Wait for the request and validate the response
cy.waitOnLast("@getData", (data) => {
  return (
    data.response?.body?.status === "success" &&
    data.response?.body?.items.length > 0
  );
});
```

### Advanced Usage

```javascript
cy.intercept("POST", "/api/submit").as("submitForm");

cy.waitOnLast(
  "@submitForm",
  (data) => {
    return (
      data.response?.body?.status === "completed" &&
      data.response?.body?.id !== undefined
    );
  },
  {
    requireValidation: true, // true is default
    displayMessage: "Waiting for form submission to complete",
    errorMessage: "Form submission failed to complete",
    timeout: 10000,
  }
);
```

## API

### `cy.waitOnLast(alias, validate?, options?)`

#### Parameters

- **alias** (string): The alias of the intercepted request
- **validate** (function, optional): A function that takes the response data and returns a boolean. If omitted, simply waits for the last request without validation.
- **options** (object, optional): Configuration options

#### Command Configuration Options

- **requireValidation** (boolean, default: true): Whether to require validation to pass. When false returns the last matching alias object ignoring validation.
- **displayMessage** (string, optional): Custom message to display in Cypress logs
- **errorMessage** (string, optional): Custom error message when validation fails
- **timeout** (number, optional): Custom timeout for each attempt (defaults to `Cypress.config("defaultCommandTimeout") / 60`)

#### Returns

Returns the most recent response data. When requireValidation is true (default), returns the most recent response if it is valid.

## Examples

### Waiting for Last Request (No Validation)

```javascript
cy.intercept("GET", "/api/users").as("getUsers");

// Simply wait for the latest matching request to complete
cy.waitOnLast("@getUsers");
```

### Waiting for API Response with Specific Data

```javascript
cy.intercept("GET", "/api/users").as("getUsers");

cy.waitOnLast("@getUsers", (data) => {
  return (
    data.response?.body?.users &&
    data.response?.body?.users.some((user) => user.name === "John Doe")
  );
});
```

### Waiting for Status Change

```javascript
cy.intercept("GET", "/api/job/*/status").as("getJobStatus");

cy.waitOnLast(
  "@getJobStatus",
  (data) => {
    return data.response?.body?.status === "completed";
  },
  {
    timeout: 15000,
    displayMessage: "Job status is completed",
    errorMessage: "Final request was not 'completed'",
  }
);
```

### Handling Complex Validation

```javascript
cy.intercept("POST", "/api/process").as("processData");

cy.waitOnLast(
  "@processData",
  (data) => {
    return (
      data.response?.body?.result &&
      data.response?.body?.result.progress === 100 &&
      data.response?.body?.result.errors.length === 0
    );
  },
  {
    errorMessage: "Data processing failed or has errors",
  }
);
```

### Waiting for Multiple Requests

```javascript
cy.intercept("GET", "/api/data").as("getData");

// Trigger multiple requests
cy.visit("/page");
cy.get('[data-testid="refresh"]').click();
cy.get('[data-testid="refresh"]').click();

// Wait for the last request to complete
cy.waitOnLast("@getData").then((response) => {
  // Work with the most recent response
  console.log("Latest data:", response);
});
```

## TypeScript Support

This plugin includes full TypeScript support with type definitions:

```typescript
interface ExampleApiResponse {
  status: string;
  customField: string;
  data: any[];
  timestamp: number;
}

// With validation
// ExampleApiResponse type is passed to the Cypress interception.response.body
// returnType: Interception<T>, the same type as used in the validation function.
cy.waitOnLast<ExampleApiResponse>("@apiCall", ({ response }) => {
  return (
    response?.body?.status === "success" &&
    response?.body?.data.length > 0 &&
    response?.body?.customField !== undefined
  );
}).then(({ response }) => {
  expect(response).to.not.be.undefined;
  cy.get(".element").should("have.length", response?.body?.data.length);
});

// Without validation
cy.waitOnLast<ExampleApiResponse>("@apiCall").then((data) => {
  console.log(data);
});
```

## License

MIT
