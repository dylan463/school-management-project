import api from './api'

const enseignantService = {
  getTeachers: async function (filters = {}) {
    const params = new URLSearchParams(filters);
    const response = await api.get(`/structures/teachers/?${params.toString()}`);
    return response.data;
  },
  createTeacher: async function (role,email){
    const data = {role,email}
    const response = await api.post('/structures/teachers/',data)
    return response.data;
  },
  updateTeacher: async function (id, data) {
    const response = await api.patch(`/structures/teachers/${id}/`, data)
    return response.data;
  },
  deleteTeacher: async function (id) {
    const response = await api.delete(`/structures/teachers/${id}/`)
    return response.data;
  },
  mySchedules: async function () {
    const response = await api.get('/timetable/teacher/my_schedules/');
    return response.data;
  }
}

export default enseignantService