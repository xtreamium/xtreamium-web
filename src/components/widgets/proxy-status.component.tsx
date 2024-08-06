import React from 'react';
import { Icons } from '@/components/icons';
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import * as signalR from '@microsoft/signalr';
import { clsx } from 'clsx';

const ProxyStatus: React.FC = () => {
  let connection;
  enum ConnectionState {
    Checking,
    Connected,
    Disconnected
  }
  const [connectionState, setConnectionState] = React.useState<ConnectionState>(
    ConnectionState.Checking
  );
  const [iconClass, setIconClass] = React.useState('w-6 h-6 text-red-600');
  React.useEffect(() => {
    connection = new signalR.HubConnectionBuilder()
      .withUrl('http://localhost:5000/hubs/proxyStatus')
      .configureLogging(signalR.LogLevel.Information)
      .build();

    connection
      .start()
      .then(() => {
        setConnectionState(ConnectionState.Connected);
      })
      .catch((err) => {
        console.error('proxy-status.component', 'CreatingConnection', err);
        setConnectionState(ConnectionState.Disconnected);
      });

    connection.on('ServerMessage', (message) => {
      console.log('proxy-status.component', 'ServerMessage', message);
    });
  }, []);

  React.useEffect(() => {
    setIconClass(
      clsx(
        'w-6',
        'h-6',
        connectionState === ConnectionState.Checking
          ? 'animate-spin text-orange-700'
          : connectionState === ConnectionState.Connected
          ? 'text-green-600'
          : 'text-red-600'
      )
    );
    console.log('proxy-status.component', 'Icon class is', iconClass);
  }, [connectionState]);

  return (
    <div className="px-2">
      <Menu>
        <MenuButton>
          {connectionState === ConnectionState.Checking ? (
            <Icons.loader className={clsx(iconClass, 'animate-spin text-orange-700')} />
          ) : (
            <Icons.proxy className={iconClass} />
          )}
        </MenuButton>
        <MenuItems
          anchor="bottom"
          className="z-50 p-2 mt-4 shadow dropdown-content menu bg-base-100 rounded-box w-52"
        >
          <MenuItem>
            <a href="#">
              <Icons.settings className="w-2 h-2" />
              Proxy Settings
            </a>
          </MenuItem>
          <MenuItem>
            <div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                xmlnsXlink="http://www.w3.org/1999/xlink"
                aria-hidden="true"
                role="img"
                fontSize={16}
                width="1em"
                height="1em"
                viewBox="0 0 24 24"
              >
                <g
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                >
                  <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </g>
              </svg>
              My Profile
            </div>
          </MenuItem>
        </MenuItems>
      </Menu>
    </div>
  );
};

export default ProxyStatus;
