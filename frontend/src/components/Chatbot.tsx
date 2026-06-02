import { useState, type FormEvent } from "react";
import { MessageCircle, Send, X } from "lucide-react";
import chatbotCharacter from "../assets/customer-feedback-character.png";
import { sendChatMessage } from "../api/chat";

type ChatMessage = {
  id: number;
  sender: "bot" | "user";
  text: string;
};

const openingMessage: ChatMessage = {
  id: 1,
  sender: "bot",
  text: "Hi! I can help with magnets, customization, prices, cart, delivery, stalls, or feedback.",
};

function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([openingMessage]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const question = input.trim();

    if (!question || isThinking) {
      return;
    }

    const userMessage: ChatMessage = {
      id: Date.now(),
      sender: "user",
      text: question,
    };

    setMessages((currentMessages) => [...currentMessages, userMessage]);
    setInput("");
    setIsThinking(true);

    try {
      const reply = await sendChatMessage(question);
      setMessages((currentMessages) => [
        ...currentMessages,
        {
          id: Date.now() + 1,
          sender: "bot",
          text: reply,
        },
      ]);
    } catch {
      setMessages((currentMessages) => [
        ...currentMessages,
        {
          id: Date.now() + 1,
          sender: "bot",
          text: "I cannot reach the chatbot service right now. Please make sure chatbot is running on port 5000.",
        },
      ]);
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <div className="fixed bottom-3 right-2 z-[9998] flex max-w-[calc(100vw-16px)] flex-col items-end gap-3 sm:bottom-3 sm:right-2">
      {isOpen && (
        <section className="w-[min(440px,calc(100vw-16px))] overflow-hidden rounded-[24px] border border-[#ce272a]/20 bg-[#f8efe6] shadow-[0px_24px_70px_rgba(121,4,5,0.25)] sm:rounded-[28px]">
          <div className="flex items-center justify-between bg-[#ca3a3c] px-5 py-4 text-white">
            <div className="flex items-center gap-3">
              <img
                src={chatbotCharacter}
                alt="Memory Magnets chatbot"
                className="h-14 w-14 rounded-full bg-[#f8efe6] object-cover object-top"
              />
              <div>
                <h2 className="text-xl font-black">Magnet Buddy</h2>
                <p className="text-sm text-[#ffe1dc]">Ask any enquiry</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-[#5a0205] text-white"
              aria-label="Close chatbot"
            >
              <X size={18} />
            </button>
          </div>

          <div className="flex h-[360px] max-h-[calc(100vh-260px)] flex-col gap-3 overflow-y-auto p-4 sm:h-[460px]">
            {messages.map((message) => (
              <p
                key={message.id}
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-base leading-snug ${
                  message.sender === "user"
                    ? "ml-auto bg-[#ca3a3c] text-white"
                    : "bg-[#ffbcbc] text-[#790405]"
                }`}
              >
                {message.text}
              </p>
            ))}
            {isThinking && (
              <p className="max-w-[85%] rounded-2xl bg-[#ffbcbc] px-4 py-3 text-base text-[#790405]">
                Thinking...
              </p>
            )}
          </div>

          <form onSubmit={handleSubmit} className="flex gap-2 border-t border-[#ce272a]/20 p-4">
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask about magnets..."
              className="min-w-0 flex-1 rounded-2xl border border-[#ffb6b6] bg-white px-4 py-3 text-base outline-none"
            />
            <button
              type="submit"
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#ca3a3c] text-white"
              aria-label="Send message"
            >
              <Send size={18} />
            </button>
          </form>
        </section>
      )}

      <button
        type="button"
        onClick={() => setIsOpen((currentValue) => !currentValue)}
        className="relative flex h-16 w-16 items-center justify-center rounded-full bg-[#ca3a3c] shadow-[0px_18px_50px_rgba(121,4,5,0.35)] sm:h-24 sm:w-24"
        aria-label="Open chatbot"
      >
        <img
          src={chatbotCharacter}
          alt=""
          className="h-14 w-14 rounded-full bg-[#f8efe6] object-cover object-top sm:h-20 sm:w-20"
        />
        <span className="absolute -left-1 -top-1 flex h-8 w-8 items-center justify-center rounded-full bg-[#2f9f9a] text-white sm:-left-2 sm:-top-2 sm:h-10 sm:w-10">
          <MessageCircle size={18} />
        </span>
      </button>
    </div>
  );
}

export default Chatbot;
