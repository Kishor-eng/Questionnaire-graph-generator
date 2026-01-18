// components/GraphProvider.jsx
import React, { createContext, useContext, useState } from "react";

const GraphContext = createContext();

export const GraphProvider = ({ children }) => {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [questions, setQuestions] = useState({});
  const [graphMeta, setGraphMeta] = useState({});

  return (
    <GraphContext.Provider
      value={{ nodes, setNodes, edges, setEdges, questions, setQuestions, graphMeta, setGraphMeta }}
    >
      {children}
    </GraphContext.Provider>
  );
};

export const useGraph = () => useContext(GraphContext);
