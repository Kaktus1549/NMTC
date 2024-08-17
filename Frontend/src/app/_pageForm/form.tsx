"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Question from './question';
import FormReset from './formReset';
import { encode } from 'html-entities';

async function encodeImageToBase64(imageBlob: string): Promise<string | null> {
    try {
        const response = await fetch(imageBlob);
        const contentType = response.headers.get('Content-Type');
        
        if (contentType?.startsWith('image/')) {
            const binaryData = await response.arrayBuffer();
            const uint8Array = new Uint8Array(binaryData);
            const base64 = btoa(String.fromCharCode(...uint8Array));
            return base64;
        } else {
            console.error("Blob URL does not point to an image");
            alert("It seems that image " + imageBlob + " is not an image. Please remove it and try again.");
            return null;
        }
    } catch (error) {
        console.error('Error:', error);
        alert("An error occurred while trying to encode the image. Please try again.");
        return null;
    }
}
async function generateXML(data: QuestionData[]) {
    const xmlPromises = data.map(async (question) => {
        let base64Image = "" as string | null;
        if (question.image_blob !== "") {
            base64Image = await encodeImageToBase64(question.image_blob);
        }
        else{
            base64Image = "";
        }

        return `    <question type="multichoice">
        <name>
            <text>${encode(question.question, { level: 'xml' })}</text>
        </name>
        <questiontext format="html">
            <text>${encode(question.inWords, { level: 'xml' })}</text>
        </questiontext>${question.answers.map((answer) => {
            return `
        <answer fraction="${encode(String(answer.successionRate))}">
            <text>${encode(answer.answer, { level: 'xml' })}</text>
            <feedback>
                <text>${encode(answer.feedback, { level: 'xml' })}</text>
            </feedback>
        </answer>`;
        }).join('')}
        <shuffleanswers>1</shuffleanswers>
        <single>true</single>
        <answernumbering>abc</answernumbering>
        ${question.image_blob !== "" ? `<image>${encode(question.image_name, { level: 'xml' })}</image>
        <image_base64>${base64Image}</image_base64>` : ""}
    </question>
`;
    });

    const xmlQuestions = await Promise.all(xmlPromises);

    let xml = `<?xml version="1.0"?>\n<quiz>\n${xmlQuestions.join('')}\n</quiz>`;
    return xml;
}
function base64ToBlob(base64Data: string): Blob {
    const byteString = atob(base64Data.split(',')[1]);
    const mimeString = base64Data.split(',')[0].split(':')[1].split(';')[0];
    
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }

    return new Blob([ab], { type: mimeString });
}
function getDataFromLocalStorage(): QuestionData[] {
    let keys = Object.keys(localStorage);
    let formKeys = keys.filter(key => key.startsWith("question-"));
    let data: QuestionData[] = [];

    if (formKeys.length === 0) {
        let question =  { id: 1, question: "", inWords: "", image_name: "", image_blob: "",answers: [{ successionRate: 0, answer: "", feedback: "" },{ successionRate: 0, answer: "", feedback: "" }]} as QuestionData;
        data.push(question);
        return data;
    }
    // Example of keys: question-1-inWords, question-1-question, question-1-image_name, question-1-image_blob, question-1-answer-1, question-1-answer-2
    formKeys.forEach(key => {
        let keyParts = key.split("-");
        let questionId = parseInt(keyParts[1]);
        let question = data.find(q => q.id === questionId);
        if (!question) {
            question = { id: questionId, question: "", inWords: "", image_name: "", image_blob: "", answers: [] };
            data.push(question);
        }
        let value = localStorage.getItem(key);
        if (keyParts.length === 3) {
            switch (keyParts[2]) {
                case "question":
                    question.question = value || "";
                    break;
                case "inWords":
                    question.inWords = value || "";
                    break;
                case "imageName":
                    question.image_name = value || "";
                    break;
                case "imageData":
                    const blob = base64ToBlob(value || "");
                    const blobUrl = URL.createObjectURL(blob);

                    question.image_blob = blobUrl;
                    break;
            }
        } else if (keyParts.length === 5) {
            let answerId = parseInt(keyParts[3]);
            let answer = question.answers.find(a => a.id === answerId);
            if (!answer) {
                answer = {id: answerId, successionRate: 0, answer: "", feedback: "" };
                question.answers.push(answer);
            }
            switch (keyParts[4]) {
                case "successionRate":
                    answer.successionRate = parseInt(value || "0");
                    break;
                case "answer":
                    answer.answer = value || "";
                    break;
                case "feedback":
                    answer.feedback = value || "";
                    break;
            }
        }
    });

    data.forEach(question => {
        if (question.answers.length === 0) {
            question.answers = [{id: 0, successionRate: 0, answer: "", feedback: "" },{ id: 1, successionRate: 0, answer: "", feedback: "" }];
        }
        else if (question.answers.length === 1) {
            if (question.answers[0].id === 0) {
                question.answers.push({id:1, successionRate: 0, answer: "", feedback: "" });
            }
            else {
                question.answers.unshift({id:0, successionRate: 0, answer: "", feedback: "" });
            }
        }
    });
    return data;
}
export default function Form() {
    const [questions, setQuestions] = useState<QuestionData[]>([]);
    const [open, setOpen] = useState(false);
    const [loadingText, setLoadingText] = useState("Loading");

    useEffect(() => {
        if (typeof localStorage !== "undefined") {
            const storedQuestions = getDataFromLocalStorage();
            setQuestions(storedQuestions);
        }
    }, []);
    useEffect(() => {
        // The loading starts as "Loding" and then it adds a dot every 500ms
        // When it reaches "Loading...." it resets to "Loading"
        const interval = setInterval(() => {
            setLoadingText((prevText) => {
                if (prevText === "Loading....") {
                    return "Loading";
                }
                return prevText + ".";
            });
        }, 500);
        return () => clearInterval(interval);
    });
    const addQuestion = () => {
        const newQuestion: QuestionData = {
            id: questions.length + 1,
            question: "",
            inWords: "",
            image_name: "",
            image_blob: "",
            answers: [{id: 0, successionRate: 0, answer: "", feedback: "" },{ id: 1, successionRate: 0, answer: "", feedback: "" }],
        };
        setQuestions((prevQuestions) => [...prevQuestions, newQuestion]);
    };

    const deleteQuestion = (id: number) => {
        setQuestions((prevQuestions) => prevQuestions.filter((q) => q.id !== id));
    };

    const updateQuestion = (id: number, updatedQuestion: QuestionData) => {
        setQuestions((prevQuestions) =>
            prevQuestions.map((q) => (q.id === id ? updatedQuestion : q))
        );
    };

    const exportData = async () => {
        await generateXML(questions).then(xml => {
            const blob = new Blob([xml], { type: "application/xml" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.download = "quiz.xml";
            link.href = url;
            link.click();
        });
    };

    return (
        <div className="form">
            { questions.length !== 0 ?
            questions.map((q) => (
                <Question
                    key={q.id}
                    data={q}
                    onDelete={() => deleteQuestion(q.id)}
                    onUpdate={(updatedData: QuestionData) => updateQuestion(q.id, updatedData)}
                />
            ))
            :
            <>
                <div className="spinner">
                </div>
                <p className='loading'>{loadingText}</p>
            </>
            }
            <footer>
                <button onClick={addQuestion}>
                    <Image src="/icons/plus.svg" alt="Add question" width={20} height={20} />
                    <p>Add question</p>
                </button>
                <button onClick={exportData}>
                    <Image src="/icons/plus.svg" alt="Export" width={20} height={20} />
                    <p>Export</p>
                </button>
                <button className="reset" onClick={() => setOpen(true)}>
                    <p>Reset form</p>
                </button>
            </footer>
            <FormReset data={questions} open={open} onClose={() => setOpen(false)} />
        </div>
    );
}