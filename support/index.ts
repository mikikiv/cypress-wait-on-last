import type { Interception, WaitOptions } from "cypress/types/net-stubbing";

declare global {
	namespace Cypress {
		interface WaitOnLastOptions extends Partial<WaitOptions> {
			errorMessage?: string;
			requireValidation?: boolean;
			displayMessage?: string;
		}

		type WaitOnLastValidate<T> = (
			data?: Interception<T>,
			// biome-ignore lint/suspicious/noConfusingVoidType: Chai returns void
		) => boolean | void;

		interface WaitOnLastParams<T> {
			alias: string;
			validate?: WaitOnLastValidate<T>;
			options?: WaitOnLastOptions;
		}

		interface Chainable {
			waitOnLast<T = any>(
				alias: string,
				validate?: (
					data?: Nullable<Interception<T>>,
					// biome-ignore lint/suspicious/noConfusingVoidType: Chai assertions return void
				) => boolean | void,
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
