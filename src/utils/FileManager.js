export const exportGraph = (graphData) => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(graphData));
    const dlAnchor = document.createElement("a");
    dlAnchor.setAttribute("href", dataStr);
    dlAnchor.setAttribute("download", "graph_data.json");
    dlAnchor.click();
  };
  
  export const importGraph = (event, setGraphData) => {
    const file = event.target.files[0];
    if (!file) return;
  
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        setGraphData(data);
      } catch (error) {
        console.error("Invalid JSON file");
      }
    };
    reader.readAsText(file);
  };
  