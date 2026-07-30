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
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");

  await supabase.from("saved_recipes").upsert(
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
}

export async function unsaveRecipe(name: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");

  await supabase.from("saved_recipes").delete().eq("user_id", user.id).eq("name", name);

  revalidatePath("/fridge");
}

export async function passRecipe(name: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");

  await supabase
    .from("passed_recipes")
    .upsert({ user_id: user.id, name }, { onConflict: "user_id,name" });

  revalidatePath("/fridge");
}

export async function unpassAllRecipes() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");

  await supabase.from("passed_recipes").delete().eq("user_id", user.id);

  revalidatePath("/fridge");
}
