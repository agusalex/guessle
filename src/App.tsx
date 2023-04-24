import './App.css'

import {ClockIcon} from '@heroicons/react/outline'
import {format} from 'date-fns'
import React, {useEffect, useState} from 'react'
import Div100vh from 'react-div-100vh'
import {AlertContainer} from './components/alerts/AlertContainer'
import {Grid} from './components/grid/Grid'
import {DatePickerModal} from './components/modals/DatePickerModal'
import {InfoModal} from './components/modals/InfoModal'
import {MigrateStatsModal} from './components/modals/MigrateStatsModal'
import {StatsModal} from './components/modals/StatsModal'
import {Navbar} from './components/navbar/Navbar'
import {
    DATE_LOCALE,
    DISCOURAGE_INAPP_BROWSERS,
    LONG_ALERT_TIME_MS,
    MAX_CHALLENGES, OPENAI_KEY,
    REVEAL_TIME_MS,
    WELCOME_INFO_MODAL_MS,
} from './constants/settings'
import {
    CORRECT_WORD_MESSAGE,
    DISCOURAGE_INAPP_BROWSER_TEXT,
    GAME_COPIED_MESSAGE,
    HARD_MODE_ALERT_MESSAGE,
    NOT_ENOUGH_LETTERS_MESSAGE,
    SHARE_FAILURE_TEXT,
    WIN_MESSAGES,
    WORD_NOT_FOUND_MESSAGE,
} from './constants/strings'
import {useAlert} from './context/AlertContext'
import {isInAppBrowser} from './lib/browser'
import {
    getStoredIsHighContrastMode,
    loadGameStateFromLocalStorage,
    saveGameStateToLocalStorage,
    setStoredIsHighContrastMode,
} from './lib/localStorage'
import {addStatsForCompletedGame, loadStats} from './lib/stats'
import {
    getGameDate,
    getIsLatestGame,
    isWinningWord,
    setGameDate,
    solution,
    solutionGameDate,
    unicodeLength,
} from './lib/words'
import AIWordle from "./components/aiwordle/AIWordle";


