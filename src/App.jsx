import { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';
import './App.css';
import Fretboard from './components/Fretboard';
import Tablet from './components/Tablet';



function App() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState('C');
  const [markedSteps, setMarkedSteps] = useState([]);
  const [chosenNotes, setChosenNotes] = useState([]);
  const [chromatic, setChromatic] = useState(['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']);
  const [clickedFrets, setClickedFrets] = useState([]);
  const [scaleHighlights, setScaleHighlights] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLooping, setIsLooping] = useState(false);
  const [synth, setSynth] = useState(null);

 

  const notes = [
    ['E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#'],
    ['B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F'],
    ['G', 'G#', 'A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B', 'C', 'C#'],
    ['D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#'],
    ['A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B', 'C', 'C#', 'D', 'D#'],
    ['E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#'],
  ];

  // Base tuning of strings (from high E to low E), shifted up one octave
  const stringTunings = ['E5', 'B4', 'G4', 'D4', 'A3', 'E3'];

 

  const handleFretClick = (e, note, stringIndex, fretIndex) => {
    console.log('Fret clicked:', note, 'String:', stringIndex, 'Fret:', fretIndex);
    const fretId = `${stringIndex}-${fretIndex}`;

    // Update clicked frets
    setClickedFrets(prevClickedFrets => {
      // Remove previously selected fret in the same string
      const updatedFrets = prevClickedFrets.filter(id => {
        const [strIndex] = id.split('-');
        return strIndex !== stringIndex.toString(); // Keep other strings' frets
      });

      // If the clicked fret is already selected, deselect it
      if (prevClickedFrets.includes(fretId)) {
        return updatedFrets; // Just return the updated list without the clicked fret
      } else {
        return [...updatedFrets, fretId]; // Add the newly clicked fret
      }
    });
  }
    

  const updateChosenNotes = () => {
    const newChosenNotes = markedSteps.map(step => chromatic[step % 12]);
    setChosenNotes(newChosenNotes);
    setScaleHighlights(newChosenNotes);
  };

  useEffect(() => {
    updateChosenNotes();
  }, [markedSteps, chromatic]);

  useEffect(() => {
    // Using PolySynth to play multiple notes simultaneously
    const newSynth = new Tone.PolySynth(Tone.Synth).toDestination();
    setSynth(newSynth);
  }, []);

  const getNoteWithOctave = (stringIndex, fretIndex, note) => {
    const baseNote = stringTunings[stringIndex];
    const baseOctave = parseInt(baseNote.slice(-1));
    const baseNoteName = baseNote.slice(0, -1);
    
    // Calculate how many octaves to add based on fret position
    const octaveChange = Math.floor(fretIndex / 12);
    const finalOctave = baseOctave + octaveChange;
    
    return `${note}${finalOctave}`;
  };

  const playSelectedNotes = async () => {
    await Tone.start();
    if (!synth || clickedFrets.length === 0) return;

    const notesToPlay = clickedFrets.map(fretId => {
      const [stringIndex, fretIndex] = fretId.split('-').map(Number);
      const note = notes[stringIndex][fretIndex];
      return getNoteWithOctave(stringIndex, fretIndex, note);
    });

    // Sort notes from lowest to highest for consistent chord voicing
    notesToPlay.sort((a, b) => {
      const aOctave = parseInt(a.slice(-1));
      const bOctave = parseInt(b.slice(-1));
      if (aOctave !== bOctave) return aOctave - bOctave;
      return a.localeCompare(b);
    });

    console.log('Playing notes:', notesToPlay);
    synth.triggerAttackRelease(notesToPlay, "4n");
  };

  const playC4 = async () => {
    // We need to start the audio context first due to browser autoplay policies
    await Tone.start();
    if (synth) {
      synth.triggerAttackRelease("C4", "8n");
    }
  };

  const rotateChromatic = (newRoot) => {
    const rootIndex = chromatic.indexOf(newRoot);
    if (rootIndex === -1) return;
  
    const rotatedChromatic = [
      ...chromatic.slice(rootIndex),
      ...chromatic.slice(0, rootIndex)
    ];
  
    setChromatic(rotatedChromatic);
    setSelectedOption(newRoot);
  };

  return (
    <div className='container'>
      <div className="button-container">
        <button 
          className="test-tone-button" 
          onClick={playC4}
        >
          Play C4
        </button>
        <button 
          className="test-tone-button" 
          onClick={playSelectedNotes}
          disabled={clickedFrets.length === 0}
        >
          Play Selected Notes
        </button>
      </div>
      <Tablet 
        markedSteps={markedSteps} 
        setMarkedSteps={setMarkedSteps} 
        isOpen={isOpen} 
        setIsOpen={setIsOpen} 
        selectedOption={selectedOption} 
        setSelectedOption={setSelectedOption}
        options={chromatic} 
        onSelectOption={rotateChromatic}
      /> 
      <Fretboard 
        notes={notes} 
        clickedFrets={clickedFrets}
        scaleHighlights={scaleHighlights}
        onFretClick={handleFretClick}
      />
    </div>
  );
}

export default App;