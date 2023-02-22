import React, {useState} from "react";
import IconButton from '@mui/material/IconButton';
import SendIcon from '@mui/icons-material/Send';
import {TextField} from "@mui/material";
import './AIWordle.css'

type Props = {
    onEnter: (word: string) => void
    onChange: (word: string) => void
    onQuestion: (question: string) => void
}
export const AIWordle = ({onEnter, onChange, onQuestion}: Props) => {
    const [currentInput, setCurrentInput] = useState<string>("");
    const [guesses, setGuesses] = useState<string[]>([]);

    function setInput(event: React.ChangeEvent<HTMLTextAreaElement|HTMLInputElement>) {
        if (event.target.value !== undefined){
            const value = event.target.value || ""
            setCurrentInput(value.toUpperCase())
        }
    }

    async function handleGuessSubmit(event: React.FormEvent) {
        event.preventDefault();

        if (currentInput === "") {
            return;
        }
        if (currentInput.includes("?")) {
            onQuestion(currentInput)
            setCurrentInput("");
        } else {
            onChange(currentInput)
            console.log("the current guess is : " + currentInput)
            onEnter(currentInput)
            setGuesses([...guesses, currentInput]);
            setCurrentInput("");
        }
    }

    return (

        <div style={{paddingTop: "3vh"}} className="flex justify-center dark:text-white">
            <TextField className="input" style={{minWidth: "240px", borderColor: "white"}} id="outlined-basic"
                       onChange={(event) => setInput(event)} value={currentInput} variant="outlined"/>
            <IconButton style={{paddingLeft: "25px"}} onClick={handleGuessSubmit} className="flex justify-center"
                        color="primary">
                <SendIcon/>
            </IconButton>
        </div>
    );
}

export default AIWordle;
