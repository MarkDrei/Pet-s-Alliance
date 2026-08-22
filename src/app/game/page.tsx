import type { Metadata } from "next";
import { GameScreen } from "@/components/GameScreen";

export const metadata: Metadata = {
  title: "Pet's Alliance — Der Teppich",
};

export default function GamePage() {
  return <GameScreen />;
}
