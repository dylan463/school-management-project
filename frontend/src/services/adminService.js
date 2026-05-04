import api from './api'

const adminService = {
  getDashboardStats: async () => {
    const [studentsResponse, teachersResponse, formationsResponse, enrollementsResponse] = await Promise.all([
      api.get('/auth/students/'),
      api.get('/auth/teachers/'),
      api.get('/structures/formations/'),
      api.get('/structures/enrollements/'),
    ])

    return {
      students: studentsResponse.data.length,
      teachers: teachersResponse.data.length,
      structures: formationsResponse.data.length,
      inscriptions: enrollementsResponse.data.length,
    }
  },
}

export default adminService
