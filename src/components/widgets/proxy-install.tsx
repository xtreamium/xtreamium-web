import { Icons } from "@/components/icons";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const ProxyInstallComponent: React.FC = () => {
  return (
    <Tabs defaultValue="windows" className="px-4 py-3 mb-8">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="windows">Windows</TabsTrigger>
        <TabsTrigger value="linux">Linux</TabsTrigger>
        <TabsTrigger value="mac">Mac</TabsTrigger>
      </TabsList>
      <TabsContent value="windows">
        <div className="flex flex-col justify-between gap-2 px-4 mt-4 text-md md:flex-row">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Icons.download className="inline-block w-4 h-4 fill-current" />
              <div>
                Download{" "}
                <a
                  target="_blank"
                  rel="noopener, noreferrer"
                  className="link"
                  href="https://github.com/saadeghi/daisyui/discussions"
                >
                  installer
                </a>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Icons.winget className="inline-block w-4 h-4 fill-current" />
              <div>
                Install using{" "}
                <a
                  target="_blank"
                  rel="noopener, noreferrer"
                  className="link"
                  href="https://github.com/saadeghi/daisyui/discussions"
                >
                  winget
                </a>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Icons.chocolatey className="inline-block w-4 h-4 fill-current" />
              <div>
                Install using{" "}
                <a
                  target="_blank"
                  rel="noopener, noreferrer"
                  className="link"
                  href="https://github.com/saadeghi/daisyui/discussions"
                >
                  chocolatey
                </a>
              </div>
            </div>
          </div>
        </div>
      </TabsContent>
      <TabsContent value="linux">Linux</TabsContent>
      <TabsContent value="mac">Mac</TabsContent>
    </Tabs>
  );
};

export default ProxyInstallComponent;
