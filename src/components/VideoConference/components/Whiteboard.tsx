import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Pen, 
  Square, 
  Circle, 
  Type, 
  Eraser, 
  Undo, 
  Redo, 
  Save, 
  Download, 
  Upload, 
  Trash2, 
  Move,
  Palette,
  Settings,
  Users,
  Eye,
  EyeOff,
  Minus,
  Triangle,
  ArrowRight,
  Grid,
  Ruler,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Copy,
  Layers,
  X
} from 'lucide-react';

interface WhiteboardElement {
  id: string;
  type: 'line' | 'rectangle' | 'circle' | 'text' | 'freehand' | 'arrow' | 'triangle';
  x: number;
  y: number;
  width?: number;
  height?: number;
  color: string;
  strokeWidth: number;
  content?: string;
  points?: { x: number; y: number }[];
  createdBy: string;
  createdAt: Date;
  lastModified?: Date;
  modifiedBy?: string;
  rotation?: number;
  opacity?: number;
}

interface WhiteboardProps {
  isVisible: boolean;
  onClose: () => void;
  participants: Array<{ id: string; name: string; color: string }>;
  currentUser: { id: string; name: string };
}

type ToolType = 'pen' | 'rectangle' | 'circle' | 'text' | 'eraser' | 'move' | 'line' | 'arrow';

