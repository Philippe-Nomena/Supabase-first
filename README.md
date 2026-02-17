# Plateforme Immobilière - Test Technique

## 📋 Vue d'ensemble

Application web de gestion immobilière avec Supabase comme backend unique. Les agents peuvent publier des biens, les clients peuvent consulter les annonces publiées.

**Durée du test**: 2h30 - 3h  
**Stack**: Supabase (Auth, PostgreSQL, RLS) + Next.js/React + Python

---

## 🏗️ Architecture

### Backend-first avec Supabase

```
┌─────────────────────────────────────────┐
│           Frontend (Next.js)            │
│  - Pages: Login, Properties, MyProperties │
└───────────────┬─────────────────────────┘
                │
                │ Supabase Client
                ▼
┌─────────────────────────────────────────┐
│           Supabase Backend              │
│  ┌─────────────────────────────────┐   │
│  │  Auth (Email/Password)          │   │
│  └─────────────────────────────────┘   │
│  ┌─────────────────────────────────┐   │
│  │  PostgreSQL Database            │   │
│  │  - profiles (users)             │   │
│  │  - properties (listings)        │   │
│  └─────────────────────────────────┘   │
│  ┌─────────────────────────────────┐   │
│  │  Row Level Security (RLS)       │   │
│  │  - Contrôle d'accès granulaire  │   │
│  └─────────────────────────────────┘   │
└───────────────┬─────────────────────────┘
                │
                │ Python Client / SQL
                ▼
┌─────────────────────────────────────────┐
│     Scripts Python (Analytics)          │
│  - Statistiques par ville               │
│  - Export CSV                           │
│  - Nettoyage de données                 │
└─────────────────────────────────────────┘
```

**Pourquoi cette architecture ?**

- **Sécurité centralisée** : Les règles RLS protègent les données au niveau database
- **Moins de code backend** : Supabase gère auth, API, et permissions
- **Scalabilité** : PostgreSQL peut gérer des millions de lignes
- **Temps de développement réduit** : Pas besoin de créer une API REST custom

---

## 📊 Modèle de données

### Table `profiles`

Stocke les informations utilisateurs (agents et clients).

