"use client";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import { use, useEffect } from "react";

export default function TournamentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { id } = use(params);

  const isOverview = pathname.endsWith("/overview");
  const isAdmin = pathname.endsWith("/admin");

  useEffect(() => {
    if (!isOverview && !isAdmin) {
      router.replace(`/tournament/${id}/overview`);
    }
  }, [isOverview, isAdmin, id, router]);

  return null;
}
