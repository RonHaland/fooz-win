"use client";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";

export default function TournamentPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const pathname = usePathname();

  const isOverview = pathname.endsWith("/overview");
  const isAdmin = pathname.endsWith("/admin");

  if (!isOverview && !isAdmin) {
    router.replace(`/tournament/${params.id}/overview`);
  }
}
