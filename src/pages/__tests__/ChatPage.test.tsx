import "@testing-library/jest-dom/vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ChatPage } from "../ChatPage";

vi.mock("../../lib/chat", () => ({
  sendChatMessage: vi.fn()
}));

import { sendChatMessage } from "../../lib/chat";

const mockedSendChatMessage = vi.mocked(sendChatMessage);

test("shows a prompt input and send button", () => {
  render(<ChatPage />);

  expect(screen.getByRole("heading", { name: "聊天", level: 1 })).toBeInTheDocument();
  expect(screen.getByRole("textbox", { name: "输入消息" })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "发送" })).toBeInTheDocument();
  expect(screen.getByText("暂时还没有消息。")).toBeInTheDocument();
});

test("submits prompt through chat command wrapper and renders reply", async () => {
  const user = userEvent.setup();

  mockedSendChatMessage.mockResolvedValueOnce({
    message: {
      role: "assistant",
      content: "hello from gemini"
    }
  });

  render(
    <ChatPage
      defaultModel="gemini-2.0-flash"
      initialMessages={[{ role: "user", content: "之前的消息" }]}
    />
  );

  await user.type(screen.getByRole("textbox", { name: "输入消息" }), "你好");
  await user.click(screen.getByRole("button", { name: "发送" }));

  await waitFor(() => {
    expect(mockedSendChatMessage).toHaveBeenCalledWith({
      model: "gemini-2.0-flash",
      prompt: "你好",
      history: [{ role: "user", content: "之前的消息" }]
    });
  });

  expect(screen.getByText("你好")).toBeInTheDocument();
  expect(screen.getByText("hello from gemini")).toBeInTheDocument();
});

test("disables prompt input and send button when actions are disabled", () => {
  render(<ChatPage actionsEnabled={false} />);

  expect(screen.getByRole("textbox", { name: "输入消息" })).toBeDisabled();
  expect(screen.getByRole("button", { name: "发送" })).toBeDisabled();
});

test("shows an error message when sending chat fails", async () => {
  const user = userEvent.setup();

  mockedSendChatMessage.mockRejectedValueOnce(new Error("network down"));

  render(<ChatPage />);

  await user.type(screen.getByRole("textbox", { name: "输入消息" }), "你好");
  await user.click(screen.getByRole("button", { name: "发送" }));

  await waitFor(() => {
    expect(screen.getByRole("alert")).toHaveTextContent("发送失败，请稍后重试。");
  });
});

test("notifies parent when messages change after a successful send", async () => {
  const user = userEvent.setup();
  const onMessagesChange = vi.fn();

  mockedSendChatMessage.mockResolvedValueOnce({
    message: {
      role: "assistant",
      content: "hello from gemini"
    }
  });

  render(<ChatPage onMessagesChange={onMessagesChange} />);

  await user.type(screen.getByRole("textbox", { name: "输入消息" }), "你好");
  await user.click(screen.getByRole("button", { name: "发送" }));

  await waitFor(() => {
    expect(onMessagesChange).toHaveBeenCalledWith([
      { role: "user", content: "你好" },
      { role: "assistant", content: "hello from gemini" }
    ]);
  });
});

test("resyncs message list when initialMessages prop changes", () => {
  const { rerender } = render(<ChatPage initialMessages={[]} />);

  expect(screen.getByText("暂时还没有消息。")).toBeInTheDocument();

  rerender(
    <ChatPage
      initialMessages={[
        { role: "user", content: "之前的历史消息" },
        { role: "assistant", content: "之前的助手回复" }
      ]}
    />
  );

  expect(screen.getByText("之前的历史消息")).toBeInTheDocument();
  expect(screen.getByText("之前的助手回复")).toBeInTheDocument();
});
