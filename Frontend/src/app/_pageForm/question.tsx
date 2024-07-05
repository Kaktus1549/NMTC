"use client";

import React, { useState, forwardRef, useRef, useEffect } from 'react';
import Image from 'next/image';

export default function Question({ id }: { id: number }) {
    // List of answers
    const [answersList, setAnswer] = useState<JSX.Element[]>([]);

    function deleteAnswer(id: number) {
        const answer = document.getElementById(`answer-${id}`);
        answer?.remove();
    }

    // Add a new answer
    function addAnswer() {
        const newAnswer = (
            <div className="answer" key={answersList.length + 1} id={`answer-${answersList.length + 1}`}>
                <div className="input-box short">
                        <input type="number" placeholder="0-100" max="100" min="0"/>
                </div>
                <div className="input-box short">
                    <input type="text" placeholder="Answer"/>
                </div>
                <div className="input-box long">
                    <input type="text" placeholder="Feedback"/>
                </div>
                { answersList.length > 0 ?
                    <button className="answer-delete" onClick={() => deleteAnswer(answersList.length + 1)}>
                        <Image src="/icons/delete.png" alt="Delete answer" width={17} height={17} />
                    </button>
                : null}
            </div>
        );

        setAnswer((prevAnswers) => [...prevAnswers, newAnswer]);
    }

    // By default there will be one answer
    if (answersList.length === 0) {
        addAnswer();
    }

    function deleteSelf() {
        // Delete the question
        if (id === 1) {
            return;
        }
        const question = document.getElementById(`question-${id}`);
        question?.remove();
    }

    // Render the question
    return(
        <div className="question" id={`question-${id}`}>
            <div className="header">
                <input type="text" placeholder={`Question #${id}`}/>
                <input type="text" placeholder="Question in words" className="in-words"/>
            </div>
            <div className="body">
                <div className="help">
                    <p className="short">Succesion rate in %</p>
                    <p className="short">Answer</p>
                    <p className="long">Feedback</p>
                </div>
                {answersList}
            </div>
            <div className="footer">
                <button onClick={addAnswer}>
                    <Image src="/icons/plus.svg" alt="Add answer" width={20} height={20} />
                    <p>Add answer</p>
                </button>
            </div>
            {id !== 1 ?
                <button className='question-delete' onClick={deleteSelf}>
                    <Image src="/icons/delete.png" alt="Delete question" width={20} height={20} />
                </button>
            : null
            }
        </div>
    );
}