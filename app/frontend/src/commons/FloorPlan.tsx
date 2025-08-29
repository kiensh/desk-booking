import React, { useState, useCallback } from 'react';

function FloorPlan() {
  const [scale, setScale] = useState(4);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [showImage, setShowImage] = useState(false);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    },
    [position],
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging) return;
      setPosition({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
    },
    [isDragging, dragStart],
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const zoomIn = () => setScale((prev) => Math.min(10, prev * 1.2));
  const zoomOut = () => setScale((prev) => Math.max(0.1, prev * 0.8));

  return (
    <div>
      <button onClick={() => setShowImage(!showImage)} style={{ marginBottom: '10px' }}>
        {showImage ? 'Hide' : 'Show'} Floor 9 📷
      </button>
      {showImage && (
        <button
          style={{
            width: '100%',
            height: '400px',
            overflow: 'hidden',
            border: '1px solid #ddd',
            position: 'relative',
            cursor: isDragging ? 'grabbing' : 'grab',
            marginBottom: '20px',
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <div style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 10 }}>
            <button onClick={zoomIn}>Zoom In</button>
            <button onClick={zoomOut} style={{ marginLeft: '10px' }}>
              Zoom Out
            </button>
          </div>
          <img
            className={'stop-scrolling'}
            src="/floor-9.png"
            alt="Floor 9 Layout"
            style={{
              transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
              transformOrigin: '0 0',
              maxWidth: 'none',
              maxHeight: '400px',
              userSelect: 'none',
              pointerEvents: 'none',
            }}
          />
        </button>
      )}
    </div>
  );
}

export default FloorPlan;
