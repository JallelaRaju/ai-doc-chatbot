import { useRef, useState } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [file, setFile] = useState(null);
  const [summary, setSummary] = useState("");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [content, setContent] = useState("");
  const [timestamps, setTimestamps] = useState([]);
  const [mediaUrl, setMediaUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const mediaRef = useRef(null);

  const API_KEY = "raju123";

  const uploadFile = async () => {
    if (!file) {
      alert("Please select a file");
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            "x-api-key": API_KEY,
          },
        }
      );

      setSummary(response.data.summary);
      setContent(response.data.text);
      setTimestamps(response.data.timestamps || []);

      if (response.data.media_url) {
        setMediaUrl(
          `http://127.0.0.1:8000/${response.data.media_url}`
        );
      } else {
        setMediaUrl("");
      }
    } catch (error) {
      console.log(error);
      alert("Upload Failed");
    }

    setLoading(false);
  };

  const askQuestion = async () => {
    if (!question) {
      alert("Please enter question");
      return;
    }

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/chat",
        { question },
        {
          headers: {
            "x-api-key": API_KEY,
          },
        }
      );

      setAnswer(response.data.answer);
    } catch (error) {
      console.log(error);
      alert("Something went wrong");
    }
  };

  const playTimestamp = (startTime) => {
    if (mediaRef.current) {
      mediaRef.current.currentTime = startTime;
      mediaRef.current.play();
    }
  };

  return (
    <div className="app">
      <h1 className="title">AI Document Chatbot</h1>

      <div className="card">
        <h2 className="section-title">Upload File</h2>

        <input
          type="file"
          onChange={(e) => setFile(e.target.files[0])}
        />

        <br />

        <button onClick={uploadFile}>
          Upload File
        </button>

        {loading && (
          <p className="loading">
            Processing file...
          </p>
        )}
      </div>

      <div className="card">
        <h2 className="section-title">AI Summary</h2>

        <div className="summary-box">
          {summary || "No summary available"}
        </div>
      </div>

      {mediaUrl && (
        <div className="card">
          <h2 className="section-title">
            Media Player
          </h2>

          {mediaUrl.endsWith(".mp4") ||
          mediaUrl.endsWith(".mov") ||
          mediaUrl.endsWith(".avi") ? (
            <video
              ref={mediaRef}
              controls
              className="media-player"
            >
              <source
                src={mediaUrl}
                type="video/mp4"
              />
            </video>
          ) : (
            <audio
              ref={mediaRef}
              controls
              className="media-player"
            >
              <source
                src={mediaUrl}
                type="audio/mpeg"
              />
            </audio>
          )}
        </div>
      )}

      <div className="card">
        <h2 className="section-title">
          Ask Questions
        </h2>

        <input
          type="text"
          placeholder="Ask question"
          value={question}
          onChange={(e) =>
            setQuestion(e.target.value)
          }
        />

        <br />

        <button onClick={askQuestion}>
          Ask
        </button>
      </div>

      <div className="card">
        <h2 className="section-title">Answer</h2>

        <div className="answer-box">
          {answer || "No answer yet"}
        </div>
      </div>

      <div className="card">
        <h2 className="section-title">
          Timestamps
        </h2>

        {timestamps.length > 0 ? (
          timestamps.map((item, index) => (
            <div
              className="timestamp-item"
              key={index}
            >
              <button
                onClick={() =>
                  playTimestamp(item.start)
                }
              >
                Play
              </button>

              <span className="timestamp-time">
                {item.start}s - {item.end}s
              </span>

              <p>{item.text}</p>
            </div>
          ))
        ) : (
          <p>No timestamps available</p>
        )}
      </div>

      <div className="card">
        <h2 className="section-title">
          Extracted Content
        </h2>

        <div className="content-box">
          {content || "No content extracted"}
        </div>
      </div>
    </div>
  );
}

export default App;