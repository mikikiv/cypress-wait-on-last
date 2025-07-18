import "./commands";

declare global {
	namespace Cypress {
		interface Chainable {
			fetch(
				url: string,
				options?: { count?: number; delay?: number },
			): Chainable<void>;
		}
	}
}
