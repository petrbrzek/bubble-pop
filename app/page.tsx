import BubbleGame from "@/components/BubbleGame";
import MacalyBadge from "@/components/MacalyBadge";

export default function Home() {
  return (
    <main className="w-full h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 overflow-hidden">
      <BubbleGame />
      <MacalyBadge />
    </main>
  );
}