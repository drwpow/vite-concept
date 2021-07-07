import React from "react";
import ReactDOM from "react-dom";

const App = () => <div>I’m an App</div>;

ReactDOM.hydrate(<App />, document.querySelector("#app"));
