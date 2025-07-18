import type { WaitOptions } from "cypress/types/net-stubbing";
import "./commands";
declare global {
    namespace Cypress {
        interface Chainable {
            waitOnLast<T>(alias: string, validate?: (data: T) => boolean, options?: Partial<WaitOptions> & {
                requireValidation?: boolean;
                displayMessage?: string;
                errorMessage?: string;
            }): Chainable<T>;
        }
    }
}
