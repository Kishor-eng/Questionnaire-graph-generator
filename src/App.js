import React from "react";
import Home from "./pages/Home";
import { GraphProvider } from "./components/GraphProvider";

function App() {
  return (
    <GraphProvider>
      <Home />
    </GraphProvider>
  );
}


export default App;
