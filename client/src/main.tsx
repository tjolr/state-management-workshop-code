import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { store } from "@/store";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/providers/ThemeProvider";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store={store}>
      <TooltipProvider>
        <ThemeProvider>
          <App />
        </ThemeProvider>
      </TooltipProvider>
    </Provider>
  </StrictMode>
);
