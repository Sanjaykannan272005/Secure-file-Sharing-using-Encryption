import { useState } from 'react';
import { useTheme } from './ThemeProvider';

export default function ThemeCustomizer() {
  const { theme, colorScheme, layout, toggleTheme, changeColorScheme, changeLayout } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const colorSchemes = [
    { name: 'Blue', value: 'blue', color: 'bg-blue-500' },
    { name: 'Green', value: 'green', color: 'bg-green-500' },
    { name: 'Purple', value: 'purple', color: 'bg-purple-500' },
    { name: 'Red', value: 'red', color: 'bg-red-500' },
    { name: 'Orange', value: 'orange', color: 'bg-orange-500' },
    { name: 'Pink', value: 'pink', color: 'bg-pink-500' }
  ];

  return (
    <>
      {/* Theme Toggle Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 p-3 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 transition-colors z-40"
        title="Customize Theme"
      >
        🎨
      </button>

      {/* Theme Customizer Panel */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold dark:text-white">🎨 Customize Theme</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                ✕
              </button>
            </div>

            {/* Dark/Light Mode */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3 dark:text-white">🌓 Theme Mode</h3>
              <div className="flex space-x-3">
                <button
                  onClick={toggleTheme}
                  className={`flex-1 p-3 rounded-lg border-2 transition-colors ${
                    theme === 'light'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 hover:border-gray-400 dark:border-gray-600 dark:hover:border-gray-500'
                  }`}
                >
                  ☀️ Light
                </button>
                <button
                  onClick={toggleTheme}
                  className={`flex-1 p-3 rounded-lg border-2 transition-colors ${
                    theme === 'dark'
                      ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                      : 'border-gray-300 hover:border-gray-400 dark:border-gray-600 dark:hover:border-gray-500'
                  }`}
                >
                  🌙 Dark
                </button>
              </div>
            </div>

            {/* Color Schemes */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3 dark:text-white">🎨 Color Scheme</h3>
              <div className="grid grid-cols-3 gap-3">
                {colorSchemes.map((scheme) => (
                  <button
                    key={scheme.value}
                    onClick={() => changeColorScheme(scheme.value)}
                    className={`p-3 rounded-lg border-2 transition-colors ${
                      colorScheme === scheme.value
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900'
                        : 'border-gray-300 hover:border-gray-400 dark:border-gray-600 dark:hover:border-gray-500'
                    }`}
                  >
                    <div className={`w-6 h-6 ${scheme.color} rounded-full mx-auto mb-1`}></div>
                    <div className="text-xs dark:text-white">{scheme.name}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Layout Options */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3 dark:text-white">📐 Layout</h3>
              <div className="space-y-2">
                {[
                  { name: 'Compact', value: 'compact', icon: '📱' },
                  { name: 'Comfortable', value: 'comfortable', icon: '💻' },
                  { name: 'Spacious', value: 'spacious', icon: '🖥️' }
                ].map((layoutOption) => (
                  <button
                    key={layoutOption.value}
                    onClick={() => changeLayout(layoutOption.value)}
                    className={`w-full p-3 rounded-lg border-2 transition-colors text-left ${
                      layout === layoutOption.value
                        ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                        : 'border-gray-300 hover:border-gray-400 dark:border-gray-600 dark:hover:border-gray-500 dark:text-white'
                    }`}
                  >
                    <span className="mr-2">{layoutOption.icon}</span>
                    {layoutOption.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Preview */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3 dark:text-white">👀 Preview</h3>
              <div className="p-4 border rounded-lg dark:border-gray-600">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-8 h-8 bg-blue-500 rounded-full"></div>
                  <div>
                    <div className="font-medium dark:text-white">Sample File.pdf</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">2.5 MB</div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button className="px-3 py-1 bg-blue-500 text-white text-sm rounded">
                    Share
                  </button>
                  <button className="px-3 py-1 bg-gray-500 text-white text-sm rounded">
                    Delete
                  </button>
                </div>
              </div>
            </div>

            {/* Reset Button */}
            <button
              onClick={() => {
                changeColorScheme('blue');
                changeLayout('comfortable');
                localStorage.removeItem('theme');
                localStorage.removeItem('colorScheme');
                localStorage.removeItem('layout');
              }}
              className="w-full p-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              🔄 Reset to Default
            </button>
          </div>
        </div>
      )}
    </>
  );
}