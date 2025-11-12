export type Unit = 'g' | 'kg' | 'ml' | 'l' | 'unit';

export interface RawMaterial {
  id: string;
  name: string;
  price: number;
  packageSize: number;
  unit: Unit;
}

export interface Ingredient {
  rawMaterialId: string;
  quantity: number;
  unit: Unit;
}

export interface RecipeFamily {
  id: string;
  name:string;
}

export interface Recipe {
  id: string;
  name: string;
  description: string;
  familyId?: string;
  yieldAmount: number;
  yieldUnit: string;
  ingredients: Ingredient[];
  instructions: string[];
}

export type View = 'RECIPE_LIST' | 'RECIPE_DETAIL' | 'RECIPE_FORM' | 'RAW_MATERIALS';