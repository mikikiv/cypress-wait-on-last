import type { Interception } from "cypress/types/net-stubbing";

// Function overloads for different parameter combinations
const waitOnLast = <T = any>({
	alias,
	validate,
	options,
}: Cypress.WaitOnLastParams<T>): Cypress.Chainable<Interception<T>> => {
	// Implementation
	const {
		requireValidation = true,
		displayMessage,
		errorMessage,
		...waitOptions
	} = options || {};

	const maxAttempts = 60;

	const defaultValidate = () => true;
	const validationFn = validate || defaultValidate;

	return cy
		.wait(
			alias,
			(() => {
				const { timeout: _timeout, ...options } = waitOptions;
				return options;
			})(),
		)
		.then(() => {
			const waitTimeout =
				(waitOptions.timeout || Cypress.config("defaultCommandTimeout")) /
				maxAttempts;

			return cy
				.get(`${alias}.all`, { log: waitOptions.log ?? false })
				.then(() => {
					let attempts = 0;
					const getLastRequest = ({ log }: { log: boolean }): any => {
						return cy
							.wait(waitTimeout, {
								log: false,
							})
							.get<Interception<T>[]>(`${alias}.all`, { log })
							.then((allResponses: Interception<T>[]) => {
								const lastResponse = allResponses?.[allResponses.length - 1];
								if (!lastResponse) {
									attempts++;
									return getLastRequest({ log: waitOptions.log ?? false });
								}

								const valid = validationFn(lastResponse);

								const isValid = valid !== false;

								if (requireValidation && !isValid && attempts < maxAttempts) {
									attempts++;
									return getLastRequest({ log: waitOptions.log ?? false });
								}

								if (requireValidation && !isValid) {
									if (errorMessage) throw Error(errorMessage);
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
						log: waitOptions?.log ?? true,
					}) as unknown as Interception<T>;
				});
		});
};

// Overload for options-only usage
const waitOnLastOptions = <T = any>(
	alias: string,
	options?: Cypress.WaitOnLastOptions,
): Cypress.Chainable<Interception<T>> => {
	return waitOnLast({ alias, options });
};

// Create the final command with both overloads
const waitOnLastCommand = <T = any>(
	alias: string,
	validateOrOptions?: Cypress.WaitOnLastValidate<T> | Cypress.WaitOnLastOptions,
	options?: Cypress.WaitOnLastOptions,
): Cypress.Chainable<Interception<T>> => {
	// Allow the second parameter to be a function or options
	const isValidateFunction = typeof validateOrOptions === "function";

	if (isValidateFunction) {
		return waitOnLast({
			alias,
			validate: validateOrOptions,
			options,
		});
	} else {
		return waitOnLastOptions(alias, validateOrOptions);
	}
};

Cypress.Commands.add("waitOnLast", waitOnLastCommand as any);
