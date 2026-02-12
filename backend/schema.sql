-- ============================================
-- SCHEMA DATABASE - REAL ESTATE PLATFORM
-- ============================================

-- Créer la table profiles
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  role TEXT NOT NULL CHECK (role IN ('agent', 'client','utilisateur')),
  firstname TEXT NOT NULL,
  lastname TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Créer la table properties
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

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Activer RLS sur les deux tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;

-- ============================================
-- POLICIES POUR PROFILES
-- ============================================

-- Chaque utilisateur peut uniquement lire son propre profil
CREATE POLICY "Users can view own profile"
  ON profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Chaque utilisateur peut mettre à jour son propre profil
CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- Permettre l'insertion lors de la création de compte
CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ============================================
-- POLICIES POUR PROPERTIES
-- ============================================

-- Les clients peuvent lire uniquement les biens publiés
CREATE POLICY "Clients can view published properties"
  ON properties
  FOR SELECT
  USING (
    is_published = TRUE 
    OR 
    agent_id IN (
      SELECT id FROM profiles WHERE id = auth.uid()
    )
  );

-- Les agents peuvent créer leurs propres biens
CREATE POLICY "Agents can create properties"
  ON properties
  FOR INSERT
  WITH CHECK (
    agent_id = auth.uid()
    AND
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role = 'agent'
    )
  );

-- Les agents peuvent modifier uniquement leurs propres biens
CREATE POLICY "Agents can update own properties"
  ON properties
  FOR UPDATE
  USING (
    agent_id = auth.uid()
    AND
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role = 'agent'
    )
  );

-- Les agents peuvent supprimer uniquement leurs propres biens
CREATE POLICY "Agents can delete own properties"
  ON properties
  FOR DELETE
  USING (
    agent_id = auth.uid()
    AND
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role = 'agent'
    )
  );

-- ============================================
-- INDEX POUR PERFORMANCE
-- ============================================

CREATE INDEX idx_properties_agent_id ON properties(agent_id);
CREATE INDEX idx_properties_city ON properties(city);
CREATE INDEX idx_properties_is_published ON properties(is_published);
CREATE INDEX idx_profiles_role ON profiles(role);
