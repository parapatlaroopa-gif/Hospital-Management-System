import { useState } from "react";

function Chatbot() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Hello! 👋 How can I help you?",
    },
  ]);

  // =========================================
  // SEND MESSAGE TO DJANGO BACKEND
  // =========================================

  const sendMessage = async () => {
    if (!message.trim() || loading) return;

    const userMessage = message.trim();

    // Show user's message
    setMessages((prev) => [
      ...prev,
      {
        sender: "user",
        text: userMessage,
      },
    ]);

    // Clear input
    setMessage("");

    // Show loading
    setLoading(true);

    try {
      const response = await fetch(
  `${import.meta.env.VITE_API_URL}chatbot/`,
  {
    method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            message: userMessage,
          }),
        }
      );

      // Check response
      if (!response.ok) {
        throw new Error("Server error");
      }

      const data = await response.json();

      // Show bot response
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text:
            data.reply ||
            "Sorry, I couldn't understand your question.",
        },
      ]);
    } catch (error) {
      console.error("Chatbot Error:", error);

      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text:
            "Sorry 😔 I couldn't connect to the hospital server.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* =========================================
          FLOATING CHAT BUTTON
      ========================================= */}

      <button
        type="button"
        onClick={() => setOpen(!open)}
        style={{
          position: "fixed",
          right: "25px",
          bottom: "25px",

          width: "60px",
          height: "60px",

          borderRadius: "50%",
          border: "none",

          backgroundColor: "#2563eb",
          color: "#ffffff",

          fontSize: "28px",

          cursor: "pointer",

          zIndex: 999999,

          boxShadow: "0 5px 20px rgba(0,0,0,0.3)",
        }}
      >
        {open ? "×" : "💬"}
      </button>


      {/* =========================================
          CHAT WINDOW
      ========================================= */}

      {open && (
        <div
          style={{
            position: "fixed",

            right: "25px",
            bottom: "100px",

            width: "360px",
            height: "520px",

            backgroundColor: "#ffffff",

            borderRadius: "16px",

            boxShadow:
              "0 10px 40px rgba(0,0,0,0.25)",

            border: "1px solid #e5e7eb",

            overflow: "hidden",

            zIndex: 999998,

            display: "flex",
            flexDirection: "column",
          }}
        >

          {/* =====================================
              CHAT HEADER
          ===================================== */}

          <div
            style={{
              height: "65px",

              backgroundColor: "#2563eb",

              color: "#ffffff",

              display: "flex",
              alignItems: "center",

              padding: "0 18px",

              fontSize: "17px",

              fontWeight: "600",

              flexShrink: 0,
            }}
          >
            <span
              style={{
                marginRight: "10px",
                fontSize: "22px",
              }}
            >
              🏥
            </span>

            AI Smart Hospital
          </div>


          {/* =====================================
              MESSAGE AREA
          ===================================== */}

          <div
            style={{
              flex: 1,

              padding: "15px",

              backgroundColor: "#f8fafc",

              overflowY: "auto",

              display: "flex",
              flexDirection: "column",
            }}
          >

            {messages.map((msg, index) => (
              <div
                key={index}
                style={{
                  display: "flex",

                  justifyContent:
                    msg.sender === "user"
                      ? "flex-end"
                      : "flex-start",

                  marginBottom: "12px",
                }}
              >

                <div
                  style={{
                    maxWidth: "75%",

                    backgroundColor:
                      msg.sender === "user"
                        ? "#2563eb"
                        : "#ffffff",

                    color:
                      msg.sender === "user"
                        ? "#ffffff"
                        : "#334155",

                    padding: "10px 13px",

                    borderRadius:
                      msg.sender === "user"
                        ? "12px 12px 2px 12px"
                        : "12px 12px 12px 2px",

                    border:
                      msg.sender === "user"
                        ? "none"
                        : "1px solid #e5e7eb",

                    fontSize: "14px",

                    lineHeight: "1.4",

                    wordBreak: "break-word",
                  }}
                >
                  {msg.text}
                </div>

              </div>
            ))}


            {/* =================================
                LOADING MESSAGE
            ================================= */}

            {loading && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-start",
                  marginBottom: "12px",
                }}
              >
                <div
                  style={{
                    backgroundColor: "#ffffff",

                    color: "#64748b",

                    padding: "10px 13px",

                    borderRadius:
                      "12px 12px 12px 2px",

                    border:
                      "1px solid #e5e7eb",

                    fontSize: "14px",
                  }}
                >
                  Typing... ⏳
                </div>
              </div>
            )}

          </div>


          {/* =====================================
              INPUT AREA
          ===================================== */}

          <div
            style={{
              display: "flex",

              gap: "8px",

              padding: "10px",

              borderTop:
                "1px solid #e5e7eb",

              backgroundColor: "#ffffff",

              flexShrink: 0,
            }}
          >

            <input
              type="text"
              placeholder="Ask something..."
              value={message}

              onChange={(e) =>
                setMessage(e.target.value)
              }

              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  sendMessage();
                }
              }}

              disabled={loading}

              style={{
                flex: 1,

                height: "40px",

                border:
                  "1px solid #d1d5db",

                borderRadius: "8px",

                padding: "0 12px",

                outline: "none",

                fontSize: "14px",
              }}
            />


            {/* SEND BUTTON */}

            <button
              type="button"
              onClick={sendMessage}
              disabled={loading}

              style={{
                width: "45px",

                height: "40px",

                border: "none",

                borderRadius: "8px",

                backgroundColor:
                  loading
                    ? "#94a3b8"
                    : "#2563eb",

                color: "#ffffff",

                cursor:
                  loading
                    ? "not-allowed"
                    : "pointer",

                fontSize: "18px",
              }}
            >
              ➤
            </button>

          </div>

        </div>
      )}
    </>
  );
}

export default Chatbot;