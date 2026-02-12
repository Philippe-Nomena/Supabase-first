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
