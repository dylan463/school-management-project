import api from './api'

const enseignantService = {
  getAll:    ()      => api.get('/enseignants').then(r => r.data),
  getById:   (id)    => api.get(`/enseignants/${id}`).then(r => r.data),
  create:    (data)  => api.post('/enseignants', data).then(r => r.data),
  update:    (id, d) => api.put(`/enseignants/${id}`, d).then(r => r.data),
  delete:    (id)    => api.delete(`/enseignants/${id}`).then(r => r.data),

  getEtudiants:  (id)          => api.get(`/enseignants/${id}/etudiants`).then(r => r.data),
  getPlanning:   (id, semaine) => api.get(`/enseignants/${id}/planning`, { params: { semaine } }).then(r => r.data),
  getRessources: (id)          => api.get(`/enseignants/${id}/ressources`).then(r => r.data),
  getEvaluations:(id)          => api.get(`/enseignants/${id}/evaluations`).then(r => r.data),
  saisirNote:    (evalId, data)=> api.post(`/evaluations/${evalId}/notes`, data).then(r => r.data),
  deposerRessource:(data)      => api.post('/ressources', data).then(r => r.data),
}

export default enseignantService