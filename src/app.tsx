import { createSignal } from "solid-js";

/**
 * アプリルート
 * @returns JSX
 */
export const App = () => {
  const [text, setText] = createSignal("");

  return (
    <div>
      <textarea onChange={(event) => setText(event.currentTarget.value)}>{text()}</textarea>
    </div>
  );
};
