import React, { useState } from 'react';
import Image from 'next/image';

export default function Question({ data, onDelete, onUpdate }  : { data: QuestionData, onDelete: () => void, onUpdate: (question: QuestionData) => void }) {
    const [questionData, setQuestionData] = useState(data);

    const handleInputChange = (field : string, value : string) => {
        const updatedQuestion = { ...questionData, [field]: value };
        setQuestionData(updatedQuestion);
        onUpdate(updatedQuestion);
        if (value !== "") {
            let key = `question-${data.id}-${field}`;
            localStorage.setItem(key, value);
        }
        else{
            let key = `question-${data.id}-${field}`;
            localStorage.removeItem(key);
        }
    };

    const handleAnswerChange = (index: number, field: string, value: string) => {
        const updatedAnswers = [...questionData.answers];
        updatedAnswers[index] = { ...updatedAnswers[index], [field]: value };
        const updatedQuestion = { ...questionData, answers: updatedAnswers };
        setQuestionData(updatedQuestion);
        onUpdate(updatedQuestion);
        if (value !== "") {
            let key = `question-${data.id}-answer-${index}-${field}`;
            localStorage.setItem(key, value);
        }
        else{
            let key = `question-${data.id}-answer-${index}-${field}`;
            localStorage.removeItem(key);
        }
    };

    const addAnswer = () => {
        let answerId = questionData.answers.length;
        const newAnswer = {id: answerId, successionRate: undefined, answer: "", feedback: "" };
        const updatedAnswers = [...questionData.answers, newAnswer];
        const updatedQuestion = { ...questionData, answers: updatedAnswers };
        setQuestionData(updatedQuestion);
        onUpdate(updatedQuestion);
    };

    const deleteAnswer = (index: number) => {
        // Deletes the local storage data of the deleted answer
        let key = `question-${data.id}-answer-${index}-successionRate`;
        localStorage.removeItem(key);
        key = `question-${data.id}-answer-${index}-answer`;
        localStorage.removeItem(key);
        key = `question-${data.id}-answer-${index}-feedback`;
        localStorage.removeItem(key);
        const updatedAnswers = questionData.answers.filter((_, i) => i !== index);
        const updatedQuestion = { ...questionData, answers: updatedAnswers };
        setQuestionData(updatedQuestion);
        onUpdate(updatedQuestion);
    };

    const handleImageChange = (e : React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length) {
            const image = e.target.files[0];
            let imageName = image.name;
            const imagePreview = URL.createObjectURL(image);
            const updatedQuestion = {
                ...questionData,
                image_name: image.name,
                image_blob: imagePreview,
            };
            setQuestionData(updatedQuestion);
            onUpdate(updatedQuestion);
            let key = `question-${data.id}-imageData`;
            const reader = new FileReader();
            reader.onload = (e) => {
                if (e.target && e.target.result) {
                    const base64 = e.target.result.toString();
                    localStorage.setItem(key, base64);
                }
            };
            reader.readAsDataURL(image);
            let nameKey = `question-${data.id}-imageName`;
            localStorage.setItem(nameKey, imageName);
        }
    };

    const deleteImage = () => {
        const updatedQuestion = { ...questionData, image_name: "", image_blob: "" };
        setQuestionData(updatedQuestion);
        onUpdate(updatedQuestion);
        let key = `question-${data.id}-imageData`;
        localStorage.removeItem(key);
        let nameKey = `question-${data.id}-imageName`;
        localStorage.removeItem(nameKey);
    }

    return (
        <div className="question">
            <div className="header">
                <input
                    type="text"
                    value={questionData.question}
                    onChange={(e) => handleInputChange('question', e.target.value)}
                    placeholder={`Question #${data.id}`}
                />
                <input
                    type="text"
                    value={questionData.inWords}
                    onChange={(e) => handleInputChange('inWords', e.target.value)}
                    placeholder="Question in words"
                    className="in-words"
                />
                {questionData.image_blob === "" ? (
                    <input
                        type="file"
                        className="image-upload"
                        onChange={handleImageChange}
                        accept="image/*"
                    />
                ) : (
                    <div className="uploaded-cont">
                        <Image src={questionData.image_blob} alt={questionData.image_name} width={1024} height={1024} className="uploaded" />
                        <button
                            onClick={() => deleteImage()}
                            className="remove-image"
                        >
                            <Image src="/icons/delete.png" alt="Delete image" width={20} height={20} />
                        </button>
                    </div>
                )}
            </div>
            <div className="body">
                <div className="help">
                    <p className="short">Succession rate in %</p>
                    <p className="short">Answer</p>
                    <p className="long">Feedback</p>
                </div>
                {questionData.answers.map((answer, index) => (
                    <div className="answer" key={index}>
                        <div className="input-box short">
                            <input
                                type="number"
                                value={answer.successionRate}
                                onChange={(e) => handleAnswerChange(index, 'successionRate', e.target.value)}
                                placeholder="0-100"
                                max="100"
                                min="0"
                            />
                        </div>
                        <div className="input-box short">
                            <input
                                type="text"
                                value={answer.answer}
                                onChange={(e) => handleAnswerChange(index, 'answer', e.target.value)}
                                placeholder="Answer"
                            />
                        </div>
                        <div className="input-box long">
                            <input
                                type="text"
                                value={answer.feedback}
                                onChange={(e) => handleAnswerChange(index, 'feedback', e.target.value)}
                                placeholder="Feedback"
                            />
                        </div>
                        {questionData.answers.length > 2 && (
                            <button className="answer-delete" onClick={() => deleteAnswer(index)}>
                                <Image src="/icons/delete.png" alt="Delete answer" width={17} height={17} />
                            </button>
                        )}
                    </div>
                ))}
            </div>
            <div className="footer">
                <button onClick={addAnswer}>
                    <Image src="/icons/plus.svg" alt="Add answer" width={20} height={20} />
                    <p>Add answer</p>
                </button>
            </div>
            {data.id !== 1 && (
                <button className="question-delete" onClick={onDelete}>
                    <Image src="/icons/delete.png" alt="Delete question" width={20} height={20} />
                </button>
            )}
        </div>
    );
}