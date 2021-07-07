import React from "react";
import ReactDOMServer from "react-dom/server";

const App = () => <div>I’m an App</div>;

export function render() {
  return ReactDOMServer.renderToString(<App />);
}