function App() {
    const isLatestGame = getIsLatestGame()
    const gameDate = getGameDate()
    const prefersDarkMode = window.matchMedia(
        '(prefers-color-scheme: dark)'
    ).matches

    const {showError: showErrorAlert, showMaybe: showMaybe, showSuccess: showSuccessAlert} =
        useAlert()
    const [currentGuess, setCurrentGuess] = useState('')
    const [isGameWon, setIsGameWon] = useState(false)
    const [isInfoModalOpen, setIsInfoModalOpen] = useState(false)
    const [isStatsModalOpen, setIsStatsModalOpen] = useState(false)
    const [isDatePickerModalOpen, setIsDatePickerModalOpen] = useState(false)
    const [isMigrateStatsModalOpen, setIsMigrateStatsModalOpen] = useState(false)
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false)
    const [currentRowClass, setCurrentRowClass] = useState('')
    const [isGameLost, setIsGameLost] = useState(false)
    const [isDarkMode, setIsDarkMode] = useState(
        localStorage.getItem('theme')
            ? localStorage.getItem('theme') === 'dark'
            : prefersDarkMode
                ? false
                : false
    )
    const [isHighContrastMode, setIsHighContrastMode] = useState(
        getStoredIsHighContrastMode()
    )
    const [isRevealing, setIsRevealing] = useState(false)
    const [guesses, setGuesses] = useState<string[]>(() => {
        const loaded = loadGameStateFromLocalStorage(isLatestGame)
        if (loaded?.solution !== solution) {
            return []
        }
        const gameWasWon = loaded.guesses.includes(solution)
        if (gameWasWon) {
            setIsGameWon(true)
        }
        if (loaded.guesses.length === MAX_CHALLENGES && !gameWasWon) {
            setIsGameLost(true)
            showErrorAlert(CORRECT_WORD_MESSAGE(solution), {
                persist: true,
            })
        }
        return loaded.guesses
    })

    const [stats, setStats] = useState(() => loadStats())

    const [isHardMode, setIsHardMode] = useState(
        localStorage.getItem('gameMode')
            ? localStorage.getItem('gameMode') === 'hard'
            : false
    )

    useEffect(() => {
        // if no game state on load,
        // show the user the how-to info modal
        if (!loadGameStateFromLocalStorage(true)) {
            setTimeout(() => {
                setIsInfoModalOpen(true)
            }, WELCOME_INFO_MODAL_MS)
        }
    })

    useEffect(() => {
        DISCOURAGE_INAPP_BROWSERS &&
        isInAppBrowser() &&
        showErrorAlert(DISCOURAGE_INAPP_BROWSER_TEXT, {
            persist: false,
            durationMs: 7000,
        })
    }, [showErrorAlert])

    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add('dark')
        } else {
            document.documentElement.classList.remove('dark')
        }

        if (isHighContrastMode) {
            document.documentElement.classList.add('high-contrast')
        } else {
            document.documentElement.classList.remove('high-contrast')
        }
    }, [isDarkMode, isHighContrastMode])

    const handleDarkMode = (isDark: boolean) => {
        setIsDarkMode(isDark)
        localStorage.setItem('theme', isDark ? 'dark' : 'light')
    }

    const handleHardMode = (isHard: boolean) => {
        if (guesses.length === 0 || localStorage.getItem('gameMode') === 'hard') {
            setIsHardMode(isHard)
            localStorage.setItem('gameMode', isHard ? 'hard' : 'normal')
        } else {
            showErrorAlert(HARD_MODE_ALERT_MESSAGE)
        }
    }

    const handleHighContrastMode = (isHighContrast: boolean) => {
        setIsHighContrastMode(isHighContrast)
        setStoredIsHighContrastMode(isHighContrast)
    }

    const clearCurrentRowClass = () => {
        setCurrentRowClass('')
    }

    useEffect(() => {
        saveGameStateToLocalStorage(getIsLatestGame(), {guesses, solution})
    }, [guesses])

    useEffect(() => {
        if (isGameWon) {
            const winMessage =
                WIN_MESSAGES[Math.floor(Math.random() * WIN_MESSAGES.length)]
            const delayMs = REVEAL_TIME_MS * solution.length

            showSuccessAlert(winMessage, {
                delayMs,
                onClose: () => setIsStatsModalOpen(true),
            })
        }

        if (isGameLost) {
            setTimeout(() => {
                setIsStatsModalOpen(true)
            }, (solution.length + 1) * REVEAL_TIME_MS)
        }
    }, [isGameWon, isGameLost, showSuccessAlert])

    const onChange = (value: string) => {
        if (
            unicodeLength(value) <= solution.length &&
            guesses.length < MAX_CHALLENGES &&
            !isGameWon
        ) {
            console.log("setting current word " + value)
            setCurrentGuess(value)
        } else {
            console.log("Not setting current word")
        }
    }

    async function onQuestion(question: string): Promise<boolean> {

        const query = "You are an agent in a game that can only answer to any question with YES, NO or MAYBE. Refrain from answering in any other way. " +
            +"Help the player find the correct word by answering their questions. For example:" +
            "A user question may be, 'is it a fruit ?' if the correct answer is Apple then you would answer YES." +
            "If for example the question for Apple is: 'is it tasty?', you could answer MAYBE. If they ask, is it a vehicle, the answer is NO. \n"
            + "Given that the correct word is " + solution.toLowerCase() +
            " the player asks the following question about the correct word: \n" + question.toLowerCase()
        try {
            const response = await fetch('https://ai-summary-service.vercel.app/v1/guessle', {
                method: 'POST',
                body: JSON.stringify({
                    question: query
                }),
                headers: {
                    'Content-type': 'application/json; charset=UTF-8',
                },
            });
            const data = await response.text();
            const responseString: string = (data || "no").toLowerCase();
            if (responseString.includes("yes")) {
                showSuccessAlert(question + "\n Yes", {
                    persist: false,
                });
            } else if (responseString.includes("maybe")) {
                showMaybe(question + "\n Maybe", {
                    persist: false,
                });
            } else {
                showErrorAlert(question + "\n No", {
                    persist: false,
                });
            }
            return true;
        } catch (err: unknown) {
            if (err instanceof Error) {
                console.log(err.message)
                showErrorAlert(err.message, {
                    persist: false,
                });
            }
        }

        return true;
    }


    const onEnter = (input: string) => {
        if (isGameWon || isGameLost) {
            return
        }
        const winningWord = isWinningWord(input)
        if (
            unicodeLength(input) === solution.length &&
            guesses.length < MAX_CHALLENGES &&
            !isGameWon
        ) {
            setGuesses([...guesses, input])
            setCurrentGuess('')

            if (winningWord) {
                if (isLatestGame) {
                    setStats(addStatsForCompletedGame(stats, guesses.length))
                }
                return setIsGameWon(true)
            }

            if (guesses.length === MAX_CHALLENGES - 1) {
                if (isLatestGame) {
                    setStats(addStatsForCompletedGame(stats, guesses.length + 1))
                }
                setIsGameLost(true)
                showErrorAlert(CORRECT_WORD_MESSAGE(solution), {
                    persist: true,
                    delayMs: REVEAL_TIME_MS * solution.length + 1,
                })
            }
        }
    }
    return (
        <Div100vh>

            <div className="flex flex-col">
                <Navbar
                    setIsInfoModalOpen={setIsInfoModalOpen}
                    setIsStatsModalOpen={setIsStatsModalOpen}
                    setIsDatePickerModalOpen={setIsDatePickerModalOpen}
                    setIsSettingsModalOpen={setIsSettingsModalOpen}
                />

                {!isLatestGame && (
                    <div className="flex items-center justify-center">
                        <ClockIcon className="h-6 w-6 stroke-gray-600 dark:stroke-gray-300"/>
                        <p className="text-base text-gray-600 dark:text-gray-300">
                            {format(gameDate, 'd MMMM yyyy', {locale: DATE_LOCALE})}
                        </p>
                    </div>
                )}

                <div style={{paddingBottom: 0}}
                     className="mx-auto flex w-full grow flex-col px-1 pt-2 pb-8 sm:px-6 md:max-w-7xl lg:px-8 short:pb-2 short:pt-2">
                    <h1 style={{fontSize: "1.2em", paddingBottom: "2vh"}} className="center dark:text-white">Guess the
                        word of the day or ask a question to the oracle ending with "?"</h1>
                    <div style={{paddingBottom: 0}} className="flex grow flex-col justify-center pb-6 short:pb-2">
                        <Grid
                            solution={solution}
                            guesses={guesses}
                            currentGuess={currentGuess}
                            isRevealing={isRevealing}
                            currentRowClassName={currentRowClass}
                            onEnter={onEnter}
                            onChange={onChange}
                            onQuestion={onQuestion}
                        />
                    </div>
                    <InfoModal
                        isOpen={isInfoModalOpen}
                        handleClose={() => setIsInfoModalOpen(false)}
                    />
                    <StatsModal
                        isOpen={isStatsModalOpen}
                        handleClose={() => setIsStatsModalOpen(false)}
                        solution={solution}
                        guesses={guesses}
                        gameStats={stats}
                        isLatestGame={isLatestGame}
                        isGameLost={isGameLost}
                        isGameWon={isGameWon}
                        handleShareToClipboard={() => showSuccessAlert(GAME_COPIED_MESSAGE)}
                        handleShareFailure={() =>
                            showErrorAlert(SHARE_FAILURE_TEXT, {
                                durationMs: LONG_ALERT_TIME_MS,
                            })
                        }
                        handleMigrateStatsButton={() => {
                            setIsStatsModalOpen(false)
                            setIsMigrateStatsModalOpen(true)
                        }}
                        isHardMode={isHardMode}
                        isDarkMode={isDarkMode}
                        isHighContrastMode={isHighContrastMode}
                        numberOfGuessesMade={guesses.length}
                    />
                    <DatePickerModal
                        isOpen={isDatePickerModalOpen}
                        initialDate={solutionGameDate}
                        handleSelectDate={(d) => {
                            setIsDatePickerModalOpen(false)
                            setGameDate(d)
                        }}
                        handleClose={() => setIsDatePickerModalOpen(false)}
                    />
                    <MigrateStatsModal
                        isOpen={isMigrateStatsModalOpen}
                        handleClose={() => setIsMigrateStatsModalOpen(false)}
                    />
                    <AlertContainer/>
                </div>
            </div>
        </Div100vh>
    )
}

export default App
