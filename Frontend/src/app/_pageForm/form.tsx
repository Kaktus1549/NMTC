import Image from 'next/image';

export default function Form() {
    return(
    <div className="form">
        <div className="question">
            <div className="header">
                <input type="text" placeholder="Question #1" />
                <input type="text" placeholder="Question in words" className="in-words"/>
            </div>
            <div className="body">
                <div className="help">
                    <p className="short">Succesion rate in %</p>
                    <p className="short">Answer</p>
                    <p className="long">Feedback</p>
                </div>
                <div className="answer">
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
            </div>
            <div className="footer">
                <button>
                    <Image src="/icons/plus.svg" alt="Add question" width={20} height={20} />
                    <p>Add answer</p>
                </button>
            </div>
        </div>
        <footer>
            <button>
                <Image src="/icons/plus.svg" alt="Add question" width={20} height={20} />
                <p>Add question</p>
            </button>
            <button>
                <Image src="/icons/plus.svg" alt="Export" width={20} height={20} />
                <p>Add answer</p>
            </button>
        </footer>   
    </div>
    );
}