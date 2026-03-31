"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  signUpSchema,
  signInSchema,
  updateEmailSchema,
} from "@/lib/validation";

const PLACEHOLDER_EMAIL_DOMAIN = "zubokan.noreply";

// --- プライベートヘルパー ---

async function performSignUp(username: string, password: string) {
  const supabase = await createClient();

  // ユーザー名の重複チェック
  const { data: isAvailable, error: rpcError } = await supabase.rpc(
    "check_username_available",
    { p_username: username },
  );

  if (rpcError) {
    return {
      error: "アカウントの作成に失敗しました。しばらくしてからお試しください。",
    };
  }

  if (isAvailable === false) {
    return { error: "このユーザー名はすでに使用されています。" };
  }

  const placeholderEmail = `${username.toLowerCase()}@${PLACEHOLDER_EMAIL_DOMAIN}`;

  const { error } = await supabase.auth.signUp({
    email: placeholderEmail,
    password,
    options: {
      data: {
        username: username.toLowerCase(),
        display_name: username,
      },
    },
  });

  if (error) {
    return {
      error: "アカウントの作成に失敗しました。しばらくしてからお試しください。",
    };
  }

  return { success: true as const };
}

async function performSignIn(username: string, password: string) {
  const supabase = await createClient();

  // ユーザー名からメールアドレスを取得
  const { data: email } = await supabase.rpc("get_email_by_username", {
    p_username: username,
  });

  if (!email) {
    return { error: "ユーザー名またはパスワードが正しくありません。" };
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: "ユーザー名またはパスワードが正しくありません。" };
  }

  return { success: true as const };
}

// --- ページ用アクション（redirect あり） ---

export async function signUp(formData: FormData) {
  const parsed = signUpSchema.safeParse({
    username: formData.get("username"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const result = await performSignUp(parsed.data.username, parsed.data.password);
  if ("error" in result) return { error: result.error };

  revalidatePath("/", "layout");
  redirect("/");
}

export async function signIn(formData: FormData) {
  const parsed = signInSchema.safeParse({
    username: formData.get("username"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: "ユーザー名とパスワードを入力してください。" };
  }

  const result = await performSignIn(parsed.data.username, parsed.data.password);
  if ("error" in result) return { error: result.error };

  revalidatePath("/", "layout");
  redirect("/");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}

// --- モーダル用アクション（redirect なし） ---

export async function signUpFromModal(formData: FormData) {
  const parsed = signUpSchema.safeParse({
    username: formData.get("username"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const result = await performSignUp(parsed.data.username, parsed.data.password);
  if ("error" in result) return result;

  revalidatePath("/", "layout");
  return { success: true as const };
}

export async function signInFromModal(formData: FormData) {
  const parsed = signInSchema.safeParse({
    username: formData.get("username"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: "ユーザー名とパスワードを入力してください。" };
  }

  const result = await performSignIn(parsed.data.username, parsed.data.password);
  if ("error" in result) return result;

  revalidatePath("/", "layout");
  return { success: true as const };
}

export async function signOutFromModal() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  return { success: true as const };
}

// --- 共通アクション ---

export async function updateEmail(formData: FormData) {
  const parsed = updateEmailSchema.safeParse({
    email: formData.get("email"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message, success: false };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({
    email: parsed.data.email,
  });

  if (error) {
    return { error: "メールアドレスの更新に失敗しました。", success: false };
  }

  return {
    error: null,
    success: true,
    message:
      "確認メールを送信しました。メール内のリンクをクリックして確認してください。",
  };
}

export async function getProfile() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data } = await supabase
    .from("profiles")
    .select("username, display_name")
    .eq("id", user.id)
    .single();

  const hasRealEmail = !user.email?.endsWith(`@${PLACEHOLDER_EMAIL_DOMAIN}`);

  return {
    username: data?.username ?? "",
    displayName: data?.display_name ?? "",
    email: hasRealEmail ? (user.email ?? null) : null,
  };
}
