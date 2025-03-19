"use client";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import { use } from "react";

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

  if (!isOverview && !isAdmin) {
    router.replace(`/tournament/${id}/overview`);
  }
}
