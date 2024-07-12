"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { encode } from 'html-entities';
import { lookup } from 'mime-types';
import Question from './question';

async function getData(){
    let data = [] as QuestionData[];
    let questionElements = document.getElementsByClassName("question");
    // Circle through all questions divs
    for (let i = 0; i < questionElements.length; i++){
        let questionElement = questionElements[i];
        let question: QuestionData = {
            question: "",
            inWords: "",
            image_name: "",
            image_data: "",
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
        let image = questionElement.getElementsByClassName("uploaded")[0];
        if (image !== undefined){
            let blobUrl = image.getAttribute("src");
            let image_name = image.getAttribute("alt");
            if (blobUrl !== null && image_name !== null) {
                await fetch(blobUrl).then(response => {
                    const contentType = response.headers.get('Content-Type');
                    if(contentType?.startsWith('image/')) {
                        return response.arrayBuffer();
                    }
                    else{
                        console.error("Blob url does not point to an image");
                        alert("It seems that image "+ image_name + " is not an image. Please remove it and try again.")
                        return null;
                    }
                })
                .then(binaryData => {
                    if (binaryData !== null){
                        const uint8Array = new Uint8Array(binaryData);
                        const base64 = btoa(String.fromCharCode(...uint8Array));
                        question.image_data = base64;
                        question.image_name = image_name;
                    }
                    question.image_data = "";
                    question.image_name = "";
                 });
            }
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
        let questionXML = `    <question type="multichoice">
        <name>
            <text>${encode(question.question, {level: 'xml'})}</text>
        </name>
        <questiontext format="html">
            <text>${encode(question.inWords, {level: 'xml'})}</text>
        </questiontext>${question.answers.map((answer) => {
            return `
        <answer fraction="${encode(String(answer.successionRate))}">
            <text>${encode(answer.answer, {level: 'xml'})}</text>
            <feedback>
                <text>${encode(answer.feedback, {level: 'xml'})}</text>
            </feedback>
        </answer>`;
        }).join('')}
        <shuffleanswers>1</shuffleanswers>
        <single>true</single>
        <answernumbering>abc</answernumbering>
        ${question.image_data !== "" ? `<image>${encode(question.image_name, {level: 'xml'})}</image>
        <image_base64>${question.image_data}</image_base64>` : ""}
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

    async function exportData(){
        let data = await getData();
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