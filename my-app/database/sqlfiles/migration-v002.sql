USE ynov_ci;

-- On insère dans la bonne table 'utilisateurs' qui vient de la première migration
INSERT INTO utilisateurs (nom, prenom, email, date_naissance, ville, code_postal) 
VALUES 
('Doe', 'John', 'john.doe@example.com', '1990-01-01', 'Paris', '75000'),
('Doe', 'Jane', 'jane.doe@example.com', '1992-05-10', 'Lyon', '69000');
