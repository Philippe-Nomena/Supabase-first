#!/usr/bin/env python3
"""
Script Python - Statistiques des biens immobiliers
Option C: Calcul du nombre de biens et prix moyen par ville
"""

from dotenv import load_dotenv
import os
from supabase import create_client, Client
from collections import defaultdict

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

def calculate_statistics(properties):
    """Calculer les statistiques par ville"""
    stats_by_city = defaultdict(lambda: {"count": 0, "total_price": 0})
    
    for prop in properties:
        city = prop.get("city", "Inconnue")
        price = prop.get("price", 0)
        
        stats_by_city[city]["count"] += 1
        stats_by_city[city]["total_price"] += float(price)
    
    return stats_by_city

def display_statistics(stats_by_city):
    """Afficher les statistiques en console"""
    print("\n" + "="*60)
    print("📊 STATISTIQUES DES BIENS IMMOBILIERS PAR VILLE")
    print("="*60 + "\n")
    
    if not stats_by_city:
        print("Aucune donnée disponible.")
        return
    
    # Trier par nombre de biens (décroissant)
    sorted_cities = sorted(
        stats_by_city.items(), 
        key=lambda x: x[1]["count"], 
        reverse=True
    )
    
    print(f"{'Ville':<20} {'Nb de biens':<15} {'Prix moyen (€)':<20}")
    print("-"*60)
    
    total_properties = 0
    total_price = 0
    
    for city, data in sorted_cities:
        count = data["count"]
        avg_price = data["total_price"] / count if count > 0 else 0
        
        print(f"{city:<20} {count:<15} {avg_price:>15,.2f} €")
        
        total_properties += count
        total_price += data["total_price"]
    
    print("-"*60)
    overall_avg = total_price / total_properties if total_properties > 0 else 0
    print(f"{'TOTAL':<20} {total_properties:<15} {overall_avg:>15,.2f} €")
    print("\n" + "="*60 + "\n")

def main():
    """Fonction principale"""
    print("🚀 Démarrage du script de statistiques...\n")
    
    try:
        # Connexion à Supabase
        supabase = get_supabase_client()
        print("✅ Connexion à Supabase réussie\n")
        
        # Récupération des données
        properties = fetch_properties(supabase)
        print(f"✅ {len(properties)} biens récupérés\n")
        
        # Calcul des statistiques
        stats = calculate_statistics(properties)
        
        # Affichage des résultats
        display_statistics(stats)
        
        print("✅ Script terminé avec succès!")
        
    except Exception as e:
        print(f"❌ Erreur fatale: {e}")
        exit(1)

if __name__ == "__main__":
    main()