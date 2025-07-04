"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Question from './question';
import FormReset from './formReset';
import FormDownload from './downloadFile';
import { encode } from 'html-entities';
import {CsvParser, JsonToCSV} from './csvParser';


async function encodeImageToBase64(imageBlob: string): Promise<string | null> {
    try {
        const response = await fetch(imageBlob);
        const contentType = response.headers.get('Content-Type');
        
        if (contentType?.startsWith('image/')) {
            const binaryData = await response.arrayBuffer();
            const uint8Array = new Uint8Array(binaryData);
            const base64 = btoa(uint8Array.reduce((data, byte) => data + String.fromCharCode(byte), ''));
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
function base64ToBlob(base64Data: string): Blob | undefined {
    try{
        const byteString = atob(base64Data.split(',')[1]);
        const mimeString = base64Data.split(',')[0].split(':')[1].split(';')[0];
        
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }

        return new Blob([ab], { type: mimeString });
    }
    catch (error) {
        console.error('Error:', error);
        return;
    }
}
function getDataFromLocalStorage(): QuestionData[] {
    let keys = Object.keys(localStorage);
    let formKeys = keys.filter(key => key.startsWith("question-"));
    let data: QuestionData[] = [];

    if (formKeys.length === 0) {
        let question =  { id: 1, question: "", inWords: "", image_name: "", image_blob: "",answers: [{ successionRate: "", answer: "", feedback: "" },{ successionRate: "", answer: "", feedback: "" }]} as QuestionData;
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
                    if (blob){
                        const blobUrl = URL.createObjectURL(blob);

                        question.image_blob = blobUrl;
                    }
                    else{
                        question.image_blob = "";
                    }
                    break;
            }
        } else if (keyParts.length === 5) {
            let answerId = parseInt(keyParts[3]);
            let answer = question.answers.find(a => a.id === answerId);
            if (!answer) {
                answer = {id: answerId, successionRate: "", answer: "", feedback: "" };
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
            question.answers = [{id: 0, successionRate: "", answer: "", feedback: "" },{ id: 1, successionRate: "", answer: "", feedback: "" }];
        }
        else if (question.answers.length === 1) {
            if (question.answers[0].id === 0) {
                question.answers.push({id:1, successionRate: "", answer: "", feedback: "" });
            }
            else {
                question.answers.unshift({id:0, successionRate: "", answer: "", feedback: "" });
            }
        }
    });
    // Sort the data by id
    let sortedData = data.sort((a, b) => a.id - b.id);
    // Sorts the answers by id
    sortedData.forEach(queston => {
        queston.answers.sort((a, b) => a.id - b.id); 
    });

    for (let i = 0; i < sortedData.length; i++) {
        if (sortedData[i].id !== i + 1) {
            // If the id is not the expected one, we need to update it even in the localStorage
            let previousId = sortedData[i].id;
            sortedData[i].id = i + 1;
            sortedData[i].answers.forEach((answer, index) => {
                answer.id = index;
            });
            sortedData[i].answers.sort((a, b) => a.id - b.id);
            let question = sortedData[i];
            let keys = Object.keys(localStorage);
            let questionKeys = keys.filter(key => key.startsWith("question-" + previousId + "-"));
            questionKeys.forEach(key => {
                localStorage.removeItem(key);
            });
            if (question.question !== "") {
                localStorage.setItem("question-" + question.id + "-question", question.question);
            }
            if (question.inWords !== "") {
                localStorage.setItem("question-" + question.id + "-inWords", question.inWords);
            }
            if (question.image_name !== "") {
                localStorage.setItem("question-" + question.id + "-imageName", question.image_name);
            }
            if (question.image_blob !== "") {
                localStorage.setItem("question-" + question.id + "-imageData", question.image_blob);
            }
            question.answers.forEach(answer => {
                if (answer.successionRate !== "") {
                    localStorage.setItem("question-" + question.id + "-answer-" + answer.id + "-successionRate", String(answer.successionRate));
                }
                if (answer.answer !== "") {
                    localStorage.setItem("question-" + question.id + "-answer-" + answer.id + "-answer", answer.answer);
                }
                if (answer.feedback !== "") {
                    localStorage.setItem("question-" + question.id + "-answer-" + answer.id + "-feedback", answer.feedback);
                }
            });
        }
    }
    return sortedData;
}
function deleteFromLocalStorage(id: number) {
    let keys = Object.keys(localStorage);
    let formKeys = keys.filter(key => key.startsWith("question-" + id));
    formKeys.forEach(key => {
        localStorage.removeItem(key);
    });
}
function getDataFromXML(xml: string): QuestionData[] {
    var XMLParser = require('react-xml-parser');
    const xmlData = new XMLParser().parseFromString(xml);

    let questions: QuestionData[] = [];
    let childrens = xmlData.children;
    childrens.forEach((children: any, index: number) => {
        let question: QuestionData = { id: index + 1, question: "", inWords: "", image_name: "", image_blob: "", answers: [] };
        question.question = children.children[0].children[0].value;
        question.inWords = children.children[1].children[0].value;
        children.children.forEach((child: any, index: number) => {
            if (child.name === "image") {
                question.image_name = child.value;
            }
            else if (child.name === "image_base64") {
                question.image_blob = "data:image/*;base64," +  child.value;
            }
            else if (child.name === "answer") {
                let answer: Answer = { id: index, successionRate: "", answer: "", feedback: "" };
                answer.successionRate = child.attributes.fraction;
                answer.answer = child.children[0].value;
                answer.feedback = child.children[1].children[0].value;
                question.answers.push(answer);
            }
        });
        questions.push(question);
    });
    return questions;
}
/**
 * Uploads a file and processes its content based on the file type (CSV or XML).
 * 
 * @param file - The file to be uploaded. It can be either a CSV or XML file.
 * 
 * The function performs the following steps:
 * 1. Checks if the file is null. If it is, the function returns immediately.
 * 2. If the file is a CSV file:
 *    - Reads the content of the file using FileReader.
 *    - Parses the CSV content using CsvParser.
 *    - Extracts questions and answers from the parsed data.
 *    - Stores the extracted data in localStorage.
 *    - Reloads the window.
 * 3. If the file is an XML file:
 *    - Reads the content of the file using FileReader.
 *    - Extracts questions and answers from the XML content using getDataFromXML.
 *    - Stores the extracted data in localStorage.
 *    - Reloads the window.
 * 4. If the file is neither a CSV nor an XML file, an alert is shown indicating an invalid file type.
 * 
 * Example CSV Template:
 * ```
 * Question,InWords,ImageName,ImageBlob,SuccessionRate1,Answer1,Feedback1,SuccessionRate2,Answer2,Feedback2
 * "What is the capital of France?","Paris","image1.png","<base64-encoded-image>","100","Paris","Correct!","0","London","Incorrect."
 * "What is 2+2?","Four","image2.png","<base64-encoded-image>","100","4","Correct!","0","3","Incorrect."
 * ```
 */
