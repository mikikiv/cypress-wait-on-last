import "../../support/index";
import "../../support/commands";

Cypress.Commands.add(
	"fetch",
	(
		url: string,
		options: { count?: number; delay?: number } = { count: 1, delay: 30 },
	) => {
		cy.window().then((win) => {
			Cypress._.times(options?.count || 1, (index) => {
				setTimeout(() => win.fetch(url), (options?.delay || 30) * index);
			});
		});
	},
);
