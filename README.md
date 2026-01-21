# 🎯 Job Hunter Elite

**Plateforme intelligente de gestion de candidatures** – Pilotez votre recherche d'emploi avec puissance et élégance.

---

## ✨ Présentation

**Job Hunter Elite** est une application web moderne développée avec React, TypeScript et Supabase, conçue pour transformer la recherche d'emploi en une expérience organisée, motivante et efficace. 

Fini les tableurs désordonnés et les candidatures perdues : centralisez, analysez et suivez vos opportunités professionnelles dans une interface premium avec des fonctionnalités avancées d'IA.

---

## 🚀 Fonctionnalités principales

### 📊 Gestion complète des candidatures
- **Dashboard interactif** avec statistiques en temps réel
- **Kanban intelligent** pour visualiser le pipeline de candidatures
- **Filtres avancés** (statut, date, tags personnalisés, source)
- **Modes d'affichage** : Compact, Confort, Grille
- **Système de scoring IA** basé sur Gemini 1.5 Flash

### 🤖 Intelligence Artificielle
- **Analyse automatique** des offres d'emploi
- **Génération de lettres de motivation** personnalisées
- **Scoring de compatibilité** basé sur votre profil
- **Détection de duplicatas** pour éviter les doublons

### 🎨 Personnalisation
- **9 thèmes visuels** (Ocean, Forest, Luxury Gold, Cyberpunk, etc.)
- **Mode sombre** automatique pour certains thèmes
- **Personnalisation du profil IA** pour des résultats sur mesure

### 📚 Bibliothèque de documents
- **Gestion centralisée** de vos CV, lettres de motivation, certificats
- **Upload via Google Drive** ou fichier local
- **Filtres par type** de document
- **Sélection rapide** depuis le formulaire de candidature

### 📞 Gestion des contacts
- **Annuaire de recruteurs** avec informations détaillées
- **Lien direct** avec les candidatures
- **Profils LinkedIn** intégrés

### 📈 Analytics & Suivi
- **Graphiques de performance** (taux de réponse, conversions)
- **Système de relance automatique** avec notifications
- **Tableau de bord bien-être** (humeur, objectifs, réussites)
- **Export PDF** de vos rapports

### 🔗 Automatisation (HomeLab Ready)
- **Intégration n8n** pour scraping automatique d'offres
- **Détection de source** (Manuel vs Auto)
- **Injection directe** via Supabase API
- Compatible avec une infrastructure DevOps locale

---

## 🛠️ Stack technique

### Frontend
- **React 18** avec TypeScript
- **Vite** (bundler ultra-rapide)
- **Tailwind CSS v4** (design system moderne)
- **Lucide React** pour les icônes

### Backend & Services
- **Supabase** (PostgreSQL + Realtime + Auth + Storage)
- **Google Generative AI** (Gemini 1.5 Flash)
- **React Google Drive Picker** (upload de documents)

### Déploiement
- **Vercel** (production)
- **Supabase Cloud** (base de données)

---

## 📦 Installation

### Prérequis
- Node.js 18+ et npm
- Compte Supabase (gratuit)
- Clé API Google Gemini (optionnel pour l'IA)

### Configuration

1. **Cloner le dépôt**
   ```bash
   git clone https://github.com/Ernest-OZKALE/job-hunter-elite.git
   cd job-hunter-elite
   ```

2. **Installer les dépendances**
   ```bash
   npm install
   ```

3. **Configurer les variables d'environnement**
   
   Créez un fichier `.env` à la racine :
   ```env
   VITE_SUPABASE_URL=https://votre-projet.supabase.co
   VITE_SUPABASE_ANON_KEY=votre_cle_anon
   VITE_GEMINI_API_KEY=votre_cle_gemini (optionnel)
   ```

4. **Lancer en développement**
   ```bash
   npm run dev
   ```

5. **Build de production**
   ```bash
   npm run build
   npm run preview
   ```

---

## 🗄️ Architecture Supabase

### Tables principales

#### `applications`
- Stocke toutes les candidatures avec métadonnées complètes
- Supporte les champs d'automatisation (`origin`, `raw_salary`, `external_url`)
- Row-Level Security (RLS) activée

#### `documents`
- Bibliothèque personnelle de documents (CV, LM, etc.)
- Lien avec Supabase Storage

#### `contacts`
- Carnet d'adresses de recruteurs
- Lié aux candidatures via `contact_id`

---

## 🤖 Automatisation (HomeLab)

L'application supporte une architecture DevOps hybride avec n8n pour l'automatisation du scraping :

1. **Node A (Serveur Linux)** : n8n scrape les offres sur le web
2. **Node B (Proxy)** : Sécurise l'accès (Nginx + VPN)
3. **Injection Supabase** : Via API REST avec `SERVICE_ROLE_KEY`

Consultez `automation_guide.md` (dans les artefacts) pour la configuration complète.

---

## 🎨 Thèmes disponibles

- 🌊 **Ocean** – Bleu apaisant
- 🌲 **Forest** – Vert nature
- 🌅 **Sunset** – Orange chaleureux
- 👑 **Luxury Gold** – Doré premium (mode sombre)
- 👾 **Cyberpunk** – Néon futuriste (mode sombre)
- ❄️ **Nord** – Bleu glacé
- ☕ **Coffee** – Beige chaleureux
- 🌙 **Midnight** – Violet mystique
- ⚫ **Monochrome** – Minimaliste gris

---

## 📄 Licence

Ce projet est développé par **Ernest OZKALE** dans le cadre d'un projet personnel de recherche d'emploi.

Tous droits réservés © 2025-2026

---

## 🙏 Remerciements

Développé avec passion et l'aide de **Google Gemini (Antigravity Agent)** pour l'assistance au développement.

---

**🚀 Prêt à décrocher le job de vos rêves ?**
