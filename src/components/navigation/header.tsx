import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";

export function Header() {
  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
      <SidebarTrigger />
      <Separator orientation="vertical" className="h-4" />
      <div className="flex items-center gap-2">
        <h1 className="text-lg font-semibold">Xtreamium</h1>
      </div>
    </header>
  );
}