```sql
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  role TEXT NOT NULL CHECK (role IN ('agent', 'client')),
  firstname TEXT NOT NULL,
  lastname TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Relations** :

- `id` → Clé étrangère vers `auth.users` (table système Supabase)
- Un utilisateur = un profil

### Table `properties`

Stocke les biens immobiliers.

```sql
CREATE TABLE properties (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL,
  city TEXT NOT NULL,
  agent_id UUID REFERENCES profiles(id) NOT NULL,
  is_published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Relations** :

- `agent_id` → Clé étrangère vers `profiles.id`
- Un agent peut avoir plusieurs biens
- Un bien appartient à un seul agent

**Diagramme** :

```
auth.users (Supabase)
    │
    │ 1:1
    ▼
profiles
    │
    │ 1:N
    ▼
properties
```

---

## 🔒 Row Level Security (RLS)

Les règles RLS sécurisent les données **au niveau database**. Même avec un accès direct à la base, les utilisateurs ne peuvent voir que leurs données autorisées.

### Policies pour `profiles`

```sql
-- Lecture : Uniquement son propre profil
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Écriture : Uniquement son propre profil
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);
```

### Policies pour `properties`

```sql
-- LECTURE : Clients voient les biens publiés, agents voient tous leurs biens
CREATE POLICY "Clients can view published properties"
  ON properties FOR SELECT
  USING (
    is_published = TRUE
    OR
    agent_id IN (SELECT id FROM profiles WHERE id = auth.uid())
  );

-- CRÉATION : Seuls les agents peuvent créer des biens
CREATE POLICY "Agents can create properties"
  ON properties FOR INSERT
  WITH CHECK (
    agent_id = auth.uid()
    AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'agent')
  );

-- MODIFICATION : Agents peuvent modifier uniquement leurs biens
CREATE POLICY "Agents can update own properties"
  ON properties FOR UPDATE
  USING (
    agent_id = auth.uid()
    AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'agent')
  );
```

**Avantages RLS** :

- ✅ Sécurité au niveau database (pas de bypass possible)
- ✅ Moins de code frontend/backend
- ✅ Performances (PostgreSQL optimise les requêtes)
- ✅ Audit trail automatique

---

## 🐍 Script Python

### Option choisie : C - Statistiques simples

Le script `statistics.py` calcule :

- **Nombre de biens par ville**
- **Prix moyen par ville**

### Installation

```bash
cd python-script
pip install -r requirements.txt --break-system-packages
```

### Configuration

Créer un fichier `.env` :

```bash
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_KEY=your_service_role_key
```

### Exécution

```bash
python statistics.py
```

### Exemple de sortie

```
📊 STATISTIQUES DES BIENS IMMOBILIERS PAR VILLE
============================================================

Ville                Nb de biens     Prix moyen (€)
------------------------------------------------------------
Paris                15              450,000.00 €
Lyon                 8               320,000.00 €
Marseille            5               280,000.00 €
------------------------------------------------------------
TOTAL                28              383,571.43 €

============================================================
```

### Utilité dans un projet réel

**Python dans un projet Supabase sert à** :

1. **ETL / Data pipelines**
   - Import de données externes (CSV, API)
   - Synchronisation avec d'autres bases
   - Migration de données

2. **Analytics & Reporting**
   - Génération de rapports PDF/Excel
   - Calculs complexes (ML, statistiques)
   - Dashboards automatisés

3. **Automatisation**
   - Cron jobs (nettoyage, alertes)
   - Webhooks processing
   - Emails batch

4. **Tâches lourdes**
   - Image processing
   - Geocoding en masse
   - Export de gros volumes

---

## 💻 Installation Frontend

### Prérequis

- Node.js 18+
- Compte Supabase

### Steps

```bash
cd frontend
npm install
```

### Configuration

Créer `.env.local` :

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### Lancement

```bash
npm run dev
```

Application disponible sur `http://localhost:3000`

---

## 🚀 Déploiement Supabase

### 1. Créer un projet Supabase

1. Aller sur [supabase.com](https://supabase.com)
2. Créer un nouveau projet
3. Noter l'URL et les clés API

### 2. Exécuter le schéma SQL

1. Dans Supabase Dashboard → SQL Editor
2. Copier le contenu de `backend/schema.sql`
3. Exécuter le script

### 3. Activer l'authentification Email

1. Authentication → Providers
2. Activer "Email"
3. Configurer les paramètres SMTP (optionnel)

---

## 🎯 Logique métier : où la placer ?

### Frontend

**❌ NE PAS mettre** :

- Validation critique des permissions
- Calculs de prix
- Logique de sécurité

**✅ Mettre** :

- Validation UX (champs requis)
- Formatage des données
- Gestion d'état local

### RLS (Row Level Security)

**✅ Mettre** :

- Permissions d'accès aux données
- Filtres de sécurité
- Règles métier simples (qui peut voir quoi)

**Exemple** : `is_published = TRUE OR agent_id = auth.uid()`

### Scripts externes (Python)

**✅ Mettre** :

- Analytics complexes
- Batch processing
- Tâches planifiées
- Intégrations tierces

### Database Functions (PostgreSQL)

**✅ Mettre** :

- Calculs complexes côté serveur
- Triggers (audit, notifications)
- Logique réutilisable

---

## ⚠️ Limites à grande échelle

### 1. **Performance RLS**

- **Problème** : Les policies RLS ajoutent des JOINs → ralentissement sur gros volumes
- **Solution** :
  - Indexer les colonnes utilisées dans les policies
  - Utiliser des vues matérialisées
  - Cacher les résultats côté application

### 2. **Connexions limitées**

- **Problème** : PostgreSQL limite le nombre de connexions simultanées
- **Solution** :
  - Connection pooling (PgBouncer, Supabase inclut Supavisor)
  - Edge Functions pour logique stateless

### 3. **Pas de logique métier complexe**

- **Problème** : RLS ne peut pas gérer des workflows complexes
- **Solution** :
  - PostgreSQL Functions pour logique serveur
  - API backend custom si nécessaire
  - Event-driven architecture (webhooks)

### 4. **Coûts**

- **Problème** : Supabase facture par usage (stockage, bandwidth, compute)
- **Solution** :
  - Optimiser les requêtes
  - Utiliser CDN pour les assets
  - Self-host PostgreSQL si volume très élevé

### 5. **Vendor lock-in**

- **Problème** : Dépendance à Supabase
- **Solution** :
  - Supabase est open-source → self-hostable
  - PostgreSQL standard → portabilité facile

---

## 📦 Structure du projet

```
SUPABASE-FIRST/
├── backend/
│   └── schema.sql                  # Structure DB + RLS
├── frontend/
│   ├── app/
│   │   ├── page.tsx                # Login
│   │   ├── properties/page.tsx     # Liste biens publiés
│   │   └── my-properties/page.tsx  # Mes biens (agents)
|   |   └── profile/page.tsx        # Profil page
│   ├── lib/
│   │   └── supabase.ts             # Client Supabase
│   ├── package.json
│   └── .env.local
├── python-script/
│   ├── statistics.py               # Script statistiques
|   ├── README.md                   # Ce fichier
└── README.md                       # Ce fichier
```

---

## 🔄 Améliorations possibles

### Court terme

- [ ] Upload d'images pour les biens
- [ ] Recherche/filtres avancés (prix, ville, etc.)
- [ ] Pagination de la liste
- [ ] Édition/suppression de biens

### Moyen terme

- [ ] Géolocalisation (carte interactive)
- [ ] Favoris pour les clients
- [ ] Notifications par email
- [ ] Dashboard analytics pour agents

### Long terme

- [ ] Système de messaging agent-client
- [ ] Réservation de visites
- [ ] Paiements en ligne
- [ ] Mobile app (React Native + Supabase)
- [ ] ML : Estimation de prix automatique

---

## 🧪 Tests

### Scénarios de test

## 🧪 Tests

### Scénarios de test

1. **Création de compte agent**
   - S'inscrire → Créer profil avec `role='agent'`
   - Créer un bien → Vérifier qu'il apparaît dans "Mes biens"
   - Publier le bien → Vérifier qu'il apparaît dans la liste publique

2. **Création de compte client**
   - S'inscrire → Créer profil avec `role='client'`
   - Il ne peut pas voir le "Mes biens"
   - Voir uniquement les biens publiés

3. **Création de compte utilisateur**
   - S'inscrire → Créer profil avec `role='utilisateur'`
   - Il ne voit que son profil

4. **Sécurité RLS**
   - Agent A ne peut pas modifier les biens d'Agent B
   - Client ne peut pas voir les biens non publiés

---

## 📞 Support

Pour toute question sur Supabase :

- [Documentation officielle](https://supabase.com/docs)
- [Discord Supabase](https://discord.supabase.com)

---

## 📝 Licence

Ce projet est un test technique éducatif.
