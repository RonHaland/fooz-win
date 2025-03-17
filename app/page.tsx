import { Suspense } from "react";
import { GamesContainer } from "../components/GamesContainer";
import { SoccerballIcon } from "@/components/icons/SoccerballIcon";

export default function Home() {
  return (
    <div className="min-h-screen py-8 px-4">
      <div className="mx-auto flex flex-col items-center">
        <SoccerballIcon className="h-10 w-10 mb-4" />
        <Suspense>
          <GamesContainer />
        </Suspense>
      </div>
    </div>
  );
}
