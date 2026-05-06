import api from './api'

const adminService = {
  // Dashboard stats
  getDashboardStats: async () => {
    const [studentsResponse, teachersResponse, formationsResponse, enrollmentsResponse] = await Promise.all([
      api.get('/structures/students/'),
      api.get('/structures/teachers/'),
      api.get('/structures/formations/'),
      api.get('/structures/enrollments/'),
    ])

    return {
      students: studentsResponse.data.length,
      teachers: teachersResponse.data.length,
      structures: formationsResponse.data.length,
      inscriptions: enrollmentsResponse.data.length,
    }
  },
}

export default adminService
