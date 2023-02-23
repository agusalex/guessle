import React, {FocusEvent, useRef, useState} from "react";
import IconButton from '@mui/material/IconButton';
import SendIcon from '@mui/icons-material/Send';
import {CircularProgress, TextField} from "@mui/material";
import './AIWordle.css'

type Props = {
    onEnter: (word: string) => void
    onChange: (word: string) => void
    onQuestion: (question: string) => Promise<boolean>
}
export const AIWordle = ({onEnter, onChange, onQuestion}: Props) => {
    const [currentInput, setCurrentInput] = useState<string>("IS IT A FRUIT?");
    const [guesses, setGuesses] = useState<string[]>([]);
    const [isLoading, setLoading] = useState<boolean>(false)

    function setInput(event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) {
        if (event.target.value !== undefined) {
            const value = event.target.value || ""
            setCurrentInput(value.toUpperCase())
        }
    }

    const handleKeyDown = (event: React.KeyboardEvent) => {
        if (event.key === 'Enter') {
            handleGuessSubmit(event)
        }
    };

    function handleGuessSubmit(event: React.FormEvent) {
        event.preventDefault();
        if (currentInput === "") {
            return;
        }
        if (currentInput.includes("?")) {
            setLoading(true)
            onQuestion(currentInput).then((e:boolean)=>setLoading(false))
            setCurrentInput("");
        } else {
            onChange(currentInput)
            onEnter(currentInput)
            setGuesses([...guesses, currentInput]);
            setCurrentInput("");
        }
    }

    const inputRef = useRef<HTMLInputElement>(null);

    const handleInputFocus = () => {
        if (inputRef.current) {
            inputRef.current.scrollIntoView({behavior: 'smooth', block: 'start'});
        }
    };
    return (
        <div style={{paddingTop: "3vh",marginLeft:"9px"}} className="flex justify-center dark:text-white">
            <TextField type="text" ref={inputRef} onFocus={handleInputFocus} className="input"
                       style={{minWidth: "240px", borderColor: "white"}} id="outlined-basic"
                       onChange={(event) => setInput(event)} onKeyDown={handleKeyDown} value={currentInput}
                       variant="outlined"/>
            {isLoading ? <div style={{paddingLeft:"25px", paddingTop:"8px"}}><CircularProgress className="flex justify-center" /></div> :
                <IconButton style={{paddingLeft: "25px"}} onClick={handleGuessSubmit} className="flex justify-center"
                            color="primary">
                    <SendIcon/>
                </IconButton>}
        </div>
    );
}

export default AIWordle;
