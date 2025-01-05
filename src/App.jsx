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
  const [currentStep, setCurrentStep] = useState(0);
  const [synth, setSynth] = useState(null);
  const [melodySynth, setMelodySynth] = useState(null);
  const sequenceRef = useRef(null);

 

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
    // Using two synths: one for sustained chord, one for melody
    const newSynth = new Tone.PolySynth(Tone.Synth, {
      oscillator: {
        type: "triangle"
      },
      envelope: {
        attack: 0.02,
        decay: 0.3,
        sustain: 0.3,
        release: 1
      }
    }).toDestination();

    const melodySynth = new Tone.Synth({
      oscillator: {
        type: "square8"  // More harmonically rich for lead guitar sound
      },
      envelope: {
        attack: 0.005,
        decay: 0.1,
        sustain: 0.3,
        release: 0.1
      }
    }).toDestination();
    
    // Set the chord synth to be quieter
    newSynth.volume.value = -12; // Reduce volume by 12 decibels
    melodySynth.volume.value = -6; // Slightly reduce melody volume too

    setSynth(newSynth);
    setMelodySynth(melodySynth);

    // Set up initial transport settings
    Tone.Transport.bpm.value = 120;
    Tone.Transport.timeSignature = 4;

    return () => {
      // Cleanup when component unmounts
      Tone.Transport.stop();
      Tone.Transport.cancel();
    };
  }, []);

  useEffect(() => {
    if (!synth || !melodySynth || !isPlaying) return;

    // Clear any existing events
    Tone.Transport.cancel();

    if (markedSteps.length === 0) return;

    // Create a loop for the sustained chord
    const chordLoop = new Tone.Loop((time) => {
      // Get all selected frets for the current chord
      const notesToPlay = clickedFrets.map(fretId => {
        const [stringIndex, fretIndex] = fretId.split('-').map(Number);
        const note = notes[stringIndex][fretIndex];
        return getNoteWithOctave(stringIndex, fretIndex, note);
      });

      // Play the chord for one full measure
      if (notesToPlay.length > 0) {
        synth.triggerAttackRelease(notesToPlay, "1m", time);
      }
    }, "1m");

    // Create a sequence for the scale steps
    const scaleNotes = markedSteps.map(step => chromatic[step]);
    console.log('Scale notes array:', scaleNotes);
    
    const stepLoop = new Tone.Loop(time => {
      // Play each note in sequence
      scaleNotes.forEach((note, i) => {
        const noteTime = time + (i * Tone.Time("8n").toSeconds());
        melodySynth.triggerAttackRelease(`${note}4`, "8n", noteTime);
      });
    }, "1m");

    chordLoop.start(0);
    stepLoop.start(0);

    // Dispose everything when effect changes
    return () => {
      chordLoop.dispose();
      stepLoop.dispose();
      if (sequenceRef.current) {
        sequenceRef.current.dispose();
      }
    };
  }, [clickedFrets, synth, melodySynth, isPlaying, markedSteps, chromatic]);

  useEffect(() => {
    if (isPlaying) {
      // Stop and restart Transport to reset sequence
      Tone.Transport.stop();
      Tone.Transport.start();
    }
  }, [chromatic, isPlaying]);

  const togglePlayback = async () => {
    await Tone.start();
    if (!isPlaying && clickedFrets.length > 0) {
      setIsPlaying(true);
      Tone.Transport.start();
    } else {
      setIsPlaying(false);
      Tone.Transport.stop();
    }
  };

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

  const onSelectOption = (option) => {
    const rootIndex = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'].indexOf(option);
    // Rotate chromatic array to put root note at index 0
    const newChromatic = [
      ...['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'].slice(rootIndex),
      ...['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'].slice(0, rootIndex)
    ];
    setChromatic(newChromatic);
    
    // Reset Transport position
    Tone.Transport.position = 0;
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
        <button 
          className={`playback-button ${isPlaying ? 'playing' : ''}`} 
          onClick={togglePlayback}
        >
          {isPlaying ? 'Stop' : 'Play'}
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
        onSelectOption={onSelectOption}
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