import "./commands";
import type { Interception, WaitOptions } from "cypress/types/net-stubbing";

declare global {
	namespace Cypress {
		interface Chainable {
			fetch(
				url: string,
				options?: { count?: number; delay?: number },
			): Chainable<void>;
			waitOnLast<T = any>(
				alias: string,
				validate?: (data: Interception<T>) => boolean,
				options?: {
					errorMessage?: string;
					requireValidation?: boolean;
					displayMessage?: string;
				} & Partial<WaitOptions>,
			): Chainable<Interception<T>>;
		}
	}
}
