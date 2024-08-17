interface Answer{
    id: number;
    successionRate: number | undefined;
    answer: string;
    feedback: string;
}
interface QuestionData{
    id: number;
    question: string;
    inWords: string;
    image_name: string;
    image_blob: string;
    answers: Answer[];
}