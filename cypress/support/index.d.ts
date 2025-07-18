import "./commands";
import type { Interception, WaitOptions } from "cypress/types/net-stubbing";
import "../../support";

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
