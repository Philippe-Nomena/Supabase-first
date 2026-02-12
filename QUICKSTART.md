# 🚀 Guide de démarrage rapide

## Étape 1️⃣ : Configuration Supabase (5 min)

### Créer le projet
1. Aller sur https://supabase.com
2. Cliquer "New Project"
3. Choisir un nom, mot de passe, région
4. Attendre que le projet soit créé

### Exécuter le SQL
1. Dans le dashboard → **SQL Editor**
2. Copier tout le contenu de `backend/schema.sql`
3. Cliquer "Run"
4. ✅ Les tables et policies sont créées

### Récupérer les clés
1. Aller dans **Settings** → **API**
2. Noter :
   - `URL` (Project URL)
   - `anon/public` key
   - `service_role` key (pour Python)

---

## Étape 2️⃣ : Lancer le Frontend (5 min)

```bash
cd frontend

# Installer les dépendances
npm install

# Créer le fichier .env.local
cat > .env.local << EOF
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
EOF

# Lancer le serveur
npm run dev
```

✅ Ouvrir http://localhost:3000

---

## Étape 3️⃣ : Tester l'application (10 min)

### Créer un compte agent
1. Aller sur http://localhost:3000
2. Cliquer "Créer un compte"
3. Email : `agent@test.com` / Mot de passe : `password123`
4. Créer un profil manuellement dans Supabase :
   - Table `profiles` → Insert row
   - `id` : copier depuis `auth.users`
   - `role` : `agent`
   - `firstname` : `Jean`
   - `lastname` : `Dupont`

### Créer un bien
1. Se connecter avec `agent@test.com`
2. Cliquer "Mes biens"
3. Cliquer "Créer un bien"
4. Remplir le formulaire
5. Cocher "Publier immédiatement"
6. Cliquer "Créer"

### Créer un compte client
1. Se déconnecter
2. Créer un compte : `client@test.com` / `password123`
3. Créer un profil avec `role` = `client`
4. Vérifier qu'on voit le bien publié

---

## Étape 4️⃣ : Lancer le script Python (5 min)

```bash
cd python-script

# Installer les dépendances
pip install -r requirements.txt --break-system-packages

# Créer le fichier .env
cat > .env << EOF
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_KEY=your_service_role_key
EOF

# Exécuter le script
python statistics.py
```

✅ Vous devriez voir les statistiques s'afficher

---

## ⚠️ Résolution de problèmes

### "Invalid API key"
→ Vérifier que vous utilisez la bonne clé (anon pour frontend, service_role pour Python)

### "Row Level Security policy violation"
→ Vérifier que vous avez créé un profil avec le bon `id` (doit correspondre à `auth.users.id`)

### "Cannot find module"
→ Relancer `npm install` dans le dossier frontend

### Script Python ne se connecte pas
→ Vérifier que vous utilisez la `service_role` key, pas la `anon` key

---

## 📋 Checklist avant de soumettre

- [ ] Le SQL s'exécute sans erreur
- [ ] Je peux créer un compte et me connecter
- [ ] Un agent peut créer un bien
- [ ] Un client voit uniquement les biens publiés
- [ ] Le script Python affiche les statistiques
- [ ] Le README est clair et complet
- [ ] Les fichiers `.env` sont dans `.gitignore`

---

## 🎉 C'est terminé !

Temps estimé : **25 minutes**  
Votre projet est prêt à être soumis !

Pour aller plus loin, consultez le README principal.
