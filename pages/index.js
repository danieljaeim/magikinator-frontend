import React, { useState, useEffect } from 'react';
import Image from 'next/image'
import 'tailwindcss/tailwind.css'

export default function Home() {
    const SERVER_URL = "http://localhost:5000/guess"
    const SCRYFALL_IMG_URL = "https://api.scryfall.com/cards/named?format=image&fuzzy="
    const [questions, setQuestions] = useState([]);
    const [answers, setAnswers] = useState([]);
    const [entropy, setEntropy] = useState(null);
    const [bestQuestion, setBestQuestion] = useState("")
    const [guessedCard, setGuessedCard] = useState("Fury Sliver")
    const [guessedCardImg, setGuessedCardImg] = useState("/garfield.png")
    const [loading, setLoading] = useState(true)
    
    useEffect(() => {
        const getInitialData = async () => {
            await fetch(SERVER_URL, {
                method: 'GET',
                headers: {
                    'Content-type': 'application/json; charset=UTF-8',
                    'Access-Control-Allow-Origin': "*",
                    "Access-Control-Allow-Headers": "Content-Type"
                }
            })
                .then((response) => response.json())
                .then((data) => {
                    let bestQ = data['bestQuestion']
                    let cardGuessedByServer = data['guessedCard']
                    setBestQuestion(bestQ)
                    setGuessedCard(cardGuessedByServer)
                    setQuestions([...questions, bestQ])
                    setLoading(false)
                })
        };
        getInitialData()
    }, [])

    const answerQuestion = async (answer) => {
        console.log("CALLED HANDLECLICK for " + answer)
        await fetch(SERVER_URL, {
            method: 'POST',
            body: JSON.stringify({
                "Questions": questions,
                "Answers": [...answers, answer],
                "Entropy": entropy
            }),
            headers: {
                'Content-type': 'application/json; charset=UTF-8',
                'Access-Control-Allow-Origin': "*",
                "Access-Control-Allow-Headers": "Content-Type"
            }
        })
            .then((response) => response.json())
            .then((data) => {
                let bestQ = data['bestQuestion']
                let cardGuessedByServer = data['guessedCard']
                console.log(cardGuessedByServer)
                let entropyVector = JSON.parse(data['entropyValue'])
                setBestQuestion(bestQ)
                setGuessedCard(cardGuessedByServer)
                setEntropy(entropyVector)
                setQuestions([...questions, bestQ])
                setAnswers([...answers, answer])
            })
            .then(_ => {
                fetch(SCRYFALL_IMG_URL + guessedCard, {
                    method: 'GET'
                })
                    .then((response) => {
                        if (response.status == 200) {
                            setGuessedCardImg(response.url)
                        }
                    })
            })
            .catch((err) => {
                console.log(err.message)
            })
    }

    return (
        <div>
            <div class="relative h-8 w-32">
                <div class="absolute inset-x-0 top-0 h-16"> Magikinator </div>
            </div> 
            <div class="container w-full h-96 mx-auto max-w-full px-4 border-solid border">
                <div class="flex flex-col justify-center">
                    <img 
                        src={guessedCardImg}
                        alt="No Image Found for Card"
                        class="self-center border-solid border max-w-lg rounded-lg" 
                        width={150}
                        height={200}
                    />
                    <div class="justify-end basis-1/2 h-96 border-solid border-2 border-black-500">
                        {loading ? 
                            <div class="text-center border-solid"> Loading best question </div> :
                            <div class="">
                                <div class="text-center text-sm border-solid"> {bestQuestion} </div>
                                <div class="flex justify-center">
                                    <button class="m-3 text-sm p-2 border-solid border border-black rounded" type="button" onClick={async () => answerQuestion("YES")}> Yes </button>
                                    <button class="m-3 text-sm p-2 border-solid border border-black rounded" type="button" onClick={async () => answerQuestion("NO")} > No </button>
                                    <button class="m-3 text-sm p-2 border-solid border border-black rounded" type="button" onClick={async () => answerQuestion("MAYBE")}> Maybe </button>
                                    {/* <div> YOUR CURRENT GUESSED CARD IS: {guessedCard} </div> */}
                                </div>
                            </div>
                        }       
                    </div>
                </div>
            </div>
        </div>
    )
}