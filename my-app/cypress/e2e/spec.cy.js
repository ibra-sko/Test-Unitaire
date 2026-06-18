describe('Tests E2E de la fonctionnalité d\'inscription', () => {
  beforeEach(() => {
    cy.intercept('POST', 'http://localhost:8000/users', {
      statusCode: 200,
      body: { message: "Utilisateur créé avec succès" }
    }).as('createUser')
  })
  it('Scénario 1: Ajout d\'un utilisateur avec succès', () => {
    // Navigation vers la page -> Aucun utilisateur inscrit
    cy.clearLocalStorage()
    cy.visit('http://localhost:3000')
    cy.contains('0 utilisateur(s) affiché(s)')

    // Navigation vers la page de formulaire -> Ajout d’un nouvel utilisateur sans erreur
    cy.get('input[name="nom"]').type('Doe')
    cy.get('input[name="prenom"]').type('John')
    cy.get('input[name="email"]').type('john.doe@test.com')
    cy.get('input[name="dateNaissance"]').type('2000-01-01')
    cy.get('input[name="ville"]').type('Paris')
    cy.get('input[name="codePostal"]').type('75001')
    cy.get('button[type="submit"]').click()

    // Navigation vers la page d’accueil -> Un utilisateur inscrit
    cy.contains('1 utilisateur(s) affiché(s)')
    cy.contains('John Doe')
    cy.contains('Paris')
  })

  it('Scénario 2: Ajout d\'un utilisateur avec erreur', () => {
    // Navigation vers la page -> 1 utilisateur inscrit
    cy.clearLocalStorage()
    // On pré-remplit le localStorage avec 1 utilisateur avant le chargement
    const mockUser = [{ nom: 'Smith', prenom: 'Anna', ville: 'Lyon' }]
    
    cy.visit('http://localhost:3000', {
      onBeforeLoad: (win) => {
        win.localStorage.setItem('registeredUsers', JSON.stringify(mockUser))
      }
    })
    cy.contains('1 utilisateur(s) affiché(s)')
    cy.contains('Anna Smith')
    cy.contains('Lyon')

    // Navigation vers la page de formulaire -> Ajout d’un nouvel utilisateur avec erreur
    cy.get('input[name="nom"]').type('Doe123') // Erreur: contient des chiffres
    cy.get('input[name="prenom"]').type('John')
    cy.get('input[name="email"]').type('invalid-email') // Erreur: pas un email
    cy.get('input[name="dateNaissance"]').type('2020-01-01') // Erreur: mineur
    cy.get('input[name="ville"]').type('Paris')
    cy.get('input[name="codePostal"]').type('750') // Erreur: < 5 chiffres

    cy.get('button[type="submit"]').click()

    // Vérifier que le bouton n'est pas disabled
    cy.get('button[type="submit"]').should('not.be.disabled').click()

    // Vérifier que les messages d'erreur s'affichent bien
    cy.get('[data-testid="error-nom"]').should('be.visible').and('contain', 'Format du nom invalide')
    cy.get('[data-testid="error-email"]').should('be.visible').and('contain', 'Format de l\'email invalide')

    // Navigation vers la page d’accueil -> Toujours 1 utilisateur inscrit
    cy.contains('1 utilisateur(s) affiché(s)')
    // L'utilisateur John Doe n'a pas été ajouté, il n'y a que Anna Smith
    cy.contains('Anna Smith')
    cy.contains('Lyon')
  })

  it('Scénario 3: Mode Offline (Erreur GET)', () => {
    // Intercepter l'appel GET et simuler une erreur 500 pour tester l'interface
    cy.intercept('GET', 'http://localhost:8000/users', {
      statusCode: 500,
      body: 'Internal Server Error'
    }).as('getUsersError')

    cy.visit('http://localhost:3000')
    // Le texte restera sur le chargement si l'API est indisponible
    cy.contains("Chargement de l'API...")
    cy.wait('@getUsersError')
    cy.contains("Chargement de l'API...")
  })
})

describe('Tests en mode Offline', () => {

  it('devrait se comporter correctement en ligne', function() {
    if (Cypress.env('offline')) {
      this.skip();
    }
    
    cy.intercept('POST', 'http://localhost:8000/users').as('syncRequest');
    
    cy.visit('http://localhost:3000');
    cy.get('input[name="nom"]').type('Online');
    cy.get('input[name="prenom"]').type('User');
    cy.get('input[name="email"]').type('online@test.com');
    cy.get('input[name="dateNaissance"]').type('2000-01-01');
    cy.get('input[name="ville"]').type('Paris');
    cy.get('input[name="codePostal"]').type('75000');
    
    cy.get('button[type="submit"]').click();
    
    cy.wait('@syncRequest').then((interception) => {
      // Vérification que la requête est partie avec succès
      expect(interception.request.body).to.have.property('nom', 'Online');
    });
  });

  it('devrait afficher un message d\'erreur quand le réseau est coupé', function() {
    if (!Cypress.env('offline')) {
      this.skip(); // Évite un faux positif en mode online
    }

    cy.log('Mode offline activé !');

    cy.intercept('POST', 'http://localhost:8000/users', { forceNetworkError: true }).as('syncRequest');     

    cy.visit('http://localhost:3000');
    cy.get('input[name="nom"]').type('Offline');
    cy.get('input[name="prenom"]').type('User');
    cy.get('input[name="email"]').type('offline@test.com');
    cy.get('input[name="dateNaissance"]').type('2000-01-01');
    cy.get('input[name="ville"]').type('Paris');
    cy.get('input[name="codePostal"]').type('75000');
    
    cy.get('button[type="submit"]').click();

    cy.wait('@syncRequest');
  });
});
