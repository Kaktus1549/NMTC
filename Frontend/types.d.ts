interface Answer{
    successionRate: number;
    answer: string;
    feedback: string;
}
interface QuestionData{
    question: string;
    inWords: string;
    answers: Answer[];
}