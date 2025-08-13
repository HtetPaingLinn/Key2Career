import React from "react";

const KeyboardShortcutsHint = () => (
  <div className="keyboard-hint">
    <div className="font-semibold mb-1">Keyboard Shortcuts:</div>
    <div className="text-xs space-y-1">
      <div>• Ctrl+A: Select all elements</div>
      <div>• Delete: Delete selected elements</div>
      <div>• Arrow keys: Move selected elements</div>
      <div>• Ctrl+Click: Multi-select</div>
      <div>• Drag: Move elements</div>
      <div>• Alt+Scroll: Zoom canvas</div>
    </div>
  </div>
);

export default KeyboardShortcutsHint; 