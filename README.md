

### installation
- installer les application necessaire pour faire marcher le projet
backend : 
- python (pour le dévelloppement du projet on a utilisé la version 3.12.10)
- docker (pour lancer le serveur redis au cas ou vous ouvrer le projet sur windows)
- redis-serveur (si vous installer docker c'est que vous etes probablement sur windows donc vous devrier installer redis dans un conteneur docker affin de l'utiliser)

frontend : 
- node

- installer les dépendance du serveur backend
- installer les dépendance du serveur frontend

- modifier les parametre dans setting (pour une mise en production)

- creer un .env et y mettre toutes les information sensible
    backend/.env
    FRONTEND_URL=http://localhost:3000

    frontend/.env
    VITE_API_URL=http://localhost:8000/api
    VITE_MOCK_MODE=false


