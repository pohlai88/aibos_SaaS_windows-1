// ... existing code ...

// In the navbar section, replace the search with:
<div className="flex items-center gap-4">
  <CommandPalette />
  
  {/* Theme Toggle */}
  <button className="apple-button-ghost">
    <Sun className="w-5 h-5" />
  </button>
  
  {/* Notifications */}
  <button className="apple-button-ghost relative">
    <Bell className="w-5 h-5" />
    <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full" />
  </button>
  
  {/* Profile */}
  <button className="apple-button-ghost">
    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full" />
  </button>
</div>

// ... existing code ...