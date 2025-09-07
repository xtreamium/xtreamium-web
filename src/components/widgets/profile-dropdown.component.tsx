import React from 'react';
import { Icons } from '../icons';
import { useAuth } from '@/context/auth.context';

const ProfileDropdown: React.FC = () => {
  const { logout } = useAuth();
  return (
    <div className="dropdown dropdown-bottom dropdown-end">
      <label
        tabIndex={0}
        className="btn btn-ghost rounded-btn px-1.5 hover:bg-base-content/20"
      >
        <div className="flex items-center gap-2">
          <div aria-label="Avatar photo" className="avatar">
            <Icons.user className="w-6 h-6" />
            <Icons.chevronDown className="hidden w-5 h-5 fill-current opacity-60 sm:inline-block" />
          </div>
        </div>
      </label>
      <ul
        tabIndex={0}
        className="z-50 p-2 mt-4 shadow-sm dropdown-content menu bg-base-100 rounded-box w-52"
        role="menu"
      >
        <li>
          <div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
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
        </li>
        <li>
          <div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
              role="img"
              fontSize={16}
              width="1em"
              height="1em"
              viewBox="0 0 24 24"
            >
              <path
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9m4.3 13a1.94 1.94 0 0 0 3.4 0"
              />
            </svg>{' '}
            Notification
          </div>
        </li>
        <hr className="my-1 -mx-2 border-base-content/10" />
        <li>
          <button className="text-error" onClick={() => logout()}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              xlink="http://www.w3.org/1999/xlink"
              aria-hidden="true"
              role="img"
              fontSize={16}
              width="1em"
              height="1em"
              viewBox="0 0 24 24"
            >
              <path
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4m7 14l5-5l-5-5m5 5H9"
              />
            </svg>
            Logout
          </button>
        </li>
      </ul>
    </div>
  );
};

export default ProfileDropdown;
