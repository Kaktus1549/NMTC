"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import Question from './question';

function getData(){
    let data = [] as QuestionData[];
    let questionElements = document.getElementsByClassName("question");
    // Circle through all questions divs
    for (let i = 0; i < questionElements.length; i++){
        let questionElement = questionElements[i];
        let question: QuestionData = {
            question: "",
            inWords: "",
            answers: []
        };
        // Get question data
        question.question = questionElement.getElementsByClassName("header")[0].getElementsByTagName("input")[0].value;
        question.inWords = questionElement.getElementsByClassName("header")[0].getElementsByTagName("input")[1].value;
        let answers = questionElement.getElementsByClassName("answer");
        let answersData = [] as Answer[];
        for (let j = 0; j < answers.length; j++){
            let answerElement = answers[j];
            let answer: Answer = {
                successionRate: 0,
                answer: "",
                feedback: ""
            };
            answer.successionRate = Number(answerElement.getElementsByClassName("input-box short")[0].getElementsByTagName("input")[0].value);
            if (answer.successionRate < 0){
                answer.successionRate = 0;
            }
            if (answer.successionRate > 100){
                answer.successionRate = 100;
            }
            answer.answer = answerElement.getElementsByClassName("input-box short")[1].getElementsByTagName("input")[0].value;
            answer.feedback = answerElement.getElementsByClassName("input-box long")[0].getElementsByTagName("input")[0].value;
            answersData.push(answer);
        }
        question.answers = answersData;
        data.push(question);
        // In future it will be good to do this by reference
    }
    return data;
}
function generateXML(data: QuestionData[]){
    let xml = `<?xml version="1.0"?>\n<quiz>\n`;
    data.forEach((question) => {
        let questionXML = `
    <question type="multichoice">
        <name>
            <text>${question.question}</text>
        </name>
        <questiontext format="html">
            <text>${question.inWords}</text>
        </questiontext>${question.answers.map((answer) => {
            return `
        <answer fraction="${answer.successionRate}">
            <text>${answer.answer}</text>
            <feedback>
                <text>${answer.feedback}</text>
            </feedback>
        </answer>`;
        }).join('')}
        <shuffleanswers>1</shuffleanswers>
        <single>true</single>
        <answernumbering>abc</answernumbering>
    </question>
`;
        xml += questionXML;
    });
    xml += `</quiz>`;
    return xml;
}

export default function Form() {
    const [questions, setQuestions] = useState<JSX.Element[]>([]);

    function addQuestion() {
        const newQuestion = (
            <Question id={questions.length + 1} key={questions.length + 1} />
        );

        setQuestions((prevQuestions) => [...prevQuestions, newQuestion]);
    }

    if (questions.length === 0) {
        addQuestion();
    }

    function exportData(){
        let data = getData();
        let xml = generateXML(data);
        const blob = new Blob([xml], {type: "application/xml"});
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.download = "quiz.xml";
        link.href = url;
        link.click();
    }

    return (
        <div className="form">
            {questions}
            <footer>
                <button onClick={addQuestion}>
                    <Image src="/icons/plus.svg" alt="Add question" width={20} height={20} />
                    <p>Add question</p>
                </button>
                <button onClick={exportData}>
                    <Image src="/icons/plus.svg" alt="Export" width={20} height={20} />
                    <p>Export</p>
                </button>
            </footer>
        </div>
    );
}
