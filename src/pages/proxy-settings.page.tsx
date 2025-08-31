const ProxySettingsPage: React.FC = () => {
  return (
    <div className="min-h-screen p-4 bg-base-100">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-base-content">
            Proxy Settings
          </h1>
          <p className="mt-2 text-base-content/70">
            Configure your proxy settings to optimize streaming performance
          </p>
        </div>

        <div className="mt-6 shadow-lg card bg-base-200">
          <div className="card-body">
            <h2 className="card-title text-warning">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              General Settings
            </h2>

            <div className="space-y-4">
              <div className="w-full form-control">
                <label className="label">
                  <span className="font-medium label-text">
                    MPV command line arguments
                  </span>
                </label>
                <textarea
                  className="h-24 textarea textarea-bordered"
                  placeholder=""
                ></textarea>
                <label className="label">
                  <span className="label-text-alt">Use \ for line breaks.</span>
                </label>
              </div>

              <div className="w-full form-control">
                <label className="label">
                  <span className="font-medium label-text">Port Number</span>
                </label>
                <input
                  type="number"
                  placeholder="8080"
                  className="w-full input input-bordered"
                  min="1"
                  max="65535"
                />
                <label className="label">
                  <span className="label-text-alt">
                    Enter a port number between 1 and 65535.
                  </span>
                </label>
              </div>

              <div className="w-full form-control">
                <label className="label">
                  <span className="font-medium label-text">
                    Recordings Path
                  </span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="/home/user/recordings"
                    className="flex-1 input input-bordered"
                    readOnly
                  />
                  <input
                    type="file"
                    className="hidden"
                    id="recordings-path"
                    {...({ webkitdirectory: 'true' } as any)}
                  />
                  <label htmlFor="recordings-path" className="btn btn-outline">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-5L12 5H5a2 2 0 00-2 2z"
                      />
                    </svg>
                    Browse
                  </label>
                </div>
                <label className="label">
                  <span className="label-text-alt">
                    Select a folder where recordings will be saved.
                  </span>
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 mt-8 sm:flex-row sm:justify-end">
          <button className="btn btn-outline">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Reset to Defaults
          </button>
          <button className="btn btn-secondary">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            Test Connection
          </button>
          <button className="btn btn-primary">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
              />
            </svg>
            Save Settings
          </button>
        </div>

        {/* Help Section */}
        <div className="mt-8 alert alert-info">
          <svg
            className="w-6 h-6 shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div>
            <h3 className="font-bold">Need help?</h3>
            <div className="text-sm">
              Proxy settings help route your streaming traffic through a secure
              connection. Contact your network administrator if you're unsure
              about these settings.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProxySettingsPage;
