export default function EmailCredentialsModalContent({ user, password }) {
  return (
    <div>
      <p>Voici les informations d'authentification du nouvel utilisateur.</p>
      <div>Utilisateur : {user?.username ?? "-"}</div>
      <div>Mot de passe : {password ?? "-"}</div>
    </div>
  )
}
