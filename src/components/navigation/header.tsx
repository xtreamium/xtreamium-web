import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";

export function Header() {
  return (
    <header className="w-full border-b bg-background">
      <div className="flex h-14 items-center px-4">
        <SidebarTrigger />
        <Separator orientation="vertical" className="mx-2 h-4" />
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-semibold">Xtreamium</h1>
        </div>
      </div>
    </header>
  );
}
