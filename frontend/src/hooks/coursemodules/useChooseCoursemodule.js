import { useMutation, useQueryClient } from '@tanstack/react-query'
import { coursemoduleService } from '../../services/structuresService'

export const useChooseCoursemodule = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: coursemoduleService.choose,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['coursemodulechoices'],
      })
      queryClient.invalidateQueries({
        queryKey: ['coursemodules'],
      })
    },
  })
}
