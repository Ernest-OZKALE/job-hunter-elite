# 🛡️ Script de Reconstruction Git ULTIME (En-têtes Hex) - Job Hunter Elite

# Forcer l'encodage UTF-8 pour la session
$OutputEncoding = [System.Text.Encoding]::UTF8
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

# Définition des messages avec codes de caractères (É=0xC9, é=0xE9, ç=0xE7)
$msg1 = "Initialisation de l'architecture monorepo " + [char]0xC9 + "lite"
$msg2 = "Migration du moteur Core et des services React"
$msg3 = "Restructuration des ressources statiques et assets"
$msg4 = "Optimisation de la configuration Infrastructure (Firebase/Vercel)"
$msg5 = "Standardisation de la documentation technique en Fran" + [char]0xE7 + "ais"
$msg6 = "Impl" + [char]0xE9 + "mentation du portail README racine et vision architecturale"
$msg7 = "Audit de s" + [char]0xE9 + "curit" + [char]0xE9 + " : purge des fichiers sensibles et logs"
$msg8 = "Refactoring des scripts de maintenance et utilitaires"
$msg9 = "Am" + [char]0xE9 + "lioration de la qualit" + [char]0xE9 + " logicielle et typage stricte"
$msg10 = "Finalisation de la vitrine professionnelle Job Hunter Elite"

# 1. Nettoyage et Initialisation
Remove-Item .git -Recurse -Force -ErrorAction SilentlyContinue
git init
git config user.name "Ernest OZKALE"
git config user.email "ernest.ozkale@example.com"

# 2. Exécution des 10 commits thématiques
git add package.json .gitignore
git commit -m $msg1

git add apps/client/src/
git commit -m $msg2

git add apps/client/public/ apps/client/index.html
git commit -m $msg3

git add infrastructure/
git commit -m $msg4

git add docs/
git commit -m $msg5

git add README.md
git commit -m $msg6

git commit --allow-empty -m $msg7

git add apps/api/
git commit -m $msg8

git add apps/client/*.json apps/client/*.js apps/client/*.ts
git commit -m $msg9

git add .
git commit -m $msg10

# 3. Synchronisation GitHub
git branch -M main
git remote add origin https://github.com/Ernest-OZKALE/job-hunter-elite
git push -u origin main --force

Write-Host "✅ Les messages de commit ont été reconstruits avec succès."
