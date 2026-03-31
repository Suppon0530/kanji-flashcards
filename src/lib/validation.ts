import { z } from "zod/v4";

export const usernameSchema = z
  .string()
  .min(3, "ユーザー名は3文字以上で入力してください。")
  .max(20, "ユーザー名は20文字以内で入力してください。")
  .regex(
    /^[a-zA-Z0-9][a-zA-Z0-9_-]*$/,
    "ユーザー名は英数字で始まり、英数字・アンダースコア・ハイフンのみ使用できます。",
  );

export const signUpSchema = z.object({
  username: usernameSchema,
  password: z.string().min(6, "パスワードは6文字以上で入力してください。"),
});

export const signInSchema = z.object({
  username: usernameSchema,
  password: z.string().min(1, "パスワードを入力してください。"),
});

export const updateEmailSchema = z.object({
  email: z.email("有効なメールアドレスを入力してください。"),
});
