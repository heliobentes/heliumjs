import type { LayoutProps } from "helium/client";
import { Link, useFetch } from "helium/client";
import { getProfile } from "helium/server";
import HeliumLogo from "../components/Logo";

export default function RootLayout({ children }: LayoutProps) {
  const { data: profile } = useFetch(getProfile);

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">
      <header className="border-b border-gray-300 bg-white">
        <div className="max-w-4xl mx-auto px-4 py-2 flex items-center gap-8">
          <HeliumLogo />
          <nav className="space-x-4 font-medium">
            <Link href="/" className="text-gray-700 hover:text-teal-600">
              Home
            </Link>
            <Link href="/tasks" className="text-gray-700 hover:text-teal-600">
              Tasks
            </Link>
            <Link
              href="/settings/profile"
              className="text-gray-700 hover:text-teal-600"
            >
              Profile
            </Link>
          </nav>
          <div className="ml-auto">
            Hi,{" "}
            <span className="font-semibold">{profile?.name || "Guest"}</span>
          </div>
        </div>
      </header>
      <main className="max-w-4xl mx-auto p-4">{children}</main>
    </div>
  );
}
