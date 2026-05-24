import api from './api'

export const headsSevices = {
  list : async (filters)=> {
    const params = new URLSearchParams(filters)
    const r = await api.get(`/users/users/?${params.toString()}`)
    return r.data
  },
  create: async (data) => {
    const r  =  await api.post('/users/users/',data)
    return r.data
  },
  update: async (id,data) => {
    const r = await api.patch(`/users/users/${id}/`,data)
    return r.data
  },
  delete: async (id) => {
    const r = await api.delete(`/users/users/${id}/`)
    return r.data
  }
}

export const mentionsSevices = {
  list : async (filters)=> {
    const params = new URLSearchParams(filters)
    const r = await api.get(`/users/mentions/?${params.toString()}`)
    return r.data
  },
  create: async (data) => {
    const r  =  await api.post('/users/mentions/',data)
    return r.data
  },
  update: async (id,data) => {
    const r = await api.patch(`/users/mentions/${id}/`,data)
    return r.data
  },
  delete: async (id) => {
    const r = await api.delete(`/users/mentions/${id}/`)
    return r.data
  }
}