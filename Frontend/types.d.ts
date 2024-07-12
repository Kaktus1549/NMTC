interface Answer{
    successionRate: number;
    answer: string;
    feedback: string;
}
interface QuestionData{
    question: string;
    inWords: string;
    image_name: string;
    image_data: string;
    answers: Answer[];
}