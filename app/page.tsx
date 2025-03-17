import { Suspense } from "react";
import { GamesContainer } from "../components/GamesContainer";

export default function Home() {
  return (
    <div className="min-h-screen py-8 px-4">
      <div className="mx-auto flex flex-col items-center">
        <Suspense>
          <GamesContainer />
        </Suspense>
      </div>
    </div>
  );
}
