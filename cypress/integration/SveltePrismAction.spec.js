import {defaults} from '../../src/actions/svelte-prism-action';

describe('svelte-prism-action', () => {

  beforeEach(() => {
    cy.viewport(1000, 600);
  });

  it('it highlights inline code', () => {
    cy.visit('/')
      .get('#test_inline')
      .should('have.class', 'language-bash');
  });

  it('it highlights block code wrapped in <pre>', () => {
    cy.visit('/')
      .get('#test_block')
      .should('have.class', 'language-html');
  });

  it('adds dataset.isHighlighted', () => {
    cy.visit('/')
      .get('#test_inline').should('have.attr', 'data-is-highlighted', 'true')
      .get('#test_block').should('have.attr', 'data-is-highlighted', 'true');
  });

  it("only highlights if in viewport", () => {
    cy.visit('/')
      .get('#test_markdown')
      .should('not.have.class', 'language-markdown')
      .should('not.have.attr', 'data-is-highlighted')
      
    cy.get('#test_markdown')
      .scrollIntoView()
      .get('#test_markdown')
      .should('have.class', 'language-markdown')
      .should('have.attr', 'data-is-highlighted');
  });

  it("include languages inside markdown", () => {
    cy.visit('/')
      .get('#test_markdown')
      .scrollIntoView();

    cy.get('#test_markdown .language-js > span')
      .should('exist')
      .should('have.class', 'token');

    cy.get('#test_markdown .language-css > span')
      .should('exist')
      .should('have.class', 'token');
  });
});