const Whiteboard: React.FC<WhiteboardProps> = ({ 
  isVisible, 
  onClose, 
  participants, 
  currentUser 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [currentTool, setCurrentTool] = useState<ToolType>('pen');
  const [currentColor, setCurrentColor] = useState('#000000');
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [elements, setElements] = useState<WhiteboardElement[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentElement, setCurrentElement] = useState<WhiteboardElement | null>(null);
  const [showGrid, setShowGrid] = useState(false);
  const [showRuler, setShowRuler] = useState(false);
  const [undoStack, setUndoStack] = useState<WhiteboardElement[][]>([]);
  const [redoStack, setRedoStack] = useState<WhiteboardElement[][]>([]);

  // Initialize canvas
  useEffect(() => {
    if (!isVisible || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    // Set default styles
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.imageSmoothingEnabled = true;

    redrawCanvas();
  }, [isVisible, elements, showGrid]);

  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width / window.devicePixelRatio, canvas.height / window.devicePixelRatio);

    // Draw grid if enabled
    if (showGrid) {
      drawGrid(ctx, canvas);
    }

    // Draw all elements
    elements.forEach(element => {
      drawElement(ctx, element);
    });

    // Draw current element being drawn
    if (currentElement) {
      drawElement(ctx, currentElement);
    }
  }, [elements, currentElement, showGrid]);

  const drawGrid = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    const gridSize = 20;
    const width = canvas.width / window.devicePixelRatio;
    const height = canvas.height / window.devicePixelRatio;

    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 0.5;

    // Vertical lines
    for (let x = 0; x <= width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    // Horizontal lines
    for (let y = 0; y <= height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
  };

  const drawElement = (ctx: CanvasRenderingContext2D, element: WhiteboardElement) => {
    ctx.strokeStyle = element.color;
    ctx.lineWidth = element.strokeWidth;
    ctx.fillStyle = element.color;

    switch (element.type) {
      case 'freehand':
        if (element.points && element.points.length > 1) {
          ctx.beginPath();
          ctx.moveTo(element.points[0].x, element.points[0].y);
          for (let i = 1; i < element.points.length; i++) {
            ctx.lineTo(element.points[i].x, element.points[i].y);
          }
          ctx.stroke();
        }
        break;

      case 'rectangle':
        ctx.beginPath();
        ctx.rect(element.x, element.y, element.width || 0, element.height || 0);
        ctx.stroke();
        break;

      case 'circle':
        const radius = Math.sqrt(Math.pow(element.width || 0, 2) + Math.pow(element.height || 0, 2)) / 2;
        ctx.beginPath();
        ctx.arc(
          element.x + (element.width || 0) / 2,
          element.y + (element.height || 0) / 2,
          radius,
          0,
          2 * Math.PI
        );
        ctx.stroke();
        break;

      case 'line':
        ctx.beginPath();
        ctx.moveTo(element.x, element.y);
        ctx.lineTo(element.x + (element.width || 0), element.y + (element.height || 0));
        ctx.stroke();
        break;

      case 'text':
        ctx.font = `${element.strokeWidth * 8}px Arial`;
        ctx.fillText(element.content || '', element.x, element.y);
        break;

      case 'arrow':
        // Draw arrow line
        ctx.beginPath();
        ctx.moveTo(element.x, element.y);
        const endX = element.x + (element.width || 0);
        const endY = element.y + (element.height || 0);
        ctx.lineTo(endX, endY);
        ctx.stroke();

        // Draw arrowhead
        const angle = Math.atan2(element.height || 0, element.width || 0);
        const arrowLength = 15;
        ctx.beginPath();
        ctx.moveTo(endX, endY);
        ctx.lineTo(
          endX - arrowLength * Math.cos(angle - Math.PI / 6),
          endY - arrowLength * Math.sin(angle - Math.PI / 6)
        );
        ctx.moveTo(endX, endY);
        ctx.lineTo(
          endX - arrowLength * Math.cos(angle + Math.PI / 6),
          endY - arrowLength * Math.sin(angle + Math.PI / 6)
        );
        ctx.stroke();
        break;
    }
  };

  const getMousePos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (currentTool === 'move') return;

    const pos = getMousePos(e);
    setIsDrawing(true);

    const newElement: WhiteboardElement = {
      id: Date.now().toString(),
      type: currentTool === 'pen' ? 'freehand' : currentTool,
      x: pos.x,
      y: pos.y,
      color: currentColor,
      strokeWidth,
      createdBy: currentUser.id,
      createdAt: new Date(),
      points: currentTool === 'pen' ? [pos] : undefined
    };

    setCurrentElement(newElement);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !currentElement) return;

    const pos = getMousePos(e);

    if (currentTool === 'pen') {
      setCurrentElement(prev => prev ? {
        ...prev,
        points: [...(prev.points || []), pos]
      } : null);
    } else {
      setCurrentElement(prev => prev ? {
        ...prev,
        width: pos.x - prev.x,
        height: pos.y - prev.y
      } : null);
    }
  };

  const handleMouseUp = () => {
    if (!isDrawing || !currentElement) return;

    setIsDrawing(false);
    
    // Save to undo stack
    setUndoStack(prev => [...prev, elements]);
    setRedoStack([]);
    
    // Add element to elements array
    setElements(prev => [...prev, currentElement]);
    setCurrentElement(null);
  };

  const handleUndo = () => {
    if (undoStack.length === 0) return;

    const previousState = undoStack[undoStack.length - 1];
    setRedoStack(prev => [...prev, elements]);
    setElements(previousState);
    setUndoStack(prev => prev.slice(0, -1));
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;

    const nextState = redoStack[redoStack.length - 1];
    setUndoStack(prev => [...prev, elements]);
    setElements(nextState);
    setRedoStack(prev => prev.slice(0, -1));
  };

  const handleClear = () => {
    setUndoStack(prev => [...prev, elements]);
    setRedoStack([]);
    setElements([]);
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dataURL = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `whiteboard-${new Date().toISOString().split('T')[0]}.png`;
    link.href = dataURL;
    link.click();
  };

  const handleExport = () => {
    handleSave();
  };

  const handleImport = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!canvas || !ctx) return;

        ctx.drawImage(img, 0, 0);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const tools = [
    { id: 'pen' as ToolType, icon: Pen, label: 'Pen' },
    { id: 'rectangle' as ToolType, icon: Square, label: 'Rectangle' },
    { id: 'circle' as ToolType, icon: Circle, label: 'Circle' },
    { id: 'line' as ToolType, icon: Minus, label: 'Line' },
    { id: 'arrow' as ToolType, icon: ArrowRight, label: 'Arrow' },
    { id: 'text' as ToolType, icon: Type, label: 'Text' },
    { id: 'eraser' as ToolType, icon: Eraser, label: 'Eraser' },
    { id: 'move' as ToolType, icon: Move, label: 'Move' }
  ];

  const colors = [
    '#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', 
    '#FF00FF', '#00FFFF', '#FFA500', '#800080', '#008000',
    '#FFC0CB', '#A52A2A', '#808080', '#000080', '#800000'
  ];

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full h-full max-w-7xl max-h-[90vh] flex flex-col border-4 border-amber-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center shadow-md">
              <Edit3 className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-amber-900">Curio Tutors Whiteboard</h2>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              {participants.map((participant, index) => (
                <div
                  key={participant.id}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
                  style={{ backgroundColor: participant.color }}
                  title={participant.name}
                >
                  {participant.name.charAt(0)}
                </div>
              ))}
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-amber-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-amber-700" />
            </button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Toolbar */}
          <div className="bg-amber-50 border-r border-amber-200 w-16 flex flex-col items-center py-4 space-y-2 overflow-y-auto">
            {/* Drawing Tools */}
            <div className="space-y-2">
              {tools.map(tool => {
                const Icon = tool.icon;
                return (
                  <button
                    key={tool.id}
                    onClick={() => setCurrentTool(tool.id)}
                    className={`p-3 rounded-lg transition-all duration-200 group relative ${
                      currentTool === tool.id 
                        ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg' 
                        : 'bg-white text-amber-700 hover:bg-amber-100 hover:shadow-md'
                    }`}
                    title={tool.label}
                  >
                    <Icon className="h-5 w-5" />
                  </button>
                );
              })}
            </div>

            <div className="border-t border-gray-300 w-full my-2"></div>

            {/* Color Picker */}
            <div className="space-y-2">
              <div className="relative group">
                <button
                  className="p-3 bg-white rounded-lg hover:bg-amber-100 transition-colors"
                  title="Color Picker"
                >
                  <div 
                    className="w-5 h-5 rounded border-2 border-amber-300"
                    style={{ backgroundColor: currentColor }}
                  />
                </button>
                
                <div className="absolute left-full ml-2 top-0 bg-white border border-amber-200 rounded-lg p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none group-hover:pointer-events-auto z-10 shadow-lg">
                  <div className="grid grid-cols-3 gap-1 mb-3">
                    {colors.map(color => (
                      <button
                        key={color}
                        onClick={() => setCurrentColor(color)}
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
                    onChange={(e) => setCurrentColor(e.target.value)}
                    className="w-full h-8 rounded border border-amber-300 cursor-pointer"
                  />
                </div>
              </div>

              {/* Stroke Width */}
              <div className="relative group">
                <button
                  className="p-3 bg-white rounded-lg hover:bg-amber-100 transition-colors"
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
                
                <div className="absolute left-full ml-2 top-0 bg-white border border-amber-200 rounded-lg p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none group-hover:pointer-events-auto z-10 shadow-lg">
                  <label className="block text-xs font-medium text-amber-700 mb-2">
                    Width: {strokeWidth}px
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="20"
                    value={strokeWidth}
                    onChange={(e) => setStrokeWidth(Number(e.target.value))}
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
                onClick={handleUndo}
                disabled={undoStack.length === 0}
                className="p-3 bg-white text-amber-700 rounded-lg hover:bg-amber-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Undo"
              >
                <Undo className="h-5 w-5" />
              </button>
              
              <button
                onClick={handleRedo}
                disabled={redoStack.length === 0}
                className="p-3 bg-white text-amber-700 rounded-lg hover:bg-amber-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Redo"
              >
                <Redo className="h-5 w-5" />
              </button>
            </div>

            <div className="border-t border-amber-300 w-full my-2"></div>

            {/* View Options */}
            <div className="space-y-2">
              <button
                onClick={() => setShowGrid(!showGrid)}
                className={`p-3 rounded-lg transition-colors ${
                  showGrid 
                    ? 'bg-amber-200 text-amber-900' 
                    : 'bg-white text-amber-700 hover:bg-amber-100'
                }`}
                title="Toggle Grid"
              >
                <Grid className="h-5 w-5" />
              </button>
            </div>

            <div className="border-t border-amber-300 w-full my-2"></div>

            {/* File Operations */}
            <div className="space-y-2">
              <button
                onClick={handleSave}
                className="p-3 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition-colors"
                title="Save"
              >
                <Save className="h-5 w-5" />
              </button>
              
              <button
                onClick={handleExport}
                className="p-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
                title="Export"
              >
                <Download className="h-5 w-5" />
              </button>
              
              <label className="p-3 bg-orange-50 text-orange-700 rounded-lg hover:bg-orange-100 transition-colors cursor-pointer block">
                <Upload className="h-5 w-5" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => e.target.files?.[0] && handleImport(e.target.files[0])}
                  className="hidden"
                />
              </label>
            </div>

            <div className="border-t border-amber-300 w-full my-2"></div>

            {/* Clear */}
            <button
              onClick={handleClear}
              className="p-3 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors"
              title="Clear All"
            >
              <Trash2 className="h-5 w-5" />
            </button>
          </div>

          {/* Canvas Area */}
          <div className="flex-1 relative overflow-hidden bg-white">
            <canvas
              ref={canvasRef}
              className="w-full h-full cursor-crosshair"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            />
          </div>
        </div>

        {/* Status Bar */}
        <div className="border-t border-amber-200 px-4 py-2 bg-amber-50">
          <div className="flex items-center justify-between text-sm text-amber-700">
            <div className="flex items-center space-x-4">
              <span>Tool: {tools.find(t => t.id === currentTool)?.label}</span>
              <span>Color: {currentColor}</span>
              <span>Width: {strokeWidth}px</span>
            </div>
            <div className="flex items-center space-x-4">
              <span>{elements.length} elements</span>
              <span>{participants.length} participants</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Whiteboard;