# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    # Job Hunter Elite

    Application de suivi de candidatures développée avec React + TypeScript + Vite.

    Résumé rapide
    - Stack : React (TS) + Vite, Tailwind CSS, Firebase (Auth + Firestore + Hosting). Les fichiers utilisateurs sont envoyés sur Google Drive (option « Drive-only ») pour éviter d'utiliser le quota Storage du projet.

    Mode d'upload (comportement important)
    - Lors de la connexion via Google, l'application demande l'autorisation `https://www.googleapis.com/auth/drive.file` afin de pouvoir créer des fichiers sur le Google Drive de l'utilisateur.
    - Les fichiers ajoutés depuis l'interface sont téléversés directement sur le Drive de l'utilisateur et partagés en lecture (`anyoneWithLink`) pour permettre un téléchargement simple.
    - Les liens vers ces fichiers sont stockés dans Firestore dans le champ `attachments` de chaque document `users/{uid}/applications/{appId}`.
    - Si vous ne souhaitez pas cette approche, il est possible d'activer Firebase Storage dans la console et de revenir à un stockage géré par le projet (attention au quota/billing).

    Considérations de confidentialité et sécurité
    - Les fichiers téléversés sont créés dans le Drive personnel de l'utilisateur et peuvent être contrôlés/supprimés par cet utilisateur. L'application tente aussi de supprimer le fichier Drive lors d'une suppression depuis l'interface lorsque possible.
    - Les permissions données à l'application sont limitées au scope `drive.file` (création et gestion des fichiers créés par l'application). L'application élève la permission de lecture au public (`anyoneWithLink`) uniquement pour simplifier les téléchargements — vous pouvez modifier ce comportement dans `src/App.tsx` si vous préférez des liens restreints.

    Développement local
    - Installer les dépendances :

    ```powershell
    npm install
    ```

    - Lancer le serveur de développement :

    ```powershell
    npm run dev
    ```

    - Compiler la version de production :

    ```powershell
    npm run build
    ```

    Déploiement
    - Hébergement Firebase (hosting) :

    ```powershell
    firebase deploy --only hosting
    ```

    Notes pour les mainteneurs
    - Le code relatif au Drive est principalement dans `src/App.tsx` (fonctions d'upload et de suppression). Les métadonnées sont stockées en Firestore.
    - Tests unitaires : Vitest est utilisé pour les utilitaires (ex : `src/lib/relance.ts`, `src/lib/exportCsv.ts`). Lancez `npm test` pour exécuter les tests.

    Si vous avez besoin d'une autre stratégie de stockage (ex: stockage chiffré côté serveur, bucket privé, etc.), dites-moi et je vous proposerai une architecture adaptée.

    ---
    _Ajouté le 17 décembre 2025 — instructions en français et note sur l'upload Drive._
