"use client";

import React, { useState, forwardRef, useRef, useEffect } from 'react';
import Image from 'next/image';

export default function Question({ id }: { id: number }) {
    const [answers, setAnswer] = useState<JSX.Element[]>([]);
    // By default there will be one answer

    if (answers.length === 0) {
        const newAnswer = (
            <div className="answer" key={answers.length + 1}>
                <div className="input-box short">
                    <input type="number" placeholder="0-100" />
                </div>
                <div className="input-box short">
                    <input type="text" placeholder="Answer"/>
                </div>
                <div className="input-box long">
                    <input type="text" placeholder="Feedback"/>
                </div>
            </div>
        );
        setAnswer((prevAnswers) => [...prevAnswers, newAnswer]);
    }

    function addAnswer() {
        const newAnswer = (
            <div className="answer" key={answers.length + 1}>
                <div className="input-box short">
                        <input type="number" placeholder="0-100" />
                </div>
                <div className="input-box short">
                    <input type="text" placeholder="Answer"/>
                </div>
                <div className="input-box long">
                    <input type="text" placeholder="Feedback"/>
                </div>
            </div>
        );

        setAnswer((prevAnswers) => [...prevAnswers, newAnswer]);
    }
    return(
        <div className="question">
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
                {answers}
            </div>
            <div className="footer">
                <button onClick={addAnswer}>
                    <Image src="/icons/plus.svg" alt="Add answer" width={20} height={20} />
                    <p>Add answer</p>
                </button>
            </div>
        </div>
    );
}