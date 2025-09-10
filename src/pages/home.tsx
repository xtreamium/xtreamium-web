import { Icons } from "@/components/icons";
import ProxyInstallComponent from "@/components/widgets/proxy-install";

function HomePage() {
  return (
    <div className="container grid px-6 mx-auto">
      <h1 className="my-6 text-2xl font-semibold ">Welcome to xtreamium</h1>
      <div className="flex items-center justify-between p-4 mb-8 alert bg-accent">
        <div className="flex items-center">
          <Icons.info className="w-5 h-5 mr-2 text-secondary" />
          <span className="text-secondary-content">
            If you wish to play locally or schedule recordings then please
            follow the below instructions!
          </span>
        </div>
      </div>
      <div className="mb-4">
        <h2 className="mb-4 text-lg font-semibold ">Proxy Setup</h2>
        <ProxyInstallComponent />
      </div>
      <h2 className="mb-4 text-lg font-semibold ">mpv Setup</h2>
      <div className="px-4 py-3 mb-8 rounded-lg shadow-md ">
        <label className="block text-md ">
          <span>
            <a href="https://mpv.io/" target="_blank" rel="noreferrer">
              Follow the instructions for your operating system to install mpv
            </a>
          </span>
        </label>
      </div>
      <h2 className="mb-4 text-lg font-semibold ">mpv params</h2>
      <div className="px-4 py-3 mb-8 rounded-lg shadow-md ">
        <label className="block text-md">
          <span>
            Default mpv params are
            <div
              className="block p-6 text-sm whitespace-pre"
              dangerouslySetInnerHTML={{
                __html:
                  import.meta.env.VITE_MPV_DEFAULTS?.replace(" ", "<br />") ??
                  "",
              }}
            ></div>
            Change them in your settings
          </span>
        </label>
      </div>
    </div>
  );
}

export default HomePage;
