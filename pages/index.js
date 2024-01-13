import "tailwindcss/tailwind.css";
import "@fortawesome/fontawesome-svg-core/styles.css";
import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { InfinitySpin } from "react-loader-spinner";
import translateQuestionToString from "data/questionTranslator.js";
import Fireworks from "react-canvas-confetti/dist/presets/fireworks";
import localFont from "next/font/local";
import { Roboto } from "next/font/google";
import { fas } from "@fortawesome/free-solid-svg-icons";
import { faDice } from "@fortawesome/free-solid-svg-icons";
const { library } = require("@fortawesome/fontawesome-svg-core");
library.add(fas, faDice);
import { config } from "@fortawesome/fontawesome-svg-core";
config.autoAddCss = false;

const manaFont = localFont({ src: "../public/fonts/mana.woff2" });
const roboticFont = localFont({
  src: "../public/fonts/MechanismoRegular-p7ywa.otf",
});
const roboto = Roboto({
  weight: "400",
  style: "normal",
  subsets: ["latin"],
});

const canvasStyles = {
  position: "fixed",
  pointerEvents: "none",
  width: "100%",
  height: "100%",
  top: 0,
  left: 0,
  zIndex: 2,
};

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
  const [winScreen, setWinScreen] = useState(false);
  const [restartScreen, setRestartScreen] = useState(false);
  const [tutorialScreen, setTutorialScreen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    console.log("Called for first question and set of cards...");
    setLoading(true);
    // onRun();
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
            let cardGuessedByServer = "Treasure";
            let entropyVector = JSON.parse(data["entropyVector"]);
            let entropyValue = data["entropyNumber"];
            let topCards = data["bestCardCandidates"];
            setBestQuestion(bestQ);
            setBestCard(cardGuessedByServer);
            setEntropy(entropyVector);
            setEntropyValue(1);
            setBestCardCandidates(topCards);
            setPreviousBestCardCandidates([topCards]);
            setQuestions([bestQ]);
            setBestCards([cardGuessedByServer]);
            setEntropyVectors([entropyVector]);
            setEntropyValues([entropyValue]);
            setRejectedCards([]);
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

  // Gets called at reset.
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
          setQuestions([bestQ]);
          setBestCards([cardGuessedByServer]);
          setEntropyVectors([entropyVector]);
          setEntropyValues([entropyValue]);
          setRejectedCards([]);
        })
        .then((data) => {
          setLoading(false);
        });
    } catch (err) {
      setError(true);
    }
  };

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

  const gameEndScreen = () => {
    onRun();
    setWinScreen(true);
  };

  const resetGame = () => {
    onStop();
    setWinScreen(false);
    setRestartScreen(false);
    setLoading(true);
    fetchFirstQuestion();
    setFoundACard(false);
  };

  /* Logic for Confetti Explosion */
  const [conductor, setConductor] = useState();
  const onRun = () => {
    conductor?.run({ speed: 0.5 });
  };
  const onStop = () => {
    conductor?.stop();
  };

  const onInit = ({ conductor }) => {
    setConductor(conductor);
  };

  const blurMap = () => {
    if (entropyValue >= 1) {
      return "blur-xl";
    }
    if (entropyValue >= 0.2) {
      return "blur-lg";
    }
    if (entropyValue >= 0.01) {
      return "blur-md";
    }
    if (entropyValue >= 0.0001) {
      return "blur";
    }
  };

  return (
    <div className="flex w-screen h-screen justify-center">
      {tutorialScreen ? <div></div> : null}
      {restartScreen ? (
        <div class="fixed self-center bg-slate-500 z-10 w-[360px] h-[300px] text-center rounded-lg border border-black">
          <div class="relative border text-5xl border-black h-[100%] pt-20">
            <div className={"text-slate-200"}>Restart?</div>
            <button
              class="mt-12 m-6 text-3xl w-32 pt-2 pb-2 border-solid border rounded-sm border-slate-50 font-semibold hover:opacity-70"
              onClick={() => resetGame()}
            >
              Yes
            </button>
            <button
              class="mt-12 text-3xl w-32 pt-2 pb-2 border-solid border rounded-sm border-slate-50 font-semibold hover:opacity-70"
              onClick={() => setRestartScreen(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : null}
      {winScreen ? (
        <div class="fixed self-center w-[500px] h-[750px] bg-slate-400 border border-black rounded-lg z-10">
          <div
            class={
              "mt-12 lg:text-5xl md:text-2xl text-center self-center font-semibold " +
              roboto.className
            }
          >
            Silly human, you have been{" "}
            <span class={"text-red-900 " + roboticFont.className}>
              Magikinat'ed
            </span>
          </div>
          <div class="flex flex-col justify-center">
            <div
              class={
                "flex flex-col justify-center relative self-center w-[500px] h-[550px] mt-4 text-center " +
                roboto.className
              }
            >
              <img
                src={SCRYFALL_IMG_URL + bestCard}
                alt=""
                class={
                  "self-center text-center rounded-lg hover:pointer md:mt-4 lg:mt-4"
                }
                width={275}
              />
              <div class="lg:mt-8 md:mt-6 md:text-2xl">
                {" "}
                Has already been played 5000 times{" "}
              </div>
              <div class="md:mt-0 md:text-lg"> Last played 01/05/2024 </div>
              <button
                class="lg:mt-4 lg:w-96 lg:h-16 lg:text-2xl mt-4 pt-3 pb-3 p-8 self-center border border-slate-100 rounded hover:opacity-60 pointer-events-auto"
                onClick={() => resetGame()}
              >
                {" "}
                Play Again?{" "}
              </button>
            </div>
          </div>
        </div>
      ) : null}
      <div
        class={
          "h-screen bg-slate-900 " +
          (winScreen || restartScreen
            ? " brightness-50 pointer-events-none"
            : "")
        }
      >
        <Fireworks onInit={onInit} style={canvasStyles} />
        <div class="relative container max-w-full bg-slate-900">
          <div class="relative w-screen bg-slate-900 p-2">
            <p
              class={
                "text-center font-semibold text-5xl pt-12 pb-2 text-slate-50 " +
                roboticFont.className
              }
            >
              {" "}
              MAGIKINATOR{" "}
            </p>
          </div>
          {foundACard && countAfterRejected == 0 ? (
            <div class="flex flex-col self-center justify-center text-slate-50">
              <p class="text-slate-50 text-4xl self-center font-semibold m-6">
                Is this your card?
              </p>
              <div class="relative self-center w-[360px] h-[500px] mt-3 rounded bg-amber-400 hover:pointer">
                <div class="absolute w-44 h-60 rounded brightness-100 hover:brightness-75">
                  <button
                    class="absolute w-55 h-60 z-30 hover:pointer"
                    onClick={() => {}}
                  />
                  <img
                    src={SCRYFALL_IMG_URL + bestCard}
                    alt=""
                    class="absolute mt-1 ml-1 self-center max-w-lg text-center rounded-lg hover:pointer"
                    width={350}
                  />
                </div>
              </div>
              <div class="w-64 flex self-center flex-row items-center">
                {["YES", "NO"].map((answer) => (
                  <button
                    class="m-4 mt-10 text-3xl w-96 pl-1 pr-1 p-6 border-solid border border-slate-50 hover:opacity-50 text-slate-50"
                    type="button"
                    onClick={async () => {
                      if (answer == "YES") {
                        return gameEndScreen();
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
            <div
              class={
                "flex flex-col justify-center mt-2 " +
                (winScreen || restartScreen ? "brightness-50" : "")
              }
            >
              <div class="flex justify-center w-1/6 min-w-[150px] self-center h-20 mb-10 border-t-0 border-l-0 border-r-0 border">
                <a
                  key="random-icon-1"
                  target="_blank"
                  href="https://scryfall.com/random"
                  class="mt-2 text-slate-50 hover:opacity-50"
                >
                  <FontAwesomeIcon
                    class="hover:opacity-25 hover:cursor-pointer text-slate-50"
                    icon={["fas", "dice"]}
                    size="3x"
                  />
                </a>
                <a
                  key="search-icon-1"
                  target="_blank"
                  href="https://scryfall.com"
                  class="ml-10 mt-2 text-slate-50 hover:opacity-50"
                >
                  <FontAwesomeIcon
                    class="hover:opacity-25 hover:cursor-pointer text-slate-50"
                    icon={["fas", "magnifying-glass"]}
                    size="3x"
                  />
                </a>
              </div>
              <div class="relative self-center w-[360px] h-[500px] mt-3 rounded bg-amber-400 hover:pointer">
                <div class="absolute w-44 h-60 rounded brightness-100 hover:brightness-75">
                  <button
                    class="absolute w-44 h-60 z-30 hover:pointer"
                    onClick={() => {}}
                  />
                  <img
                    src={SCRYFALL_IMG_URL + bestCard}
                    alt=""
                    class={
                      "absolute mt-1 ml-1 self-center max-w-lg text-center rounded-lg hover:pointer " +
                      blurMap(questions.length)
                    }
                    width={350}
                  />
                </div>
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
              <div class="justify-end basis-1/2 mt-1">
                <div class="grid justify-items-center content-center p-4 pt-0">
                  {loading ? (
                    <div>
                      <div
                        class={
                          "text-center p-5 text-lg font-semibold text-slate-50 " +
                          roboto.className
                        }
                      >
                        Loading best question
                      </div>
                      <div class="flex justify-center">
                        <InfinitySpin width="200" color="#FFFFFF" />
                      </div>
                    </div>
                  ) : (
                    <div class="flex justify-center flex-col content-center pb-4">
                      <div
                        class={
                          "text-center pb-6 pt-12 text-3xl font-semibold text-slate-50 " +
                          roboto.className
                        }
                      >
                        {" "}
                        {translateQuestionToString(bestQuestion).text}
                        <span class="flex justify-center">
                          {translateQuestionToString(bestQuestion).symbols.map(
                            (symbol, i) => (
                              <img
                                src={symbol}
                                className={`relative w-[45px] h-[45px] mt-3 ml-2`}
                              ></img>
                            )
                          )}
                        </span>
                      </div>
                      {/* <progress
                        value={entropyValue}
                        class="w-96 self-center h-2 rounded-sm border-t-0 border-slate-900 border bg-slate-300"
                      /> */}
                      <div class="relative w-96 pt-4 flex flex-row self-center flex-col items-center">
                        {questions.length >= 2 ? (
                          <div class="absolute right-0 h-40 mt-8">
                            <button
                              type="button"
                              class="absolute self-start ml-4 text-lg rounded-md"
                              onClick={async () => goBackToLastQuestion()}
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke-width="1.5"
                                stroke="#ffffff"
                                class="w-12 h-12 hover:opacity-20"
                              >
                                <path
                                  stroke-linecap="round"
                                  stroke-linejoin="round"
                                  d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3"
                                />
                              </svg>
                            </button>
                            <button
                              type="button"
                              class="absolute self-start mt-24 ml-4 text-sm rounded-md hover:opacity-50"
                              onClick={async () => setRestartScreen(true)}
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke-width="1.5"
                                stroke="#FAA916"
                                class="w-12 h-12"
                              >
                                <path
                                  stroke-linecap="round"
                                  stroke-linejoin="round"
                                  d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
                                />
                              </svg>
                            </button>
                          </div>
                        ) : null}
                        <div className="flex flex-col self-center justify-center w-[100%] h-[100%]">
                          {["YES", "NO", "MAYBE"].map((answer, i) => (
                            <button
                              class={
                                `self-center mt-4 text-3xl w-64 pt-1 pb-1 border-solid border rounded-lg border-slate-50 font-semibold hover:opacity-70 ` +
                                roboto.className +
                                (answer == "YES"
                                  ? " text-emerald-400 hover:border-emerald-400"
                                  : answer == "NO"
                                  ? " text-red-400 hover:border-red-400"
                                  : " text-slate-50 hover:border-slate-50")
                              }
                              type="button"
                              onClick={async () => answerQuestion(answer)}
                            >
                              {answer}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
