import Image from "next/image";
import Form from "./_pageForm/form";

export default function Home() {
  return (
    <>
      <header>
        <h1>NETACAD</h1>
        <p>Platform for easy Moodle test creation </p>
      </header>
      <main>
        <Form />
        <div className="logo">
          <Image src="/logos/CVUT.svg" alt="CVUT logo" width={200} height={200} className="logo"/>
        </div>
      </main>
    </>
  );
}
