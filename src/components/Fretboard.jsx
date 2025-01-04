import React from 'react';


const Fretboard = ({ notes, clickedFrets, scaleHighlights, onFretClick }) => {
  return ( 
    <div className="fretboard">
      {notes.map((string, stringIndex) => (
        <div key={`string-${stringIndex}`} className={`string string${stringIndex}`}>
          {string.map((note, fretIndex) => {
            const fretId = `${stringIndex}-${fretIndex}`;
            const isClickHighlighted = clickedFrets.includes(fretId);
            const isScaleHighlighted = scaleHighlights.includes(note) && !isClickHighlighted;
            
            return (
              <div 
                key={`fret-${stringIndex}-${fretIndex}`}
                className={`fret ${isClickHighlighted ? 'click-highlighted' : ''} ${isScaleHighlighted ? 'scale-highlighted' : ''}`} 
                onClick={(e) => onFretClick(e, note, stringIndex, fretIndex)}
              >
                {note}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};

export default Fretboard;