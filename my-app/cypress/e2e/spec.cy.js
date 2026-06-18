describe('Home page spec', () => {
  it('deployed react app to localhost', () => {
    // 1. Vider le localstorage
    cy.clearLocalStorage()

    cy.visit('http://localhost:3000')

    // 2. Créer un unique user via le formulaire
    cy.get('input[name="nom"]').type('Doe')
    cy.get('input[name="prenom"]').type('John')
    cy.get('input[name="email"]').type('john.doe@test.com')
    cy.get('input[name="dateNaissance"]').type('2000-01-01')
    cy.get('input[name="ville"]').type('Paris')
    cy.get('input[name="codePostal"]').type('75001')
    cy.get('button[type="submit"]').click()

    // 3. Valider l’affichage
    cy.contains('1 user(s) already registered')
  })
})
