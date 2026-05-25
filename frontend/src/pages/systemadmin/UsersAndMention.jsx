import React from 'react'
import UserPanel from '../../components/panel/UserPanel'
import MentionPanel from '../../components/panel/MentionPanel'

function UsersAndMention() {
  return (
    <div className='grid grid-cols-1 gap-y-3'>
        <h1>
            Mention et chef de département
        </h1>
        <p>un espace de gestion centralisée pour le gestion des mentions et des chefs de départements</p>
        <MentionPanel/>
        <UserPanel/>
    </div>
  )
}

export default UsersAndMention