import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import Root from "./Root";

const container = document.getElementById("root");
const root = createRoot(container);

createRoot(document.getElementById("root")).render(
  // <StrictMode>
  <Root />
  // </StrictMode>
);