function fileUpload(file: File | null) {
    if (file === null) {
        return;
    }
    // Check if the file is an XML file or an XLS file
    if (file.type === "text/csv") {
        // Get the content of the file
        const reader = new FileReader();
        reader.onload = async (event) => {
            if (event.target) {
                let data = await CsvParser(event.target.result as string);
                let questions = [] as QuestionData[];
                data.forEach((row, index) => {
                    // Skip the first row (header)
                    if (index === 0) {
                        return;
                    }
                    if(row.length < 3){
                        return;
                    }
                    let question = { id: index + 1, question: "", inWords: "", image_name: "", image_blob: "", answers: [] } as QuestionData;
                    question.question = row[0];
                    question.inWords = row[1];
                    question.image_name = row[2];
                    question.image_blob = row[3];
                    for (let i = 4; i < row.length; i += 3) {
                        let answer = { id: i - 2, successionRate: "", answer: "", feedback: "" } as Answer;
                        answer.successionRate = row[i];
                        answer.answer = row[i + 1];
                        answer.feedback = row[i + 2];
                        question.answers.push(answer);
                    }
                    questions.push(question);
                    localStorage.clear();
                    questions.forEach(question => {
                        localStorage.setItem("question-" + question.id + "-question", question.question);
                        if (question.inWords !== "") {
                            localStorage.setItem("question-" + question.id + "-inWords", question.inWords);
                        }
                        if (question.image_name !== "") {
                            localStorage.setItem("question-" + question.id + "-imageName", question.image_name);
                        }
                        if (question.image_blob !== "") {
                            localStorage.setItem("question-" + question.id + "-imageData", question.image_blob);
                        }
                        question.answers.forEach(answer => {
                            if (answer.successionRate !== "") {
                                localStorage.setItem("question-" + question.id + "-answer-" + answer.id + "-successionRate", String(answer.successionRate));
                            }
                            if (answer.answer !== "") {
                                localStorage.setItem("question-" + question.id + "-answer-" + answer.id + "-answer", answer.answer);
                            }
                            if (answer.feedback !== "") {
                                localStorage.setItem("question-" + question.id + "-answer-" + answer.id + "-feedback", answer.feedback);
                            }
                        });
                    });
                });
                window.location.reload();
            }
        };
        reader.readAsText(file);
    } else if (file.type === "text/xml") {
        const reader = new FileReader();
        reader.onload = async (event) => {
            if (event.target) {
                const xml = event.target.result as string;
                const questions = getDataFromXML(xml);
                localStorage.clear();
                questions.forEach(question => {
                    localStorage.setItem("question-" + question.id + "-question", question.question);
                    if (question.inWords !== "") {
                        localStorage.setItem("question-" + question.id + "-inWords", question.inWords);
                    }
                    if (question.image_name !== "") {
                        localStorage.setItem("question-" + question.id + "-imageName", question.image_name);
                    }
                    if (question.image_blob !== "") {
                        localStorage.setItem("question-" + question.id + "-imageData", question.image_blob);
                    }
                    question.answers.forEach(answer => {
                        if (answer.successionRate !== "") {
                            localStorage.setItem("question-" + question.id + "-answer-" + answer.id + "-successionRate", String(answer.successionRate));
                        }
                        if (answer.answer !== "") {
                            localStorage.setItem("question-" + question.id + "-answer-" + answer.id + "-answer", answer.answer);
                        }
                        if (answer.feedback !== "") {
                            localStorage.setItem("question-" + question.id + "-answer-" + answer.id + "-feedback", answer.feedback);
                        }
                    });
                });
                window.location.reload();
            }
        };
        reader.readAsText(file);
    }
    else {
        alert("Invalid file type. Please upload an XML or XLS file.");
    }
}
async function generateCSV(data: QuestionData[]) : Promise<string> {
    let CSVdata = [] as any[];
    let localData = getDataFromLocalStorage();
    // Get the question with most answers
    let maxAnswers = 0;
    localData.forEach(question => {
        if (question.answers.length > maxAnswers) {
            maxAnswers = question.answers.length;
        }
    }
    );
    // Generate header
    let header = ["Question", "InWords", "ImageName", "ImageBlob"];
    for (let i = 0; i < maxAnswers; i++) {
        header.push("SuccessionRate" + (i + 1), "Answer" + (i + 1), "Feedback" + (i + 1));
    }
    console.log(header);
    console.log(localData); 
    localData.forEach((question, index) => {
        CSVdata[index] = {
            Question: question.question,
            InWords: question.inWords,
            ImageName: question.image_name,
            ImageBlob: question.image_blob,
        };
        question.answers.forEach((answer, answerIndex) => {
            CSVdata[index][`SuccessionRate${answerIndex + 1}`] = answer.successionRate || 0;
            CSVdata[index][`Answer${answerIndex + 1}`] = answer.answer || "";
            CSVdata[index][`Feedback${answerIndex + 1}`] = answer.feedback || "";
        })
        if (index === 0){
            // Add empty answers until number of answers is == to maxAnswers
            let counter = question.answers.length
            while (counter < maxAnswers){
                CSVdata[index][`SuccessionRate${counter + 1}`] = 0;
                CSVdata[index][`Answer${counter + 1}`] = "";
                CSVdata[index][`Feedback${counter + 1}`] = "";
                counter++;
            }
        }
    })

    return JsonToCSV(CSVdata).then((csv) => {
        return csv;
    });
}


