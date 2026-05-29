import api from './api'

export const headSevices = {
  list : async (filters = {})=> {
    const params = new URLSearchParams(filters)
    const r = await api.get(`/portal/heads/?${params.toString()}`)
    return r.data
  },
  create: async (data) => {
    const r  =  await api.post('/portal/heads/',data)
    return r.data
  },
  update: async ({id,data}) => {
    const r = await api.patch(`/portal/heads/${id}/`,data)
    return r.data
  },
  delete: async (id) => {
    const r = await api.delete(`/portal/heads/${id}/`)
    return r.data
  }
}

export const secretarySevices = {
  list : async (filters = {})=> {
    const params = new URLSearchParams(filters)
    const r = await api.get(`/portal/secretaries/?${params.toString()}`)
    return r.data
  },
  create: async (data) => {
    const r  =  await api.post('/portal/secretaries/',data)
    return r.data
  },
  update: async ({id,data}) => {
    const r = await api.patch(`/portal/secretaries/${id}/`,data)
    return r.data
  },
  delete: async (id) => {
    const r = await api.delete(`/portal/secretaries/${id}/`)
    return r.data
  }
}

export const officerSevices = {
  list : async (filters = {})=> {
    const params = new URLSearchParams(filters)
    const r = await api.get(`/portal/officers/?${params.toString()}`)
    return r.data
  },
  create: async (data) => {
    const r  =  await api.post('/portal/officers/',data)
    return r.data
  },
  update: async ({id,data}) => {
    const r = await api.patch(`/portal/officers/${id}/`,data)
    return r.data
  },
  delete: async (id) => {
    const r = await api.delete(`/portal/officers/${id}/`)
    return r.data
  }
}

export const teacherSevices = {
  list : async (filters = {})=> {
    const params = new URLSearchParams(filters)
    const r = await api.get(`/portal/teachers/?${params.toString()}`)
    return r.data
  },
  create: async (data) => {
    const r  =  await api.post('/portal/teachers/',data)
    return r.data
  },
  update: async ({id,data}) => {
    const r = await api.patch(`/portal/teachers/${id}/`,data)
    return r.data
  },
  delete: async (id) => {
    const r = await api.delete(`/portal/teachers/${id}/`)
    return r.data
  }
}

export const studentSevices = {
  list : async (filters = {})=> {
    const params = new URLSearchParams(filters)
    const r = await api.get(`/portal/students/?${params.toString()}`)
    return r.data
  },
  create: async (data) => {
    const r  =  await api.post('/portal/students/',data)
    return r.data
  },
  update: async ({id,data}) => {
    const r = await api.patch(`/portal/students/${id}/`,data)
    return r.data
  },
  delete: async (id) => {
    const r = await api.delete(`/portal/students/${id}/`)
    return r.data
  }
}