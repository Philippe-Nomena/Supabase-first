# Plateforme Immobilière - Test Technique

## 📋 Vue d'ensemble

Application web de gestion immobilière avec Supabase comme backend unique. Les agents peuvent publier des biens, les clients peuvent consulter les annonces publiées.

**Durée du test**: 2h30 - 3h  
**Stack**: Supabase (Auth, PostgreSQL, RLS) + Next.js + Python

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
│                                         │
│                                         │
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
  role TEXT NOT NULL CHECK (role IN ('agent', 'client','utilisateur')),
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

RLS sécurisent les données **au niveau database**. Même avec un accès direct à la base, les utilisateurs ne peuvent voir que leurs données autorisées.

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
