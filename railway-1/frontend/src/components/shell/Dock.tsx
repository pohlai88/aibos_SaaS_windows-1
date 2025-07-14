'use client';

interface App {
  id: string;
  name: string;
  icon: string;
}

interface DockProps {
  apps: App[];
  onAppClick: (appId: string) => void;
}

export function Dock({ apps, onAppClick }: DockProps) {
  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-40">
      <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-gray-200 px-4 py-3">
        <div className="flex items-center space-x-2">
          {apps.map((app) => (
            <button
              key={app.id}
              onClick={() => onAppClick(app.id)}
              className="dock-item flex flex-col items-center p-3 rounded-xl hover:bg-gray-100 transition-all duration-200 group"
              title={app.name}
            >
              <div className="text-2xl mb-1 group-hover:scale-110 transition-transform duration-200">
                {app.icon}
              </div>
              <span className="text-xs font-medium text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                {app.name}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
} 