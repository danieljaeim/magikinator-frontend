import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { library } from "@fortawesome/fontawesome-svg-core";
import { faDice } from "@fortawesome/free-solid-svg-icons";
import Head from "next/head";
import { InfinitySpin } from "react-loader-spinner";
import translateQuestionToString from "data/questionTranslator.js";
import symbolMap from "../data/symbolImport";
import Image from "next/image";
import localFont from "next/font/local";
import "tailwindcss/tailwind.css";

library.add(faDice);

const manaFont = localFont({ src: "../public/fonts/mana.woff2" });

export default function Home({ Component, pageProps }) {
  // const SERVER_URL = "https://magikinator-d04800de7ba6.herokuapp.com/guess"
  const SERVER_URL = "http://localhost:5000/guess";
  const SCRYFALL_IMG_URL =
    "https://api.scryfall.com/cards/named?format=image&fuzzy=";
  /** This is for tracking previous state for undo'ing */
  const [questions, setQuestions] = useState([]); // player questions they've been asked
  const [answers, setAnswers] = useState([]); // player answers they've given
  const [entropyVectors, setEntropyVectors] = useState([]); // all entropy vectors given to server
  const [entropyValues, setEntropyValues] = useState([]); // all entropy values returned by server
  const [rejectedCards, setRejectedCards] = useState([]); // all cards rejected by player
  const [bestCards, setBestCards] = useState([]);
  const [previousBestCardCandidates, setPreviousBestCardCandidates] = useState(
    []
  );

  /** This is state that tracks the current UI */
  const [bestQuestion, setBestQuestion] = useState("");
  const [bestCard, setBestCard] = useState("");
  const [entropy, setEntropy] = useState(1);
  const [entropyValue, setEntropyValue] = useState(1);

  const [countAfterRejected, setCountAfterRejected] = useState(0);
  const [loading, setLoading] = useState(true);
  const [foundACard, setFoundACard] = useState(false);
  const [bestCardCandidates, setBestCardCandidates] = useState([]);
  const [errorFound, setError] = useState(false);
  const [reverting, setReverting] = useState(false);

  useEffect(() => {
    console.log("Called for first question and set of cards...");
    setLoading(true);
    const fetchFirstQuestion = async () => {
      try {
        await fetch(SERVER_URL, {
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "Content-Type",
          },
        })
          .then((response) => response.json())
          .then((data) => {
            let bestQ = data["bestQuestion"];
            let cardGuessedByServer = data["guessedCard"];
            let entropyVector = JSON.parse(data["entropyVector"]);
            let entropyValue = data["entropyNumber"];
            let topCards = data["bestCardCandidates"];
            setBestQuestion(bestQ);
            setBestCard(cardGuessedByServer);
            setEntropy(entropyVector);
            setEntropyValue(entropyValue);
            setBestCardCandidates(topCards);
            setPreviousBestCardCandidates([topCards]);
            setQuestions([...questions, bestQ]);
            setBestCards([...bestCards, cardGuessedByServer]);
            setEntropyVectors([...entropyVectors, entropyVector]);
            setEntropyValues([...entropyValues, entropyValue]);
          })
          .then((data) => {
            setLoading(false);
          });
      } catch (err) {
        setError(true);
      }
    };

    fetchFirstQuestion();
  }, []);

  const goBackToLastQuestion = async () => {
    if (questions.length <= 1) {
      return;
    }
    setReverting(true);
    setBestQuestion(questions[questions.length - 2]);
    setBestCard(bestCards[bestCards.length - 2]);
    setEntropy(entropyVectors[entropyVectors.length - 2]);
    setEntropyValue(entropyValues[entropyValues.length - 2]);
    setBestCardCandidates(
      previousBestCardCandidates[previousBestCardCandidates.length - 2]
    );

    setQuestions((prev) => [...prev.slice(0, -1)]);
    setAnswers((prev) => [...prev.slice(0, -1)]);
    setEntropyVectors((prev) => [...prev.slice(0, -1)]);
    setEntropyValues((prev) => [...prev.slice(0, -1)]);
    setRejectedCards((prev) => [...prev.slice(0, -1)]);
    setBestCards((prev) => [...prev.slice(0, -1)]);
    setPreviousBestCardCandidates((prev) => prev.slice(0, -1));

    setReverting(false);
  };

  const answerQuestion = async (answer, rejectedCard = null) => {
    setLoading(true);
    await fetch(SERVER_URL, {
      method: "POST",
      body: JSON.stringify({
        Questions: questions,
        Answers: [...answers, answer],
        Entropy: entropy,
        RejectedCards:
          rejectedCard != null
            ? [...rejectedCards, rejectedCard]
            : rejectedCards,
      }),
      headers: {
        "Content-type": "application/json; charset=UTF-8",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    })
      .then((response) => response.json())
      .then((data) => {
        let bestQ = data["bestQuestion"];
        let bestCard = data["guessedCard"];
        let entropyVector = JSON.parse(data["entropyVector"]);
        let entropyValue = data["entropyNumber"];
        let topCards = JSON.parse(data["bestCardCandidates"]);
        let rejectedCards = JSON.parse(data["rejectedCards"]);
        let foundACard = JSON.parse(data["foundACard"]);
        if (rejectedCard) {
          setRejectedCards([...rejectedCards, rejectedCard]);
          setCountAfterRejected(2);
        } else {
          setCountAfterRejected(Math.max(0, countAfterRejected - 1));
        }
        setBestQuestion(bestQ);
        setBestCard(bestCard);
        setEntropy(entropyVector);
        setEntropyValue(entropyValue);
        setBestCardCandidates(topCards);
        setFoundACard(foundACard);
        setPreviousBestCardCandidates([
          ...previousBestCardCandidates,
          topCards,
        ]);
        setAnswers([...answers, answer]);
        setQuestions([...questions, bestQ]);
        setBestCards([...bestCards, bestCard]);
        setEntropyVectors([...entropyVectors, entropyVector]);
        setEntropyValues([...entropyValues, entropyValue]);
        setLoading(false);
      })
      .catch((err) => {
        console.log(err.message);
      });
  };

  const resetGame = () => {};

  return (
    <div class="bg-slate-900 h-screen">
      <div class="relative container h-screen max-w-full bg-slate-900">
        <div class="relative w-screen bg-slate-900 p-2">
          <p class="text-center font-semibold text-slate-50"> MAGIKINATOR </p>
        </div>
        {foundACard ? (
          <div class="flex flex-col self-center justify-center text-slate-50">
            <p class="text-slate-50 self-center font-semibold m-6">
              Is this your card?
            </p>
            <div class="">
              <img
                src={SCRYFALL_IMG_URL + bestCard}
                alt="No Image Found for Card"
                class="self-center border-solid border max-w-lg rounded-lg"
                width={150}
                height={150}
              />
            </div>
            <div class="w-64 flex self-center flex-row items-center">
              {["YES", "NO"].map((answer) => (
                <button
                  class="m-4 mt-6 text-xs w-32 pl-1 pr-1 p-2 border-solid border border-slate-50 font-normal hover:opacity-50 text-slate-50"
                  type="button"
                  onClick={async () => {
                    if (answer == "YES") {
                      return;
                    }

                    if (answer == "NO") {
                      return answerQuestion("NO", bestCard);
                    }
                  }}
                >
                  {answer}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div class="flex flex-col justify-center mt-1">
            <div class="w-44 self-center h-10 mb-2 border-t-0 border-l-0 border-r-0 border">
              <a target="_blank" href="https://scryfall.com/random">
                <FontAwesomeIcon
                  class="w-6 mt-2.5 hover:opacity-25 hover:cursor-pointer text-slate-50"
                  icon="fa-solid fa-dice"
                />
              </a>
            </div>
            <div class="relative self-center w-44 h-60 border rounded bg-slate-800">
              <img
                src={SCRYFALL_IMG_URL + bestCard}
                alt="Searching for your card..."
                class="absolute mt-1 ml-1 self-center border-solid border max-w-lg rounded-lg"
                width={165}
                height={160}
              />
            </div>
            {/* <div class="flex border-solid border h-24">
              {bestCardCandidates.map((card, index) => (
                <img
                  key={"candidate-" + index}
                  src={SCRYFALL_IMG_URL + card}
                  alt="Candidate Cards"
                  class={`relative self-center ml-8 border-solid border max-w-lg rounded-lg left-${
                    index * 50
                  }`}
                  width={75}
                  height={75}
                />
              ))}
            </div> */}
            <div class="justify-end basis-1/2 mt-4">
              <div class="grid justify-items-center content-center p-4 pt-0">
                {loading ? (
                  <div>
                    <div class="text-center p-4 text-base font-semibold text-slate-50">
                      {" "}
                      Loading best question{" "}
                    </div>
                    <div class="flex justify-center">
                      <InfinitySpin width="200" color="#FFFFFF" />
                    </div>
                  </div>
                ) : (
                  <div class="flex justify-center flex-col content-center pb-4">
                    <div class="text-center p-4 pt-3 text-base font-seri font-semibold text-slate-50">
                      {" "}
                      {translateQuestionToString(bestQuestion)[0]}{" "}
                    </div>
                    <div class="w-64 pt-3 flex self-center flex-col items-center">
                      {questions.length >= 2 ? (
                        <button
                          type="button"
                          class="absolute self-start ml-3 text-sm p-1 rounded-md"
                          onClick={async () => goBackToLastQuestion()}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke-width="1.5"
                            stroke="#ffffff"
                            class="w-6 h-6 hover:opacity-20"
                          >
                            <path
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3"
                            />
                          </svg>
                        </button>
                      ) : null}
                      {["YES", "NO", "MAYBE"].map((answer) => (
                        <button
                          class="m-1.5 text-xs w-32 pt-1 pb-1 border-solid border rounded-sm border-slate-50 font-normal hover:opacity-50 text-slate-50"
                          type="button"
                          onClick={async () => answerQuestion(answer)}
                        >
                          {answer}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
