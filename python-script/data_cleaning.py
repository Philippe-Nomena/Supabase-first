#!/usr/bin/env python3
"""
Script Python - Nettoyage et validation des données
Option B: Data cleaning
"""
from dotenv import load_dotenv
import os
from supabase import create_client, Client

# Charger les variables d'environnement depuis .env
load_dotenv()
# Configuration Supabase
SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "")

def get_supabase_client() -> Client:
    """Créer et retourner le client Supabase"""
    if not SUPABASE_URL or not SUPABASE_KEY:
        raise ValueError("Variables d'environnement SUPABASE_URL et SUPABASE_KEY requises")
    return create_client(SUPABASE_URL, SUPABASE_KEY)

def fetch_properties(supabase: Client):
    """Récupérer tous les biens depuis Supabase"""
    try:
        response = supabase.table("properties").select("*").execute()
        return response.data
    except Exception as e:
        print(f"❌ Erreur lors de la récupération des données: {e}")
        return []

def analyze_data_quality(properties):
    """Analyser la qualité des données"""
    issues = {
        "missing_price": [],
        "negative_price": [],
        "short_title": [],
        "missing_city": [],
        "missing_description": []
    }
    
    for prop in properties:
        prop_id = prop.get("id", "unknown")
        title = prop.get("title", "")
        price = prop.get("price")
        city = prop.get("city", "")
        description = prop.get("description", "")
        
        # Vérifier le prix
        if price is None:
            issues["missing_price"].append({
                "id": prop_id,
                "title": title
            })
        elif float(price) < 0:
            issues["negative_price"].append({
                "id": prop_id,
                "title": title,
                "price": price
            })
        
        # Vérifier le titre
        if len(title) < 10:
            issues["short_title"].append({
                "id": prop_id,
                "title": title,
                "length": len(title)
            })
        
        # Vérifier la ville
        if not city or len(city.strip()) == 0:
            issues["missing_city"].append({
                "id": prop_id,
                "title": title
            })
        
        # Vérifier la description
        if not description or len(description.strip()) == 0:
            issues["missing_description"].append({
                "id": prop_id,
                "title": title
            })
    
    return issues

def display_report(issues, total_properties):
    """Afficher le rapport de qualité des données"""
    print("\n" + "="*70)
    print("📋 RAPPORT DE QUALITÉ DES DONNÉES")
    print("="*70 + "\n")
    
    print(f"Total de biens analysés : {total_properties}\n")
    
    # Prix manquants
    if issues["missing_price"]:
        print(f"⚠️  PRIX MANQUANTS ({len(issues['missing_price'])} biens)")
        print("-"*70)
        for item in issues["missing_price"][:5]:  # Afficher max 5
            print(f"  • ID: {item['id'][:8]}... | Titre: {item['title']}")
        if len(issues["missing_price"]) > 5:
            print(f"  ... et {len(issues['missing_price']) - 5} autres\n")
        else:
            print()
    
    # Prix négatifs
    if issues["negative_price"]:
        print(f"❌ PRIX NÉGATIFS ({len(issues['negative_price'])} biens)")
        print("-"*70)
        for item in issues["negative_price"][:5]:
            print(f"  • ID: {item['id'][:8]}... | Prix: {item['price']} € | Titre: {item['title']}")
        if len(issues["negative_price"]) > 5:
            print(f"  ... et {len(issues['negative_price']) - 5} autres\n")
        else:
            print()
    
    # Titres trop courts
    if issues["short_title"]:
        print(f"⚠️  TITRES TROP COURTS (<10 caractères) ({len(issues['short_title'])} biens)")
        print("-"*70)
        for item in issues["short_title"][:5]:
            print(f"  • ID: {item['id'][:8]}... | Titre: '{item['title']}' ({item['length']} car.)")
        if len(issues["short_title"]) > 5:
            print(f"  ... et {len(issues['short_title']) - 5} autres\n")
        else:
            print()
    
    # Ville manquante
    if issues["missing_city"]:
        print(f"⚠️  VILLE MANQUANTE ({len(issues['missing_city'])} biens)")
        print("-"*70)
        for item in issues["missing_city"][:5]:
            print(f"  • ID: {item['id'][:8]}... | Titre: {item['title']}")
        if len(issues["missing_city"]) > 5:
            print(f"  ... et {len(issues['missing_city']) - 5} autres\n")
        else:
            print()
    
    # Description manquante
    if issues["missing_description"]:
        print(f"ℹ️  DESCRIPTION MANQUANTE ({len(issues['missing_description'])} biens)")
        print("-"*70)
        print("  (Ceci est informatif, pas critique)\n")
    
    # Résumé
    total_issues = sum(len(v) for k, v in issues.items() if k != "missing_description")
    
    print("="*70)
    if total_issues == 0:
        print("✅ AUCUN PROBLÈME CRITIQUE DÉTECTÉ!")
    else:
        print(f"⚠️  {total_issues} PROBLÈME(S) CRITIQUE(S) DÉTECTÉ(S)")
    print("="*70 + "\n")

def main():
    """Fonction principale"""
    print("🚀 Démarrage du script de nettoyage...\n")
    
    try:
        # Connexion à Supabase
        supabase = get_supabase_client()
        print("✅ Connexion à Supabase réussie\n")
        
        # Récupération des données
        properties = fetch_properties(supabase)
        print(f"✅ {len(properties)} biens récupérés\n")
        
        # Analyse de qualité
        issues = analyze_data_quality(properties)
        
        # Affichage du rapport
        display_report(issues, len(properties))
        
        print("✅ Script terminé avec succès!")
        
    except Exception as e:
        print(f"❌ Erreur fatale: {e}")
        exit(1)

if __name__ == "__main__":
    main()
