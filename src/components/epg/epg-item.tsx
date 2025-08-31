import {
  Popover,
  PopoverButton,
  PopoverPanel,
  Transition
} from '@headlessui/react';
import React, { Fragment } from 'react';
import { Icons } from '../icons';
import { dateToTimeString } from '@/utils/date-utils';

type EpgItemProps = {
  channelUrl: string;
  title: string;
  description: string;
  startTime: number;
  endTime: number;
};

const EpgItem: React.FC<EpgItemProps> = ({
  channelUrl,
  title,
  description,
  startTime,
  endTime
}) => {
  const [isHover, setIsHover] = React.useState(false);
  const recordShow = async (
    channelUrl: string,
    startTime: number,
    endTime: number
  ) => {
    const response = await fetch(`${import.meta.env.VITE_PROXY_URL}/record`, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain'
      },
      body: JSON.stringify({
        url: channelUrl,
        startTime: startTime,
        endTime: endTime
      })
    });

    console.log('epg-item', 'recordShow', response);
  };

  return (
    <div className="w-60">
      <Popover className="relative">
        {({}) => (
          <>
            <PopoverButton
              className="w-full h-full p-2 text-left hover:bg-base-200/50 transition-colors duration-150 rounded-none border-none bg-transparent focus:outline-none focus:ring-0"
              onMouseOver={() => {
                setIsHover(true);
              }}
              onMouseLeave={() => {
                setTimeout(() => {
                  setIsHover(false);
                }, 1000);
              }}
            >
              <span className="text-sm font-medium truncate block text-base-content">
                {title}
              </span>
            </PopoverButton>
            <Transition
              show={isHover}
              as={Fragment}
              enter="transition ease-out duration-200"
              enterFrom="opacity-0 translate-y-1"
              enterTo="opacity-100 translate-y-0"
              leave="transition ease-in duration-150"
              leaveFrom="opacity-100 translate-y-0"
              leaveTo="opacity-0 translate-y-1"
            >
              <PopoverPanel
                anchor="top"
                className="z-50"
                onMouseLeave={() => {
                  setIsHover(false);
                }}
              >
                <div className="tooltip tooltip-open tooltip-top">
                  <div className="bg-base-100 border border-base-300 rounded-lg shadow-xl p-0 w-80 max-w-sm">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-primary to-primary-focus px-4 py-3 rounded-t-lg">
                      <h3 className="text-primary-content font-semibold text-base leading-tight">
                        {title}
                      </h3>
                    </div>
                    
                    {/* Content */}
                    <div className="p-4 space-y-3">
                      <p className="text-base-content text-sm leading-relaxed">
                        {description}
                      </p>
                      
                      {/* Footer with time and button */}
                      <div className="flex items-center justify-between pt-2 border-t border-base-200">
                        <div className="badge badge-accent badge-outline text-xs font-medium">
                          {dateToTimeString(new Date(startTime))} - {dateToTimeString(new Date(endTime))}
                        </div>
                        <button
                          className="btn btn-error btn-xs gap-1 text-xs"
                          onClick={async () =>
                            await recordShow(channelUrl, startTime, endTime)
                          }
                        >
                          <Icons.record className="w-3 h-3" />
                          Record
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </PopoverPanel>
            </Transition>
          </>
        )}
      </Popover>
    </div>
  );
};
export default EpgItem;
