import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";
import { Icons } from "./icons";

const ProxyInstallComponent: React.FC = () => {
  return (
    <TabGroup className="px-4 py-3 mb-8">
      <TabList className="tabs tabs-lifted -mb-(--tab-border) ">
        <Tab className="tab">Windows</Tab>
        <Tab className="tab">Linux</Tab>
        <Tab className="tab">Mac</Tab>
      </TabList>
      <TabPanels>
        <TabPanel>
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
        </TabPanel>
        <TabPanel>Linux</TabPanel>
        <TabPanel>Mac</TabPanel>
      </TabPanels>
    </TabGroup>
  );
};

export default ProxyInstallComponent;
