#!/usr/bin/env python3
"""
Script Python - Export CSV des biens immobiliers
Option A: Export data
"""

import os
import csv
from datetime import datetime
from dotenv import load_dotenv
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

def fetch_published_properties(supabase: Client):
    """Récupérer tous les biens publiés depuis Supabase"""
    try:
        response = supabase.table("properties")\
            .select("id, title, price, city, agent_id")\
            .eq("is_published", True)\
            .execute()
        return response.data
    except Exception as e:
        print(f"❌ Erreur lors de la récupération des données: {e}")
        return []

def export_to_csv(properties, filename="properties_export.csv"):
    """Exporter les données dans un fichier CSV"""
    if not properties:
        print("⚠️  Aucune donnée à exporter")
        return
    
    # Définir les colonnes
    fieldnames = ["id", "title", "price", "city", "agent_id"]
    
    try:
        with open(filename, 'w', newline='', encoding='utf-8') as csvfile:
            writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
            
            # Écrire l'en-tête
            writer.writeheader()
            
            # Écrire les données
            for prop in properties:
                writer.writerow({
                    "id": prop.get("id", ""),
                    "title": prop.get("title", ""),
                    "price": prop.get("price", 0),
                    "city": prop.get("city", ""),
                    "agent_id": prop.get("agent_id", "")
                })
        
        print(f"✅ Export réussi : {filename}")
        print(f"📊 {len(properties)} biens exportés")
        
    except Exception as e:
        print(f"❌ Erreur lors de l'export CSV: {e}")

def main():
    """Fonction principale"""
    print("🚀 Démarrage du script d'export CSV...\n")
    
    try:
        # Connexion à Supabase
        supabase = get_supabase_client()
        print("✅ Connexion à Supabase réussie\n")
        
        # Récupération des données
        properties = fetch_published_properties(supabase)
        print(f"✅ {len(properties)} biens publiés récupérés\n")
        
        # Export CSV
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"properties_export_{timestamp}.csv"
        export_to_csv(properties, filename)
        
        print(f"\n✅ Script terminé avec succès!")
        print(f"📁 Fichier créé : {filename}")
        
    except Exception as e:
        print(f"❌ Erreur fatale: {e}")
        exit(1)

if __name__ == "__main__":
    main()
