// frontend/src/App.jsx

import React, { useState } from "react";
import axios from "axios";
import "./App.css";

function App() {

  const [file, setFile] = useState(null);

  const [summary, setSummary] = useState("");

  const [text, setText] = useState("");

  const [question, setQuestion] = useState("");

  const [answer, setAnswer] = useState("");

  const [timestamps, setTimestamps] = useState([]);

  const [loading, setLoading] = useState(false);

  // -----------------------------------
  // PLAY TIMESTAMP
  // -----------------------------------
  const playTimestamp = (time) => {

    const media = document.getElementById(
      "mediaPlayer"
    );

    if (media) {

      media.currentTime = time;

      media.play();
    }
  };

  // -----------------------------------
  // UPLOAD FILE
  // -----------------------------------
  const handleUpload = async () => {

    if (!file) {

      alert("Select file");

      return;
    }

    try {

      setLoading(true);

      setSummary(
        "Please wait... Processing file."
      );

      setText("");

      setAnswer("");

      setTimestamps([]);

      const formData = new FormData();

      formData.append("file", file);

      const response = await axios.post(

        "http://127.0.0.1:8000/upload",

        formData,

        {
          headers: {

            "Content-Type":
            "multipart/form-data",

            "x-api-key":
            "raju123"
          },

          timeout: 0
        }
      );

      console.log(response.data);

      // SUCCESS DATA

      setSummary(
        response?.data?.summary || ""
      );

      setText(
        response?.data?.text || ""
      );

      setTimestamps(
        response?.data?.timestamps || []
      );

      alert("Upload Success");

    } catch (err) {

      console.log(err);

      // NETWORK ERROR FIX

      if (err.response) {

        setSummary(
          "Server Error"
        );

      } else if (err.request) {

        setSummary(
          "Network Error. Please wait and try again."
        );

      } else {

        setSummary(
          "Unexpected Error"
        );
      }

    } finally {

      setLoading(false);
    }
  };

  // -----------------------------------
  // ASK QUESTION
  // -----------------------------------
  const askQuestion = async () => {

    try {

      if (!question) {

        alert("Enter question");

        return;
      }

      setAnswer("Thinking...");

      const response = await axios.post(

        "http://127.0.0.1:8000/chat",

        {
          question
        },

        {
          headers: {

            "x-api-key":
            "raju123"
          }
        }
      );

      const textAnswer =
        String(
          response.data.answer || ""
        );

      let current = "";

      setAnswer("");

      // STREAMING EFFECT

      for (
        let i = 0;
        i < textAnswer.length;
        i++
      ) {

        current += textAnswer[i];

        setAnswer(current);

        await new Promise(

          resolve =>

            setTimeout(
              resolve,
              8
            )
        );
      }

    } catch (err) {

      console.log(err);

      setAnswer(
        "Chat Error"
      );
    }
  };

  return (

    <div className="container">

      <h1>
        AI Document Chatbot
      </h1>

      {/* FILE INPUT */}

      <input

        type="file"

        onChange={(e) =>
          setFile(
            e.target.files[0]
          )
        }
      />

      <br />
      <br />

      <button
        onClick={handleUpload}
      >
        Upload File
      </button>

      {/* LOADING */}

      {
        loading &&
        <p>
          Processing file...
        </p>
      }

      <hr />

      {/* MEDIA PLAYER */}

      {
        file &&
        (
          file.name.endsWith(".mp3")
          ||
          file.name.endsWith(".wav")
        ) ? (

          <audio

            id="mediaPlayer"

            controls
          >

            <source

              src={
                URL.createObjectURL(file)
              }
            />

          </audio>

        ) : (

          file &&
          (
            file.name.endsWith(".mp4")
            ||
            file.name.endsWith(".mov")
            ||
            file.name.endsWith(".avi")
          ) && (

            <video

              id="mediaPlayer"

              width="600"

              controls
            >

              <source

                src={
                  URL.createObjectURL(file)
                }
              />

            </video>
          )
        )
      }

      {/* SUMMARY */}

      <h2>
        AI Summary
      </h2>

      <pre>
        {summary}
      </pre>

      <hr />

      {/* ASK QUESTIONS */}

      <h2>
        Ask Questions
      </h2>

      <input

        type="text"

        placeholder="Ask question"

        value={question}

        onChange={(e) =>
          setQuestion(
            e.target.value
          )
        }

        style={{
          width: "350px",
          padding: "10px"
        }}
      />

      <br />
      <br />

      <button
        onClick={askQuestion}
      >
        Ask
      </button>

      <hr />

      {/* ANSWER */}

      <h2>
        Answer
      </h2>

      <pre>
        {answer}
      </pre>

      <hr />

      {/* TIMESTAMPS */}

      <h2>
        Timestamps
      </h2>

      {
        timestamps.length === 0 && (

          <p>
            No timestamps available
          </p>
        )
      }

      {
        timestamps.map(
          (item, index) => (

            <div key={index}>

              <button

                onClick={() =>
                  playTimestamp(
                    item.start
                  )
                }
              >
                Play
              </button>

              <b>

                {" "}
                {item.start}s
                -
                {item.end}s

              </b>

              <p>
                {item.text}
              </p>

              <hr />

            </div>
          )
        )
      }

      {/* EXTRACTED CONTENT */}

      <h2>
        Extracted Content
      </h2>

      <pre>
        {text}
      </pre>

    </div>
  );
}

export default App;