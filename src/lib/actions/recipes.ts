"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function saveRecipe(recipe: {
  name: string;
  minutes: number;
  matched: string[];
  missing: string[];
  link: string;
}): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const { error } = await supabase.from("saved_recipes").upsert(
    {
      user_id: user.id,
      name: recipe.name,
      minutes: recipe.minutes,
      matched: recipe.matched,
      missing: recipe.missing,
      link: recipe.link,
    },
    { onConflict: "user_id,name" },
  );

  revalidatePath("/fridge");
  return { error: error?.message ?? null };
}

export async function unsaveRecipe(name: string): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const { error } = await supabase.from("saved_recipes").delete().eq("user_id", user.id).eq("name", name);

  revalidatePath("/fridge");
  return { error: error?.message ?? null };
}

export async function passRecipe(name: string): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const { error } = await supabase
    .from("passed_recipes")
    .upsert({ user_id: user.id, name }, { onConflict: "user_id,name" });

  revalidatePath("/fridge");
  return { error: error?.message ?? null };
}

export async function unpassAllRecipes(): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const { error } = await supabase.from("passed_recipes").delete().eq("user_id", user.id);

  revalidatePath("/fridge");
  return { error: error?.message ?? null };
}
