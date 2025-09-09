import { AppLayout } from "@/components/layouts/app-layout";

function App() {
  return (
    <AppLayout>
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-card p-6 rounded-lg border">
            <h2 className="text-xl font-semibold mb-2">Welcome</h2>
            <p className="text-muted-foreground">
              This is your main content area. The layout is fully responsive and
              includes a collapsible sidebar for mobile devices.
            </p>
          </div>
          <div className="bg-card p-6 rounded-lg border">
            <h2 className="text-xl font-semibold mb-2">Features</h2>
            <ul className="text-muted-foreground space-y-1">
              <li>• Responsive design</li>
              <li>• Mobile-friendly sidebar</li>
              <li>• shadcn/ui components</li>
              <li>• Dark mode support</li>
            </ul>
          </div>
          <div className="bg-card p-6 rounded-lg border">
            <h2 className="text-xl font-semibold mb-2">Navigation</h2>
            <p className="text-muted-foreground">
              Use the sidebar to navigate between different sections of your
              app.
            </p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

export default App;
