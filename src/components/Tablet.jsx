import React, { useEffect, useState } from 'react'

const options1 = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']; // Add your actual options here


const Tablet = ({isOpen, setIsOpen, options, selectedOption, onSelectOption, setSelectedOption, markedSteps, setMarkedSteps}) => {

    const [steps, setSteps] = useState(['','','','','','','','','','','','']);
    const [localSelectedOption, setLocalSelectedOption] = useState(selectedOption);
    useEffect(() => {
        if (localSelectedOption !== selectedOption) {
            setSelectedOption(localSelectedOption);
            onSelectOption(localSelectedOption);
            setIsOpen(false);
        }
    }, [localSelectedOption, selectedOption, setSelectedOption, onSelectOption, setIsOpen]);

    const handleOptionClick = (option) => {
        setLocalSelectedOption(option);
    };
    const handleStepClick = (index) => {
        setMarkedSteps(prevMarkedSteps => {
          if (prevMarkedSteps.includes(index)) {
            return prevMarkedSteps.filter(stepIndex => stepIndex !== index);
          } else {
            return [...prevMarkedSteps, index];
          }
        });
      };

    //   const handleOptionClick = (option) => {
    //     onSelectOption(option);
    //     setSelectedOption(option);
    //     setIsOpen(false);  // This line ensures the dropdown closes
    //   };

    return ( 
        <div className="tabletContainer">
         
            <div className="custom-select">
                <div className="select-selected" onClick={() => setIsOpen(!isOpen)}>
                {selectedOption}
                </div>
                {isOpen && (
                <div className="select-items horizontal">
                    {options1.map((option, index) => (
                    <div 
                        key={index} 
                        onClick={() => handleOptionClick(option)}
                    >
                        {option}
                    </div>
                ))}
            </div>
        )}
            </div>
            <div className="scaleBuilder">
            {steps.map((step, index) => (
                <div 
                    key={index} 
                    className={`step ${markedSteps.includes(index) ? 'marked' : ''}`}
                    onClick={() => handleStepClick(index)}
                >
                    {step}
                    {markedSteps.includes(index) && <span className="x-mark">X</span>}
                </div>
                ))}
                
            </div>
        </div>
    );
}
 
export default Tablet;