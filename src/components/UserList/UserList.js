import React from 'react';
import { deleteUser } from '../../utils/api';
import './UserList.css';

const UserList = ({ users, token, onUserDeleted }) => {
  const handleDelete = async (id) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ?")) {
      try {
        await deleteUser(id, token);
        onUserDeleted();
      } catch (err) {
        alert("Erreur lors de la suppression");
      }
    }
  };

  return (
    <div className="user-list-container">
      <h3>Liste des Utilisateurs ({users.length})</h3>
      {users.length === 0 ? (
        <p>Aucun utilisateur inscrit.</p>
      ) : (
        <ul className="user-list">
          {users.map((user) => (
            <li key={user.id} className="user-item">
              <div className="user-info">
                <strong>{user.prenom} {user.nom}</strong>
                <span>📍 {user.ville}</span>
                {token && (
                  <div className="private-info">
                    <p>📧 {user.email}</p>
                    <p>🎂 {user.date_naissance}</p>
                    <p>📮 {user.code_postal}</p>
                  </div>
                )}
              </div>
              {token && (
                <button 
                  className="delete-btn" 
                  onClick={() => handleDelete(user.id)}
                >
                  Supprimer
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default UserList;
