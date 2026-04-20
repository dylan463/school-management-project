import api from './api'

const etudiantService = {
  getAll:    ()      => api.get('/etudiants').then(r => r.data),
  getById:   (id)    => api.get(`/etudiants/${id}`).then(r => r.data),
  create:    (data)  => api.post('/etudiants', data).then(r => r.data),
  update:    (id, d) => api.put(`/etudiants/${id}`, d).then(r => r.data),
  delete:    (id)    => api.delete(`/etudiants/${id}`).then(r => r.data),

  getNotes:         (id)           => api.get(`/etudiants/${id}/notes`).then(r => r.data),
  getEmploiDuTemps: (id, semestre) => api.get(`/etudiants/${id}/emploi-du-temps`, { params: { semestre } }).then(r => r.data),
  getRessources:    (id)           => api.get(`/etudiants/${id}/ressources`).then(r => r.data),
  getPointages:     (id)           => api.get(`/etudiants/${id}/pointages`).then(r => r.data),
}

export default etudiantService