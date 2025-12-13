import { useState, useRef, useEffect } from 'react';

interface EditorIframeProps {
  src: string;
  title?: string;
}

interface SizeState {
  width: string;
  height: string;
}

export default function EditorIframe({ src, title = 'Editor' }: EditorIframeProps) {
  const [size, setSize] = useState<SizeState>({ width: '100%', height: '600px' });
  const [isResizing, setIsResizing] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const presets = [
    { name: 'Desktop', icon: '🖥️', width: '100%', height: '600px' },
    { name: 'Tablet', icon: '📱', width: '768px', height: '600px' },
    { name: 'Mobile', icon: '📱', width: '375px', height: '667px' },
  ];

  // Handle resize via drag
  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);

    const startX = e.clientX;
    const startY = e.clientY;
    const container = (e.target as HTMLElement).closest('.iframe-container') as HTMLElement;
    const startWidth = container.offsetWidth;
    const startHeight = container.offsetHeight;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const newWidth = Math.max(320, startWidth + (moveEvent.clientX - startX));
      const newHeight = Math.max(400, startHeight + (moveEvent.clientY - startY));
      setSize({ width: `${newWidth}px`, height: `${newHeight}px` });
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // Communication with iframe
  const sendMessageToIframe = (action: string, data?: any) => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage({ action, ...data }, '*');
    }
  };

  // Listen for messages from iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin === new URL(src).origin) {
        console.log('Message from iframe:', event.data);
        // Handle messages from iframe (component selected, etc.)
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [src]);

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div className="flex gap-2">
          {presets.map((preset) => (
            <button
              key={preset.name}
              onClick={() => setSize({ width: preset.width, height: preset.height })}
              className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-sm font-medium flex items-center gap-2"
              title={`${preset.name} view`}
            >
              <span>{preset.icon}</span>
              <span className="hidden sm:inline">{preset.name}</span>
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => sendMessageToIframe('toggleTheme')}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
            title="Toggle theme"
          >
            🌙 Tema
          </button>
          <button
            onClick={() => {
              const iframe = iframeRef.current;
              if (iframe) {
                window.open(iframe.src, '_blank');
              }
            }}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
            title="Open in new tab"
          >
            🔗 Nueva Tab
          </button>
        </div>
      </div>

      {/* Iframe Container */}
      <div
        className={`iframe-container relative border-4 border-gray-200 rounded-lg overflow-hidden mx-auto transition-shadow ${
          isResizing ? 'shadow-2xl' : 'shadow-xl'
        }`}
        style={{ width: size.width, maxWidth: '100%' }}
      >
        {/* Header Bar */}
        <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-2 flex justify-between items-center z-10">
          <span className="text-sm font-medium flex items-center gap-2">
            <span className="hidden sm:inline">{title}</span>
            <span className="text-xs bg-white/20 px-2 py-1 rounded">
              {size.width} × {size.height}
            </span>
          </span>
          <div className="flex gap-2">
            <div className="flex gap-1">
              <div className="w-3 h-3 rounded-full bg-red-400"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
              <div className="w-3 h-3 rounded-full bg-green-400"></div>
            </div>
          </div>
        </div>

        {/* Iframe */}
        <iframe
          ref={iframeRef}
          src={src}
          className="w-full border-0 pt-10"
          style={{ height: size.height }}
          title={title}
          loading="lazy"
        />

        {/* Resize Handle */}
        <div
          className="absolute bottom-0 right-0 w-10 h-10 bg-purple-600 cursor-nwse-resize hover:bg-purple-700 transition-colors z-20 flex items-end justify-end"
          style={{ clipPath: 'polygon(100% 0, 100% 100%, 0 100%)' }}
          onMouseDown={handleResizeStart}
          title="Drag to resize"
        >
          <svg
            className="w-4 h-4 text-white mb-1 mr-1"
            fill="currentColor"
            viewBox="0 0 16 16"
          >
            <path d="M14 14V9h-1v5H8v1h6zm-5-5V4H4v5h5zM9 9h5V4H9v5z" />
          </svg>
        </div>

        {/* Resize Indicator */}
        {isResizing && (
          <div className="absolute inset-0 bg-purple-500/10 pointer-events-none z-30 flex items-center justify-center">
            <div className="bg-white/90 px-4 py-2 rounded-lg shadow-lg">
              <span className="text-gray-900 font-mono text-sm">
                {size.width} × {size.height}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Help Text */}
      <p className="text-center text-gray-600 text-sm">
        💡 Arrastra la esquina inferior derecha para redimensionar | Cambia entre Desktop/Tablet/Mobile
      </p>

      {/* Style Controls (Below iframe) */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">🎨 Controles de Estilo</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Color Principal
            </label>
            <input
              type="color"
              defaultValue="#667eea"
              onChange={(e) => sendMessageToIframe('changePrimaryColor', { color: e.target.value })}
              className="w-full h-10 rounded cursor-pointer"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Color de Fondo
            </label>
            <input
              type="color"
              defaultValue="#ffffff"
              onChange={(e) => sendMessageToIframe('changeBackgroundColor', { color: e.target.value })}
              className="w-full h-10 rounded cursor-pointer"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Espaciado (px)
            </label>
            <input
              type="range"
              min="0"
              max="50"
              defaultValue="20"
              onChange={(e) => sendMessageToIframe('changePadding', { padding: e.target.value })}
              className="w-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
