import { render } from "solid-js/web";

import { App } from "./App/App";

import { defaultTheme } from "./App/Theme.css";

document.documentElement.classList.add(defaultTheme);

render(() => <App />, document.getElementById("root")!);
