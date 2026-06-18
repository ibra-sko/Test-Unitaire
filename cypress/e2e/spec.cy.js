describe('Tests E2E - Projet 2', () => {
  beforeEach(() => {
    // Intercepter l'appel GET utilisateurs pour le public
    cy.intercept('GET', 'http://localhost:8000/users', {
      statusCode: 200,
      body: { 
        utilisateurs: [
          { id: 1, nom: "Smith", prenom: "Anna", ville: "Lyon" }
        ] 
      }
    }).as('getUsersPublic')

    cy.intercept('POST', 'http://localhost:8000/users', {
      statusCode: 200,
      body: { message: "Utilisateur créé avec succès" }
    }).as('createUser')
  })

  it('Scénario 1: Ajout d\'un utilisateur et affichage public', () => {
    cy.clearLocalStorage()
    cy.visit('http://localhost:3000')
    cy.wait('@getUsersPublic')

    cy.contains('Liste des Utilisateurs (1)')
    cy.contains('Anna Smith')
    cy.contains('Lyon')
    // Vérifier que les infos privées ne sont pas affichées
    cy.get('.private-info').should('not.exist')
    cy.get('.delete-btn').should('not.exist')

    // Ajout d’un nouvel utilisateur
    cy.get('input[name="nom"]').type('Doe')
    cy.get('input[name="prenom"]').type('John')
    cy.get('input[name="email"]').type('john.doe@test.com')
    cy.get('input[name="dateNaissance"]').type('2000-01-01')
    cy.get('input[name="ville"]').type('Paris')
    cy.get('input[name="codePostal"]').type('75001')
    cy.get('[data-testid="submit-btn"]').click()

    cy.wait('@createUser')
    // Après ajout, App.js recharge les utilisateurs
    cy.wait('@getUsersPublic')
  })

  it('Scénario 2: Connexion Admin, affichage privé et suppression', () => {
    cy.clearLocalStorage()
    
    // Intercepter le login
    cy.intercept('POST', 'http://localhost:8000/login', {
      statusCode: 200,
      body: { access_token: "fake-jwt-token", token_type: "bearer" }
    }).as('loginAdmin')

    // Intercepter le GET avec token admin
    cy.intercept('GET', 'http://localhost:8000/users', (req) => {
      if (req.headers.authorization === 'Bearer fake-jwt-token') {
        req.reply({
          statusCode: 200,
          body: { 
            utilisateurs: [
              { id: 1, nom: "Smith", prenom: "Anna", ville: "Lyon", email: "anna@test.com", date_naissance: "1990-01-01", code_postal: "69001" }
            ] 
          }
        })
      } else {
        req.reply({
          statusCode: 200,
          body: { utilisateurs: [{ id: 1, nom: "Smith", prenom: "Anna", ville: "Lyon" }] }
        })
      }
    }).as('getUsersAdmin')

    // Intercepter DELETE
    cy.intercept('DELETE', 'http://localhost:8000/users/1', {
      statusCode: 200,
      body: { message: "Utilisateur supprimé" }
    }).as('deleteUser')

    cy.visit('http://localhost:3000')

    // Connexion
    cy.get('input[type="email"][placeholder="Email Admin"]').type('loise.fenoll@ynov.com')
    cy.get('input[type="password"][placeholder="Mot de passe"]').type('PvdrTAzTeR247sDnAZBr')
    cy.get('button').contains('Connexion').click()

    cy.wait('@loginAdmin')
    cy.wait('@getUsersAdmin')

    // L'interface passe en mode admin
    cy.contains('Mode Administrateur activé')
    
    // Les infos privées sont maintenant visibles
    cy.get('.private-info').should('be.visible')
    cy.contains('anna@test.com')
    cy.contains('1990-01-01')

    // Suppression (On bypass le window.confirm)
    cy.on('window:confirm', () => true);
    cy.get('.delete-btn').click()

    cy.wait('@deleteUser')
  })
})
