"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/vault");
  }, [router]);

  return (
    <div className="min-h-screen bg-obsidian flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-neon-cyan/20 border-t-neon-cyan rounded-full animate-spin" />
    </div>
  );
}
