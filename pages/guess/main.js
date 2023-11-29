import React, { useState, useEffect } from 'react';

export default function Main() {
    const SERVER_URL = "http://localhost:5000/guess"
    const [questions, setQuestions] = useState([]);
    const [answers, setAnswers] = useState([]);
    const [entropy, setEntropy] = useState(null);
    const [bestQuestion, setBestQuestion] = useState("")
    const [guessedCard, setGuessedCard] = useState("")
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
                    let guessedCard = data['guessedCard']
                    setBestQuestion(bestQ)
                    setGuessedCard(guessedCard)
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
                let guessedCard = data['guessedCard']
                let entropyVector = JSON.parse(data['entropyValue'])
                setBestQuestion(bestQ)
                setGuessedCard(guessedCard)
                setEntropy(entropyVector)
                setQuestions([...questions, bestQ])
                setAnswers([...answers, answer])
                console.log(guessedCard)
            })
            .catch((err) => {
                console.log(err.message)
            })
    }   

    return (
        <div>
            {loading ? 
                <div>
                    GETTING BEST FIRST QUESTION
                </div> :
                <div>
                    <div> {bestQuestion} </div>
                    <button type="button" onClick={async () => answerQuestion("YES")}> Yes </button>
                    <button type="button" onClick={async () => answerQuestion("NO")} > No </button>
                    <button type="button" onClick={async () => answerQuestion("MAYBE")}> Maybe </button>
                    <div> YOUR CURRENT GUESSED CARD IS: {guessedCard} </div>
                </div>
            }       
        </div>
    )
}