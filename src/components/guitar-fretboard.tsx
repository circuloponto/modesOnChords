import React, { useState } from 'react';

const GuitarFretboard = () => {
  const strings = ['E2', 'A2', 'D3', 'G3', 'B3', 'E4'];
  const fretsCount = 12;

  const triadInversions = [
    { name: 'Root Position', positions: [{string: 5, fret: 8}, {string: 4, fret: 5}, {string: 3, fret: 5}] },
    { name: 'First Inversion', positions: [{string: 4, fret: 5}, {string: 3, fret: 5}, {string: 2, fret: 5}] },
    { name: 'Second Inversion', positions: [{string: 3, fret: 5}, {string: 2, fret: 5}, {string: 1, fret: 8}] }
  ];

  const [currentInversion, setCurrentInversion] = useState(0);
  const [currentNoteIndex, setCurrentNoteIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    let timeoutId;
    if (isPlaying) {
      const playSequence = () => {
        setCurrentNoteIndex((prev) => {
          const nextIndex = prev + 1;
          const currentPositions = triadInversions[currentInversion].positions;
          
          if (nextIndex >= currentPositions.length) {
            setCurrentInversion((prevInv) => (prevInv + 1) % triadInversions.length);
            return 0;
          }
          
          return nextIndex;
        });

        timeoutId = setTimeout(playSequence, 500);
      };

      playSequence();
    }
    return () => {
      clearTimeout(timeoutId);
      setCurrentNoteIndex(-1);
    };
  }, [isPlaying, currentInversion]);

  return (
    <div className="p-4">
      <div className="mb-4 flex gap-4 items-center">
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          {isPlaying ? 'Stop' : 'Start'}
        </button>
        <div className="text-lg font-semibold">
          Current: {triadInversions[currentInversion].name}
        </div>
      </div>

      <div className="relative w-full overflow-x-auto">
        <div className="min-w-[600px]">
          {strings.map((string, stringIndex) => (
            <div key={string} className="flex h-12 border-b border-gray-300">
              <div className="w-12 border-r-2 border-gray-800 bg-gray-100 flex items-center justify-center">
                {string}
              </div>
              {Array.from({ length: fretsCount }).map((_, fretIndex) => {
                const notePosition = triadInversions[currentInversion].positions
                  .findIndex(pos => pos.string === stringIndex && pos.fret === fretIndex + 1);
                const isActive = notePosition !== -1;
                const isCurrentNote = notePosition === currentNoteIndex;
                
                return (
                  <div
                    key={fretIndex}
                    className="w-12 border-r border-gray-400 relative flex items-center justify-center"
                  >
                    {isActive && (
                      <div 
                        className={`absolute w-8 h-8 rounded-full transition-all duration-200 ${
                          isCurrentNote ? 'bg-blue-500 scale-110' : 'bg-blue-300 scale-90 opacity-50'
                        }`} 
                      />
                    )}
                    {[3,5,7,9,12].includes(fretIndex + 1) && stringIndex === 2 && (
                      <div className="absolute -top-6 w-full text-center text-sm text-gray-500">
                        {fretIndex + 1}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GuitarFretboard;
