export default function HelpModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-6">
        <div className="flex items-start justify-between">
          <h3 className="text-lg font-bold">Aide rapide</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700">Fermer</button>
        </div>
        <div className="mt-4 text-sm text-slate-600 space-y-3">
          <p>Les fichiers sont envoyés par défaut sur votre Google Drive (quota personnel). Pour utiliser le Storage du projet, allez dans Préférences et choisissez "Storage" â€” le Storage du projet doit être activé dans la console Firebase.</p>
          <p>Si vous rencontrez des problèmes d'upload Drive, reconnectez-vous en cliquant sur votre avatar (déconnexion puis connexion) et autorisez l'accès Drive.</p>
        </div>
      </div>
    </div>
  );
}
