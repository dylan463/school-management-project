import api from './api'

const etudiantService = {
  getStudents: async function (filters = {}) {
    const params = new URLSearchParams(filters);
    const response = await api.get(`/structures/students/?${params.toString()}`);
    return response.data;
  },
  createStudent: async function (params){
    const response = await api.post('/structures/students/',params)
    return response.data;
  },
  getStudent: async function (id) {
    const response = await api.get(`/structures/students/${id}`);
    return response.data;
  },
  updateStudent: async function (id, data) {
    const response = await api.patch(`/structures/students/${id}`, data);
    return response.data;
  },
  deleteStudent: async function (id) {
    const response = await api.delete(`/structures/students/${id}`);
    return response.data;
  },
  mySchedules: async function () {
    const response = await api.get('/timetable/student/my_schedules/');
    return response.data;
  }
};
export default etudiantService