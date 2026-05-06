const extractDRFError = (error) => {
  const data = error.response?.data
  if (!data) return error.message || 'Une erreur est survenue'
  if (typeof data === 'string') return data
  if (data.non_field_errors) return data.non_field_errors[0]
  if (data.detail) return data.detail
  const first = Object.values(data)[0]
  return Array.isArray(first) ? first[0] : first
}

export default extractDRFError