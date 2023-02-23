import { Cell } from '../grid/Cell'
import { BaseModal } from './BaseModal'
import {CircularProgress, TextField} from "@mui/material";
import IconButton from "@mui/material/IconButton";
import SendIcon from "@mui/icons-material/Send";
import React from "react";

type Props = {
  isOpen: boolean
  handleClose: () => void
}

export const InfoModal = ({ isOpen, handleClose }: Props) => {
  return (
    <BaseModal title="How to play" isOpen={isOpen} handleClose={handleClose}>
      <p className="text-sm text-gray-500 dark:text-gray-300">
          To find out the answer, write a question ending with "?"
      </p>
        <div style={{paddingTop: "3vh",paddingBottom: "3vh"}} className="flex justify-center dark:text-white">
            <TextField className="input"
                       style={{minWidth: "240px", borderColor: "white"}} id="outlined-basic"
                       defaultValue={"Is it a fruit?"}
                       variant="outlined"/>
                <IconButton style={{paddingLeft: "25px"}} className="flex justify-center"
                            color="primary">
                    <SendIcon/>
                </IconButton>
        </div>
       <p style={{paddingBottom:"5px"}} className="text-sm text-gray-500 dark:text-gray-300">
           The AI will answer with: Yes, No or Maybe.
      </p>
        <p className="text-sm text-gray-500 dark:text-gray-300">   When ready guess the word in 3g tries. After each guess, the color of the tiles will
            change to show how close your guess was to the word.</p>
      <div className="mb-1 mt-4 flex justify-center">
        <Cell
          isRevealing={true}
          isCompleted={true}
          value="W"
          status="correct"
        />
        <Cell value="E" isCompleted={true} />
        <Cell value="A" isCompleted={true} />
        <Cell value="R" isCompleted={true} />
        <Cell value="Y" isCompleted={true} />
      </div>
      <p className="text-sm text-gray-500 dark:text-gray-300">
        The letter W is in the word and in the correct spot.
      </p>

      <div className="mb-1 mt-4 flex justify-center">
        <Cell value="P" isCompleted={true} />
        <Cell value="I" isCompleted={true} />
        <Cell
          isRevealing={true}
          isCompleted={true}
          value="L"
          status="present"
        />
        <Cell value="O" isCompleted={true} />
        <Cell value="T" isCompleted={true} />
      </div>
      <p className="text-sm text-gray-500 dark:text-gray-300">
        The letter L is in the word but in the wrong spot.
      </p>

      <div className="mb-1 mt-4 flex justify-center">
        <Cell value="V" isCompleted={true} />
        <Cell value="A" isCompleted={true} />
        <Cell value="G" isCompleted={true} />
        <Cell isRevealing={true} isCompleted={true} value="U" status="absent" />
        <Cell value="E" isCompleted={true} />
      </div>
      <p className="text-sm text-gray-500 dark:text-gray-300">
        The letter U is not in the word in any spot.
      </p>
    </BaseModal>
  )
}
