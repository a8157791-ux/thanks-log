// Lightweight "냉장고 재료 → 메뉴" matching engine.
// No external AI call: ranks a small home-cooking knowledge base against
// whatever's currently in the fridge/freezer/kimchi fridge, so it works
// instantly and offline. Each result links out to a recipe search.

export type Recipe = {
  name: string;
  ingredients: string[];
  minutes: number;
};

export type RecipeMatch = {
  name: string;
  minutes: number;
  matched: string[];
  missing: string[];
  link: string;
};

const RECIPES: Recipe[] = [
  { name: "두부 애호박 계란찜", ingredients: ["두부", "애호박", "계란", "대파"], minutes: 20 },
  { name: "애호박 대파 계란볶음밥", ingredients: ["애호박", "대파", "계란", "밥"], minutes: 15 },
  { name: "두부 애호박 된장국", ingredients: ["두부", "애호박", "대파"], minutes: 25 },
  { name: "김치만두전골", ingredients: ["만두", "배추김치", "대파", "두부"], minutes: 25 },
  { name: "김치볶음밥", ingredients: ["배추김치", "밥", "계란", "대파"], minutes: 15 },
  { name: "돼지고기 김치찌개", ingredients: ["돼지고기", "배추김치", "두부", "대파"], minutes: 30 },
  { name: "참치 김치찌개", ingredients: ["참치", "배추김치", "두부", "대파"], minutes: 25 },
  { name: "깍두기 볶음밥", ingredients: ["깍두기", "밥", "계란"], minutes: 15 },
  { name: "새우 애호박 볶음", ingredients: ["새우", "애호박", "양파"], minutes: 15 },
  { name: "새우 계란 볶음밥", ingredients: ["새우", "계란", "밥", "대파"], minutes: 15 },
  { name: "콩나물국", ingredients: ["콩나물", "대파", "두부"], minutes: 15 },
  { name: "소고기 무국", ingredients: ["소고기", "무", "대파"], minutes: 25 },
  { name: "감자 당근 볶음", ingredients: ["감자", "당근", "양파"], minutes: 15 },
  { name: "감자채 계란전", ingredients: ["감자", "계란"], minutes: 15 },
  { name: "어묵 야채볶음", ingredients: ["어묵", "양파", "당근", "대파"], minutes: 15 },
  { name: "김치 어묵볶음", ingredients: ["배추김치", "어묵", "대파"], minutes: 15 },
  { name: "스팸 김치볶음밥", ingredients: ["스팸", "배추김치", "밥", "계란"], minutes: 15 },
  { name: "스팸 계란구이", ingredients: ["스팸", "계란"], minutes: 10 },
  { name: "참치마요 덮밥", ingredients: ["참치", "밥", "계란", "대파"], minutes: 10 },
  { name: "시금치 된장국", ingredients: ["시금치", "두부", "대파"], minutes: 15 },
  { name: "버섯 두부 전골", ingredients: ["버섯", "두부", "대파", "애호박"], minutes: 25 },
  { name: "만두전", ingredients: ["만두", "계란"], minutes: 15 },
  { name: "만둣국", ingredients: ["만두", "대파", "계란"], minutes: 20 },
  { name: "소고기 미역국", ingredients: ["소고기", "미역"], minutes: 25 },
  { name: "제육볶음", ingredients: ["돼지고기", "양파", "대파"], minutes: 20 },
  { name: "닭볶음탕", ingredients: ["닭고기", "감자", "당근", "양파"], minutes: 40 },
  { name: "콩나물 불고기", ingredients: ["콩나물", "소고기", "대파"], minutes: 20 },
  { name: "애호박전", ingredients: ["애호박", "계란"], minutes: 15 },
  { name: "두부조림", ingredients: ["두부", "대파", "양파"], minutes: 20 },
  { name: "다진고기 애호박 볶음", ingredients: ["다진고기", "애호박", "양파"], minutes: 15 },
];

function normalize(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, "");
}

function ingredientMatches(fridgeName: string, recipeIngredient: string): boolean {
  const a = normalize(fridgeName);
  const b = normalize(recipeIngredient);
  if (!a || !b) return false;
  return a.includes(b) || b.includes(a);
}

function recipeLink(name: string): string {
  return `https://www.10000recipe.com/recipe/list.html?q=${encodeURIComponent(name)}`;
}

/** Rank the recipe book against whatever's currently in the fridge. */
export function recommendRecipes(fridgeItemNames: string[], limit = 6): RecipeMatch[] {
  const names = fridgeItemNames.filter((n) => n.trim().length > 0);
  if (names.length === 0) return [];

  return RECIPES.map((recipe) => {
    const matched = recipe.ingredients.filter((ing) =>
      names.some((f) => ingredientMatches(f, ing)),
    );
    const missing = recipe.ingredients.filter((ing) => !matched.includes(ing));
    return {
      name: recipe.name,
      minutes: recipe.minutes,
      matched,
      missing,
      score: matched.length / recipe.ingredients.length,
      link: recipeLink(recipe.name),
    };
  })
    .filter((r) => r.matched.length >= Math.min(2, r.matched.length + r.missing.length))
    .sort((a, b) => b.score - a.score || b.matched.length - a.matched.length)
    .slice(0, limit)
    .map(({ name, minutes, matched, missing, link }) => ({ name, minutes, matched, missing, link }));
}
