# 🐍 Scripts Python - Documentation

Ce dossier contient 1 scripts Python pour l'exploitation et l'analyse des données Supabase.

---

## 📦 Installation

```bash
pip install -r requirements.txt --break-system-packages
```

---

## ⚙️ Configuration

Créer un fichier `.env` :

```bash
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_KEY=your_service_role_key_here
```

⚠️ **Important** : Utilisez la clé `service_role`, pas la clé `anon`.

---

## 📊 Script 1 : Statistiques (Option C)

**Fichier** : `statistics.py`

### Fonctionnalités

- Calcule le nombre de biens par ville
- Calcule le prix moyen par ville
- Affiche les résultats triés par volume

### Utilisation

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
```

---

## 📤 Script 2 : Export CSV (Option A)

**Fichier** : `export_csv.py`

### Fonctionnalités

- Exporte tous les biens **publiés** dans un fichier CSV
- Inclut : id, title, price, city, agent_id
- Horodatage automatique du nom de fichier

### Utilisation

```bash
python export_csv.py
```

### Sortie

Fichier créé : `properties_export_YYYYMMDD_HHMMSS.csv`

### Exemple de CSV

```csv
id,title,price,city,agent_id
123e4567-e89b,Appartement T3 centre-ville,250000,Paris,abc123
234e5678-e89c,Maison avec jardin,420000,Lyon,abc123
```

---

## 🧹 Script 3 : Nettoyage de données (Option B)

**Fichier** : `data_cleaning.py`

### Fonctionnalités

Détecte les anomalies dans les données :

- Prix manquants (`NULL`)
- Prix négatifs
- Titres trop courts (< 10 caractères)
- Villes manquantes
- Descriptions manquantes (informatif)

### Utilisation

```bash
python data_cleaning.py
```

### Exemple de sortie

```
📋 RAPPORT DE QUALITÉ DES DONNÉES
======================================================================

Total de biens analysés : 25

⚠️  PRIX MANQUANTS (2 biens)
----------------------------------------------------------------------
  • ID: a1b2c3d4... | Titre: Studio à rénover

⚠️  TITRES TROP COURTS (<10 caractères) (3 biens)
----------------------------------------------------------------------
  • ID: e5f6g7h8... | Titre: 'T2 Nice' (7 car.)

======================================================================
⚠️  5 PROBLÈME(S) CRITIQUE(S) DÉTECTÉ(S)
======================================================================
```

---

## 🔧 Utilisation avancée

### Connexion PostgreSQL classique

Si vous préférez utiliser `psycopg2` au lieu de `supabase-py` :

```python
import psycopg2
import os

# Connection string depuis Supabase → Database → Connection string
conn = psycopg2.connect(os.getenv("DATABASE_URL"))
cursor = conn.cursor()

cursor.execute("SELECT * FROM properties WHERE is_published = TRUE")
properties = cursor.fetchall()

cursor.close()
conn.close()
```

### Planification avec Cron

Pour exécuter automatiquement (Linux/Mac) :

```bash
# Ouvrir crontab
crontab -e

# Exécuter tous les jours à 2h du matin
0 2 * * * /usr/bin/python3 /path/to/statistics.py >> /path/to/logs.txt 2>&1
```

---

## 🐛 Troubleshooting

### "Invalid API key"

→ Vérifiez que vous utilisez la clé `service_role`, pas `anon`

### "Module 'supabase' not found"

```bash
pip install supabase --break-system-packages
```

### "Connection timeout"

→ Vérifiez que votre IP est autorisée dans Supabase (Database → Connection pooling)

### Données vides

→ Vérifiez que vous avez créé des biens dans la base

---

## 📚 Ressources

- [Supabase Python Client](https://github.com/supabase-community/supabase-py)
- [PostgreSQL Python Tutorial](https://www.psycopg.org/docs/)
- [CSV Module](https://docs.python.org/3/library/csv.html)

---

## ✅ Checklist

- [ ] Installation des dépendances OK
- [ ] Fichier `.env` configuré
- [ ] Au moins un script fonctionne
- [ ] Résultats affichés correctement
