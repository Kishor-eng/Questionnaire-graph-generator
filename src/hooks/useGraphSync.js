// /hooks/useGraphSync.js
import { useEffect } from 'react';

const useGraphSync = ({ nodes, edges, onJsonChange }) => {
  useEffect(() => {
    const graphJson = {
      questionnaire: {
        nodes,
        edges
      }
    };
    onJsonChange(graphJson);
  }, [nodes, edges]);
};

export default useGraphSync;