export default function Form() {
    const [questions, setQuestions] = useState<QuestionData[]>([]);
    const [open, setOpen] = useState(false);
    const [loadingText, setLoadingText] = useState("Loading");
    const [download, setDownload] = useState(false);

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
            answers: [{id: 0, successionRate: "", answer: "", feedback: "" },{ id: 1, successionRate: "", answer: "", feedback: "" }],
        };
        setQuestions((prevQuestions) => [...prevQuestions, newQuestion]);
    };

    const deleteQuestion = (id: number) => {
        setQuestions((prevQuestions) => prevQuestions.filter((q) => q.id !== id));
        deleteFromLocalStorage(id);
    };

    const updateQuestion = (id: number, updatedQuestion: QuestionData) => {
        setQuestions((prevQuestions) =>
            prevQuestions.map((q) => (q.id === id ? updatedQuestion : q))
        );
    };

    const exportData = async (fileName: string, csv: boolean = false) => {
        if (!csv){
            await generateXML(questions).then(xml => {
                const blob = new Blob([xml], { type: "application/xml" });
                const url = URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.href = url;
                link.download = fileName + ".xml";
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
            });
        }
        else{
            await generateCSV(questions).then(csv => {
                const blob = new Blob([csv], { type: "text/csv" });
                const url = URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.href = url;
                link.download = fileName + ".csv";
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
            });
        }
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
                <button onClick={() => setDownload(true)}>
                    <Image src="/icons/plus.svg" alt="Export" width={20} height={20} />
                    <p>Export</p>
                </button>
                <div className='uploadReset'>
                    <button className="reset" onClick={() => setOpen(true)}>
                        <p>Reset form</p>
                    </button>
                <input
                    type="file"
                    style={{ display: 'none' }}
                    id="fileInput"
                    accept='.xml, .csv'
                    onChange={(e) => {
                        if (e.target.files && e.target.files.length > 0) {
                            fileUpload(e.target.files[0]);
                        }
                    }}
                />
                <button className="upload" onClick={() => document.getElementById('fileInput')?.click()}>
                    <p>Upload file</p>
                </button>
                </div>
            </footer>
            <FormReset data={questions} open={open} onClose={() => setOpen(false)} />
            <FormDownload exportData={exportData} open={download} onClose={() => setDownload(false)} />
        </div>
    );
}