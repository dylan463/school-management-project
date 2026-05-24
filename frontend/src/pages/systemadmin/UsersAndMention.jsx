import React from 'react'
import UserPanel from '../../components/panel/UserPanel'
import MentionPanel from '../../components/panel/MentionPanel'

function UsersAndMention() {
  return (
    <div>
        <h1>
            Gestion des mentions et des chefs de mention
        </h1>
        <UserPanel/>
        <MentionPanel/>
    </div>
  )
}

export default UsersAndMention