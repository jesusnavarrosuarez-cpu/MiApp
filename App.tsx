import React, { useState, useEffect, useMemo } from 'react';
import useLocalStorage from './hooks/useLocalStorage';
import { INITIAL_RECIPES, INITIAL_RAW_MATERIALS, INITIAL_FAMILIES } from './data';
import type { View, Recipe, RawMaterial, RecipeFamily } from './types';
import { RecipeList } from './components/RecipeList';
import { RecipeDetail } from './components/RecipeDetail';
import { RecipeForm } from './components/RecipeForm';
import { RawMaterials } from './components/RawMaterials';
import { FamilyManagementModal } from './components/FamilyManagementModal';
import { BookIcon, PackageIcon } from './components/Icons';


const App: React.FC = () => {
  const [view, setView] = useState<View>('RECIPE_LIST');
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | undefined>(undefined);
  const [recipes, setRecipes] = useLocalStorage<Recipe[]>('recipes', INITIAL_RECIPES);
  const [rawMaterials, setRawMaterials] = useLocalStorage<RawMaterial[]>('rawMaterials', INITIAL_RAW_MATERIALS);
  const [families, setFamilies] = useLocalStorage<RecipeFamily[]>('families', INITIAL_FAMILIES);
  const [showFamilyModal, setShowFamilyModal] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<any>(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const sortedRecipes = useMemo(() => 
    [...recipes].sort((a, b) => a.name.localeCompare(b.name)), 
    [recipes]
  );

  const sortedRawMaterials = useMemo(() => 
    [...rawMaterials].sort((a, b) => a.name.localeCompare(b.name)),
    [rawMaterials]
  );
  
  const sortedFamilies = useMemo(() => 
    [...families].sort((a, b) => a.name.localeCompare(b.name)),
    [families]
  );

  const handleInstallClick = () => {
    if (installPrompt) {
      installPrompt.prompt();
      installPrompt.userChoice.then((choiceResult: { outcome: string }) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the A2HS prompt');
        } else {
          console.log('User dismissed the A2HS prompt');
        }
        setInstallPrompt(null);
      });
    }
  };


  const handleSelectRecipe = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    setView('RECIPE_DETAIL');
  };

  const handleNewRecipe = () => {
    setSelectedRecipe(undefined);
    setView('RECIPE_FORM');
  };
  
  const handleEditRecipe = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    setView('RECIPE_FORM');
  }

  const handleSaveRecipe = (recipe: Recipe) => {
    const exists = recipes.some(r => r.id === recipe.id);
    if (exists) {
      setRecipes(recipes.map(r => (r.id === recipe.id ? recipe : r)));
    } else {
      setRecipes([...recipes, recipe]);
    }
    setView('RECIPE_LIST');
    setSelectedRecipe(undefined);
  };
  
  const handleAddFamily = (name: string): RecipeFamily => {
    const newFamily = { id: crypto.randomUUID(), name };
    setFamilies([...families, newFamily]);
    return newFamily;
  };

  const handleUpdateFamily = (id: string, name: string) => {
    setFamilies(families.map(f => f.id === id ? { ...f, name } : f));
  };

  const handleDeleteFamily = (id: string) => {
    setFamilies(families.filter(f => f.id !== id));
    setRecipes(recipes.map(r => r.familyId === id ? { ...r, familyId: undefined } : r));
  };
  
  const renderView = () => {
    switch (view) {
      case 'RECIPE_LIST':
        return <RecipeList 
                    recipes={sortedRecipes} 
                    families={sortedFamilies} 
                    onSelectRecipe={handleSelectRecipe}
                    onNewRecipe={handleNewRecipe}
                    onManageFamilies={() => setShowFamilyModal(true)}
                    installPrompt={installPrompt}
                    handleInstallClick={handleInstallClick}
                />;
      case 'RECIPE_DETAIL':
        if (selectedRecipe) {
          return <RecipeDetail 
                    recipe={selectedRecipe}
                    rawMaterials={sortedRawMaterials}
                    families={sortedFamilies}
                    onBack={() => setView('RECIPE_LIST')}
                    onEdit={handleEditRecipe}
                 />;
        }
        return null;
      case 'RECIPE_FORM':
        return <RecipeForm
                  initialRecipe={selectedRecipe}
                  rawMaterials={sortedRawMaterials}
                  families={sortedFamilies}
                  onSave={handleSaveRecipe}
                  onCancel={() => setView('RECIPE_LIST')}
                  onAddFamily={handleAddFamily}
                />;
      case 'RAW_MATERIALS':
        return <RawMaterials rawMaterials={sortedRawMaterials} setRawMaterials={setRawMaterials} />;
      default:
        return <RecipeList 
                recipes={sortedRecipes} 
                families={sortedFamilies} 
                onSelectRecipe={handleSelectRecipe}
                onNewRecipe={handleNewRecipe}
                onManageFamilies={() => setShowFamilyModal(true)}
                installPrompt={installPrompt}
                handleInstallClick={handleInstallClick}
               />;
    }
  };

  const NavButton: React.FC<{ targetView: View; label: string; icon: React.ReactNode }> = ({ targetView, label, icon }) => {
    const isActive = view === targetView;
    return (
        <button
            onClick={() => setView(targetView)}
            className={`flex flex-col items-center justify-center w-full pt-2 pb-1 transition-colors duration-200 ${isActive ? 'text-accent' : 'text-brown-500 hover:text-brown-900'}`}
        >
            {icon}
            <span className="text-xs">{label}</span>
        </button>
    );
  }

  return (
    <div className="min-h-screen bg-cream text-brown-900 font-sans">
      <main className="pb-20">
        {renderView()}
      </main>

      {showFamilyModal && (
        <FamilyManagementModal
          families={sortedFamilies}
          recipes={recipes}
          onClose={() => setShowFamilyModal(false)}
          onAdd={(name) => handleAddFamily(name)}
          onUpdate={handleUpdateFamily}
          onDelete={handleDeleteFamily}
        />
      )}

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-brown-300 shadow-t-lg flex justify-around no-print">
        <NavButton targetView="RECIPE_LIST" label="Recetas" icon={<BookIcon className="h-6 w-6"/>} />
        <NavButton targetView="RAW_MATERIALS" label="Materias" icon={<PackageIcon className="h-6 w-6"/>} />
      </nav>
    </div>
  );
};

export default App;