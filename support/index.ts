import type { Interception, WaitOptions } from "cypress/types/net-stubbing";

declare global {
	namespace Cypress {
		interface Chainable {
			waitOnLast<T = any>(
				alias: string,
				validate: (data: Interception<T>) => boolean,
				options?: {
					errorMessage?: string;
					requireValidation?: boolean;
					displayMessage?: string;
				} & Partial<WaitOptions>,
			): Chainable<Interception<T>>;

			waitOnLast<T = any>(
				alias: string,
				options?: {
					errorMessage?: string;
					requireValidation?: boolean;
					displayMessage?: string;
				} & Partial<WaitOptions>,
			): Chainable<Interception<T>>;
		}
	}
}
