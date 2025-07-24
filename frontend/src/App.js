import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Configuration de l'API
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

function App() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [editingTask, setEditingTask] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'pending'
  });

  // Charger les tâches au démarrage
  useEffect(() => {
    fetchTasks();
  }, []);

  // Récupérer toutes les tâches
  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/api/tasks');
      
      if (response.data.success) {
        setTasks(response.data.data || []);
      } else {
        throw new Error('Failed to fetch tasks');
      }
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setError('Impossible de charger les tâches. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  // Créer une nouvelle tâche
  const createTask = async (taskData) => {
    try {
      setError(null);
      const response = await api.post('/api/tasks', taskData);
      
      if (response.data.success) {
        setTasks(prev => [...prev, response.data.data]);
        setSuccess('Tâche créée avec succès !');
        resetForm();
        setTimeout(() => setSuccess(null), 3000);
      } else {
        throw new Error('Failed to create task');
      }
    } catch (err) {
      console.error('Error creating task:', err);
      setError('Impossible de créer la tâche. Veuillez réessayer.');
    }
  };

  // Mettre à jour une tâche
  const updateTask = async (taskId, taskData) => {
    try {
      setError(null);
      const response = await api.put(`/api/tasks/${taskId}`, taskData);
      
      if (response.data.success) {
        setTasks(prev => prev.map(task => 
          task.id === taskId ? response.data.data : task
        ));
        setSuccess('Tâche mise à jour avec succès !');
        setEditingTask(null);
        setShowModal(false);
        resetForm();
        setTimeout(() => setSuccess(null), 3000);
      } else {
        throw new Error('Failed to update task');
      }
    } catch (err) {
      console.error('Error updating task:', err);
      setError('Impossible de mettre à jour la tâche. Veuillez réessayer.');
    }
  };

  // Supprimer une tâche
  const deleteTask = async (taskId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette tâche ?')) {
      return;
    }

    try {
      setError(null);
      const response = await api.delete(`/api/tasks/${taskId}`);
      
      if (response.data.success) {
        setTasks(prev => prev.filter(task => task.id !== taskId));
        setSuccess('Tâche supprimée avec succès !');
        setTimeout(() => setSuccess(null), 3000);
      } else {
        throw new Error('Failed to delete task');
      }
    } catch (err) {
      console.error('Error deleting task:', err);
      setError('Impossible de supprimer la tâche. Veuillez réessayer.');
    }
  };

  // Gérer les changements de formulaire
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Soumettre le formulaire
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      setError('Le titre est obligatoire.');
      return;
    }

    if (editingTask) {
      updateTask(editingTask.id, formData);
    } else {
      createTask(formData);
    }
  };

  // Réinitialiser le formulaire
  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      status: 'pending'
    });
  };

  // Ouvrir le modal d'édition
  const openEditModal = (task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description || '',
      status: task.status
    });
    setShowModal(true);
  };

  // Fermer le modal
  const closeModal = () => {
    setShowModal(false);
    setEditingTask(null);
    resetForm();
  };

  // Formater la date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Obtenir la classe CSS pour le statut
  const getStatusClass = (status) => {
    switch (status) {
      case 'completed':
        return 'status-completed';
      case 'in-progress':
        return 'status-in-progress';
      default:
        return 'status-pending';
    }
  };

  // Obtenir le texte du statut
  const getStatusText = (status) => {
    switch (status) {
      case 'completed':
        return 'Terminée';
      case 'in-progress':
        return 'En cours';
      default:
        return 'En attente';
    }
  };

  return (
    <div className="container">
      <header className="header">
        <h1>Todo List</h1>
        <p>Projet Fil Rouge - Architecture Cloud & DevOps</p>
      </header>

      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}

      {/* Formulaire de création */}
      <div className="todo-form">
        <h2>Ajouter une nouvelle tâche</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">Titre *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Entrez le titre de la tâche"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Entrez une description (optionnel)"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="status">Statut</label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleInputChange}
            >
              <option value="pending">En attente</option>
              <option value="in-progress">En cours</option>
              <option value="completed">Terminée</option>
            </select>
          </div>
          
          <button type="submit" className="btn">
            Ajouter la tâche
          </button>
          
          {formData.title && (
            <button type="button" className="btn btn-secondary" onClick={resetForm}>
              Réinitialiser
            </button>
          )}
        </form>
      </div>

      {/* Liste des tâches */}
      <div className="tasks-list">
        <div className="tasks-header">
          <h2>Mes tâches ({tasks.length})</h2>
        </div>
        
        {loading ? (
          <div className="loading">Chargement des tâches...</div>
        ) : tasks.length === 0 ? (
          <div className="empty-state">
            <h3>Aucune tâche trouvée</h3>
            <p>Commencez par ajouter votre première tâche !</p>
          </div>
        ) : (
          tasks.map(task => (
            <div key={task.id} className="task-item">
              <div className="task-header">
                <h3 className="task-title">{task.title}</h3>
                <span className={`task-status ${getStatusClass(task.status)}`}>
                  {getStatusText(task.status)}
                </span>
              </div>
              
              {task.description && (
                <p className="task-description">{task.description}</p>
              )}
              
              <div className="task-meta">
                <span className="task-date">
                  Créée le {formatDate(task.createdAt)}
                  {task.updatedAt !== task.createdAt && (
                    <span> • Modifiée le {formatDate(task.updatedAt)}</span>
                  )}
                </span>
                
                <div className="task-actions">
                  <button
                    className="btn btn-small"
                    onClick={() => openEditModal(task)}
                  >
                    Modifier
                  </button>
                  <button
                    className="btn btn-small btn-danger"
                    onClick={() => deleteTask(task.id)}
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal d'édition */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>Modifier la tâche</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="edit-title">Titre *</label>
                <input
                  type="text"
                  id="edit-title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="edit-description">Description</label>
                <textarea
                  id="edit-description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="edit-status">Statut</label>
                <select
                  id="edit-status"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                >
                  <option value="pending">En attente</option>
                  <option value="in-progress">En cours</option>
                  <option value="completed">Terminée</option>
                </select>
              </div>
              
              <button type="submit" className="btn">
                Mettre à jour
              </button>
              <button type="button" className="btn btn-secondary" onClick={closeModal}>
                Annuler
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
