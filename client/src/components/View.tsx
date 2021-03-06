import { useSocket } from "./useSocket";
import styled from "@emotion/styled";
import { useCallback, useEffect, useState } from "react";
import { css } from "@emotion/react";

enum ChatType {
    USER = 0,
    BOT = 1,
}

interface ChatMessage {
    type: ChatType;
    message: string;
}

const View = () => {
    const { isConnect, socket } = useSocket();
    const [chatMsg, setChatMsg] = useState<ChatMessage[]>([]);
    const [inputValue, setInputValue] = useState("");

    const handleChange = useCallback((e) => {
        const { value } = e.target;
        setInputValue(value);
    }, []);

    const messageRef = useCallback((node: HTMLDivElement | null) => {
        if (!node) return;
        const observer = new IntersectionObserver(
            (entries: IntersectionObserverEntry[]) => {
                const entry: IntersectionObserverEntry = entries[0];
                entry.target.scrollIntoView({
                    behavior: "smooth",
                });
                observer.disconnect();
            }
        );
        observer.observe(node);
    }, []);

    const handleSubmit = useCallback(
        (e) => {
            e.preventDefault();
            if (!inputValue) return;

            setChatMsg((prev) => [...prev, { type: 0, message: inputValue }]);
            setInputValue("");
            socket.emit("bot", inputValue, (msg: ChatMessage) =>
                setChatMsg((prev) => [...prev, msg])
            );
        },
        [inputValue, socket]
    );

    useEffect(() => {
        socket.on("welcome", (msg: ChatMessage) => {
            setChatMsg([msg]);
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <Container>
            <ShowState isConnect={isConnect}>
                <span>{isConnect ? "Live" : "---"}</span>
                <div></div>
            </ShowState>

            <ChatBody>
                <ChatMsgBody>
                    {chatMsg.map((chat, index) => (
                        <ChatMsg
                            ref={
                                chatMsg.length - 1 === index ? messageRef : null
                            }
                            key={index}
                            chatType={chat.type}
                        >
                            <div>
                                {/http/.test(chat.message) ? (
                                    <a
                                        target="_blank"
                                        rel="noreferrer"
                                        href={chat.message}
                                    >
                                        {chat.message}
                                    </a>
                                ) : (
                                    <p>{chat.message}</p>
                                )}
                            </div>
                        </ChatMsg>
                    ))}
                </ChatMsgBody>

                <ChatInputForm onSubmit={handleSubmit}>
                    <input
                        type="text"
                        placeholder="message"
                        onChange={handleChange}
                        value={inputValue}
                    />
                </ChatInputForm>
            </ChatBody>
        </Container>
    );
};

export default View;

const Container = styled.div`
    margin: 0 auto;
    max-width: 800px;
    padding: 2em 1em;
`;

const ShowState = styled.div<{ isConnect: boolean }>`
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 6px;
    div {
        width: 8px;
        height: 8px;
        margin-left: 6px;
        border-radius: 50%;
        background-color: ${({ isConnect }) => (isConnect ? "green" : "red")};
    }
    span {
        font-size: 1.25rem;
    }
`;

const ChatBody = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    width: 100%;
    height: 70vh;
    margin: 0 auto;
    background-color: #ffffff;
    border: 1px solid #dbdbdb;
`;

const ChatMsgBody = styled.div`
    display: flex;
    flex-direction: column;
    padding: 1em;
    height: 100%;
    overflow-y: auto;
`;

const ChatMsg = styled.div<{ chatType: ChatType }>`
    display: flex;
    flex-direction: column;
    margin: 0.5em 0;
    max-width: 50%;

    & > div {
        width: fit-content;
        padding: 0.8em 1em;
        border-radius: 20px;
    }

    ${({ chatType }) =>
        chatType === ChatType.BOT
            ? css`
                  align-self: flex-start;
                  & > div {
                      background-color: #ecf0f1;
                  }
              `
            : css`
                  align-self: flex-end;
                  & > div {
                      background-color: #4ac587;
                      color: #ffffff;
                  }
              `}
`;

const ChatInputForm = styled.form`
    width: 100%;
    padding: 0.8em 1.2em;
    border-top: 1px solid #dbdbdb;

    input {
        font-size: 15px;
        width: 100%;
    }
`;
