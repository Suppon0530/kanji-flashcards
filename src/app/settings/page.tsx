import { redirect } from "next/navigation";
import { TopHeader } from "@/components/TopHeader";
import { TopFooter } from "@/components/TopFooter";
import { SettingsForm } from "@/components/SettingsForm";
import { getProfile } from "@/server/actions/auth-actions";

export default async function SettingsPage() {
  const profile = await getProfile();

  if (!profile) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <TopHeader />

      <main className="flex-1 px-4 py-8">
        <div className="mx-auto max-w-2xl">
          <h1 className="mb-6 text-lg font-semibold">設定</h1>
          <SettingsForm
            username={profile.username}
            email={profile.email}
          />
        </div>
      </main>

      <TopFooter />
    </div>
  );
}
