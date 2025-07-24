import React from 'react';
import { 
  Pen, 
  Square, 
  Circle, 
  Type, 
  Eraser, 
  Move, 
  Undo, 
  Redo, 
  Save, 
  Download, 
  Upload, 
  Trash2,
  Palette,
  Settings,
  Grid,
  Ruler,
  Image,
  Shapes
} from 'lucide-react';

export type ToolType = 'pen' | 'rectangle' | 'circle' | 'text' | 'eraser' | 'move' | 'line' | 'arrow';

interface WhiteboardToolbarProps {
  currentTool: ToolType;
  onToolChange: (tool: ToolType) => void;
  currentColor: string;
  onColorChange: (color: string) => void;
  strokeWidth: number;
  onStrokeWidthChange: (width: number) => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onClear: () => void;
  onSave: () => void;
  onExport: () => void;
  onImport: (file: File) => void;
  showGrid: boolean;
  onToggleGrid: () => void;
  showRuler: boolean;
  onToggleRuler: () => void;
}

const WhiteboardToolbar: React.FC<WhiteboardToolbarProps> = ({
  currentTool,
  onToolChange,
  currentColor,
  onColorChange,
  strokeWidth,
  onStrokeWidthChange,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onClear,
  onSave,
  onExport,
  onImport,
  showGrid,
  onToggleGrid,
  showRuler,
  onToggleRuler
}) => {
  const tools = [
    { id: 'pen' as ToolType, icon: Pen, label: 'Pen', shortcut: 'P' },
    { id: 'rectangle' as ToolType, icon: Square, label: 'Rectangle', shortcut: 'R' },
    { id: 'circle' as ToolType, icon: Circle, label: 'Circle', shortcut: 'C' },
    { id: 'line' as ToolType, icon: Ruler, label: 'Line', shortcut: 'L' },
    { id: 'text' as ToolType, icon: Type, label: 'Text', shortcut: 'T' },
    { id: 'move' as ToolType, icon: Move, label: 'Select/Move', shortcut: 'V' },
    { id: 'eraser' as ToolType, icon: Eraser, label: 'Eraser', shortcut: 'E' }
  ];

  const colors = [
    '#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', 
    '#FF00FF', '#00FFFF', '#FFA500', '#800080', '#008000',
    '#FFC0CB', '#A52A2A', '#808080', '#000080', '#800000'
  ];

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImport(file);
      // Reset the input so the same file can be selected again
      event.target.value = '';
    }
  };

  return (
    <div className="bg-white border-r border-amber-200 w-16 flex flex-col items-center py-4 space-y-2 overflow-y-auto">
      {/* Drawing Tools */}
      <div className="space-y-2">
        {tools.map(tool => {
          const Icon = tool.icon;
          return (
            <button
              key={tool.id}
              onClick={() => onToolChange(tool.id)}
              className={`p-3 rounded-lg transition-all duration-200 group relative ${
                currentTool === tool.id 
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg' 
                  : 'bg-amber-50 text-amber-700 hover:bg-amber-100 hover:shadow-md'
              }`}
              title={`${tool.label} (${tool.shortcut})`}
            >
              <Icon className="h-5 w-5" />
              
              {/* Tooltip */}
              <div className="absolute left-full ml-2 top-1/2 transform -translate-y-1/2 bg-amber-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                {tool.label} ({tool.shortcut})
              </div>
            </button>
          );
        })}
      </div>

      <div className="border-t border-amber-300 w-full my-2"></div>

      {/* Color Picker */}
      <div className="space-y-2">
        <div className="relative group">
          <button
            className="p-3 bg-amber-50 rounded-lg hover:bg-amber-100 transition-colors"
            title="Color Picker"
          >
            <div 
              className="w-5 h-5 rounded border-2 border-amber-300"
              style={{ backgroundColor: currentColor }}
            />
          </button>
          
          {/* Color Palette */}
          <div className="absolute left-full ml-2 top-0 bg-white border border-amber-200 rounded-lg p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none group-hover:pointer-events-auto z-10 shadow-lg">
            <div className="grid grid-cols-3 gap-1 mb-3">
              {colors.map(color => (
                <button
                  key={color}
                  onClick={() => onColorChange(color)}
                  className={`w-6 h-6 rounded border-2 hover:scale-110 transition-transform ${
                    currentColor === color ? 'border-amber-900' : 'border-amber-300'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
            <input
              type="color"
              value={currentColor}
              onChange={(e) => onColorChange(e.target.value)}
              className="w-full h-8 rounded border border-amber-300 cursor-pointer"
            />
          </div>
        </div>

        {/* Stroke Width */}
        <div className="relative group">
          <button
            className="p-3 bg-amber-50 rounded-lg hover:bg-amber-100 transition-colors"
            title="Stroke Width"
          >
            <div className="flex items-center justify-center">
              <div 
                className="bg-gray-700 rounded-full"
                style={{ 
                  width: `${Math.min(strokeWidth + 2, 16)}px`, 
                  height: `${Math.min(strokeWidth + 2, 16)}px` 
                }}
              />
            </div>
          </button>
          
          {/* Stroke Width Slider */}
          <div className="absolute left-full ml-2 top-0 bg-white border border-amber-200 rounded-lg p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none group-hover:pointer-events-auto z-10 shadow-lg">
            <label className="block text-xs font-medium text-amber-700 mb-2">
              Width: {strokeWidth}px
            </label>
            <input
              type="range"
              min="1"
              max="20"
              value={strokeWidth}
              onChange={(e) => onStrokeWidthChange(Number(e.target.value))}
              className="w-24"
            />
            <div className="flex justify-between text-xs text-amber-500 mt-1">
              <span>1</span>
              <span>20</span>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-amber-300 w-full my-2"></div>

      {/* Actions */}
      <div className="space-y-2">
        <button
          onClick={onUndo}
          disabled={!canUndo}
          className="p-3 bg-amber-50 text-amber-700 rounded-lg hover:bg-amber-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed group relative"
          title="Undo (Ctrl+Z)"
        >
          <Undo className="h-5 w-5" />
          <div className="absolute left-full ml-2 top-1/2 transform -translate-y-1/2 bg-amber-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
            Undo (Ctrl+Z)
          </div>
        </button>
        
        <button
          onClick={onRedo}
          disabled={!canRedo}
          className="p-3 bg-amber-50 text-amber-700 rounded-lg hover:bg-amber-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed group relative"
          title="Redo (Ctrl+Y)"
        >
          <Redo className="h-5 w-5" />
          <div className="absolute left-full ml-2 top-1/2 transform -translate-y-1/2 bg-amber-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
            Redo (Ctrl+Y)
          </div>
        </button>
      </div>

      <div className="border-t border-amber-300 w-full my-2"></div>

      {/* View Options */}
      <div className="space-y-2">
        <button
          onClick={onToggleGrid}
          className={`p-3 rounded-lg transition-colors group relative ${
            showGrid 
              ? 'bg-amber-200 text-amber-900' 
              : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
          }`}
          title="Toggle Grid"
        >
          <Grid className="h-5 w-5" />
          <div className="absolute left-full ml-2 top-1/2 transform -translate-y-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
            Toggle Grid
          </div>
        </button>
        
        <button
          onClick={onToggleRuler}
          className={`p-3 rounded-lg transition-colors group relative ${
            showRuler 
              ? 'bg-amber-200 text-amber-900' 
              : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
          }`}
          title="Toggle Ruler"
        >
          <Ruler className="h-5 w-5" />
          <div className="absolute left-full ml-2 top-1/2 transform -translate-y-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
            Toggle Ruler
          </div>
        </button>
      </div>

      <div className="border-t border-amber-300 w-full my-2"></div>

      {/* File Operations */}
      <div className="space-y-2">
        <button
          onClick={onSave}
          className="p-3 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition-colors group relative"
          title="Save Session"
        >
          <Save className="h-5 w-5" />
          <div className="absolute left-full ml-2 top-1/2 transform -translate-y-1/2 bg-amber-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
            Save Session
          </div>
        </button>
        
        <button
          onClick={onExport}
          className="p-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors group relative"
          title="Export Image"
        >
          <Download className="h-5 w-5" />
          <div className="absolute left-full ml-2 top-1/2 transform -translate-y-1/2 bg-amber-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
            Export Image
          </div>
        </button>
        
        <label className="p-3 bg-orange-50 text-orange-700 rounded-lg hover:bg-orange-100 transition-colors cursor-pointer group relative block">
          <Upload className="h-5 w-5" />
          <input
            type="file"
            accept=".json,.png,.jpg,.jpeg"
            onChange={handleFileImport}
            className="hidden"
          />
          <div className="absolute left-full ml-2 top-1/2 transform -translate-y-1/2 bg-amber-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
            Import File
          </div>
        </label>
      </div>

      <div className="border-t border-amber-300 w-full my-2"></div>

      {/* Clear */}
      <button
        onClick={onClear}
        className="p-3 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors group relative"
        title="Clear All"
      >
        <Trash2 className="h-5 w-5" />
        <div className="absolute left-full ml-2 top-1/2 transform -translate-y-1/2 bg-amber-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
          Clear All
        </div>
      </button>
    </div>
  );
};

export default WhiteboardToolbar;