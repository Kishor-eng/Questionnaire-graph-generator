import React, { useState, useEffect, useRef } from "react";
import { ReactFlowProvider } from "reactflow";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFileImport,
  faFileExport,
  faChevronDown,
  faChevronUp,
  faCode,
  faEye,
} from "@fortawesome/free-solid-svg-icons";
import QuestionGraph from "../components/QuestionGraph";
import JsonPreview from "../components/JsonPreview";
import FormBuilder from "../components/FormBuilder";
import VisualizationGuide from "../components/VisualizationGuide";
import NodeInspector from "../components/NodeInspector";

const Home = () => {
  const [questions, setQuestions] = useState([]);
  const [jsonOutput, setJsonOutput] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showGuide, setShowGuide] = useState(false);
  const [showJsonPreview, setShowJsonPreview] = useState(false);
  const [leftWidth, setLeftWidth] = useState(33.33);
  const [isResizing, setIsResizing] = useState(false);
  const containerRef = useRef(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const graphRef = useRef(null);

  const validateJsonStructure = (jsonData) => {
    if (!Array.isArray(jsonData)) {
      throw new Error("Invalid JSON format: Expected an array");
    }

    const requiredModels = ["questionnaire.question", "questionnaire.node", "questionnaire.edge"];
    const hasRequiredModels = requiredModels.every(model => 
      jsonData.some(item => item.model === model)
    );

    if (!hasRequiredModels) {
      throw new Error("Invalid JSON format: Missing required models");
    }

    return true;
  };

  const handleImportJson = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    setError(null);
    setIsLoading(true);

    // Reset all states before importing
    setQuestions([]);
    setJsonOutput({});
    setSelectedNode(null);
    
    // Clear any existing highlights
    document.querySelectorAll('.question-card').forEach(el => {
      el.style.backgroundColor = 'white';
      el.style.borderColor = '#dee2e6';
      el.style.boxShadow = 'none';
    });

    reader.onload = (e) => {
      try {
        const importedJson = JSON.parse(e.target.result);
        validateJsonStructure(importedJson);
        const parsedQuestions = parseQuestionsFromJson(importedJson);

        // Set importing flag before updating questions
        if (graphRef.current) {
          graphRef.current.setIsImporting(true);
        }

        // Small delay to ensure clean state
        setTimeout(() => {
          setQuestions(parsedQuestions);
        }, 100);

      } catch (error) {
        console.error("Error importing JSON:", error);
        setError(error.message || "Failed to import JSON file");
      } finally {
        setIsLoading(false);
        // Reset file input
        event.target.value = '';
      }
    };

    reader.onerror = () => {
      setError("Error reading file");
      setIsLoading(false);
      // Reset file input
      event.target.value = '';
    };

    reader.readAsText(file);
  };

  const parseQuestionsFromJson = (jsonData) => {
    const questionMap = {};
    const nodeMap = {};
    const edges = new Map();
    const questions = [];

    try {
      const graph = jsonData.find(
        (item) => item.model === "questionnaire.questionnairegraph"
      );

      if (!graph) {
        throw new Error("Graph configuration not found in JSON");
      }

      // First pass: collect all questions and their tags/labels
      jsonData.forEach((item) => {
        if (item.model === "questionnaire.question") {
          questionMap[item.pk] = {
            id: item.pk,
            text: item.fields.title,
            type: item.fields.type,
            options: item.fields.type_params?.options || [],
            required: item.fields.required,
            auto_next: item.fields.auto_next,
            internal_note: item.fields.internal_note || "",
            tags: [],
            labels: [],
            next_question: null,
            branches: { yes: null, no: null, criteria: [] }
          };
        }
      });

      // Second pass: collect tags and labels
      jsonData.forEach((item) => {
        if (item.model === "questionnaire.questiontag") {
          const question = questionMap[item.fields.question];
          if (question) {
            question.tags.push(item.fields.choice);
          }
        }
        if (item.model === "questionnaire.questionlabel") {
          const question = questionMap[item.fields.question];
          if (question) {
            question.labels.push(item.fields.choice);
          }
        }
      });

      // Third pass: collect nodes and edges with their criteria
      jsonData.forEach((item) => {
        if (item.model === "questionnaire.node") {
          nodeMap[item.pk] = {
            questionId: item.fields.question,
            nodeId: item.pk
          };
        }
        if (item.model === "questionnaire.edge") {
          edges.set(item.pk, {
            start: item.fields.start,
            end: item.fields.end,
            criteria: []
          });
        }
      });

      // Fourth pass: collect edge criteria
      jsonData.forEach((item) => {
        if (item.model === "questionnaire.edgetriggercriteria") {
          const edge = edges.get(item.fields.edge);
          if (edge) {
            edge.criteria.push({
              choice: item.fields.choice,
              config: item.fields.config || {}
            });
          }
        }
      });

      // Process edges and build question connections
      edges.forEach((edge) => {
        const sourceNode = nodeMap[edge.start];
        const targetNode = nodeMap[edge.end];
        
        if (!sourceNode || !targetNode) return;

        const sourceQuestion = questionMap[sourceNode.questionId];
        const targetQuestionId = targetNode.questionId;

        if (!sourceQuestion) return;

        // Check if this edge has boolean criteria
        const hasBooleanYes = edge.criteria.some(c => c.choice === "Boolean yes");
        const hasBooleanNo = edge.criteria.some(c => c.choice === "Boolean no");

        // If edge has both yes and no, or neither, treat as linear
        const isLinear = (!hasBooleanYes && !hasBooleanNo) || (hasBooleanYes && hasBooleanNo);

        if (isLinear) {
          // For linear flow
          if (!sourceQuestion.next_question) {
            sourceQuestion.next_question = targetQuestionId;
            sourceQuestion.edge_criteria = edge.criteria;
          }
        } else {
          // For branching
          if (hasBooleanYes) {
            sourceQuestion.branches.yes = targetQuestionId;
            sourceQuestion.branches.criteria = [...(sourceQuestion.branches.criteria || []), ...edge.criteria];
          }
          if (hasBooleanNo) {
            sourceQuestion.branches.no = targetQuestionId;
            sourceQuestion.branches.criteria = [...(sourceQuestion.branches.criteria || []), ...edge.criteria];
          }
        }
      });

      // Convert to final question format
      Object.values(questionMap).forEach((q) => {
        questions.push({
          id: q.id.toString(),
          text: q.text,
          type: q.type,
          options: q.options,
          required: q.required,
          auto_next: q.auto_next,
          internal_note: q.internal_note,
          next_question: q.next_question,
          edge_criteria: q.edge_criteria,
          branches: q.branches,
          tags: q.tags,
          labels: q.labels
        });
      });

      return questions;
    } catch (error) {
      console.error("Error parsing questions:", error);
      throw new Error("Failed to parse questions from JSON");
    }
  };

  useEffect(() => {
    if (!isLoading) {
      try {
        setJsonOutput((prev) => ({
          ...prev,
          questions: questions,
        }));
      } catch (error) {
        console.error("Error updating JSON output:", error);
        setError("Failed to update JSON output");
      }
    }
  }, [questions, isLoading]);

  const handleAddQuestion = () => {
    const newQuestion = {
      id: Date.now().toString(),
      text: "",
      type: "long_text",
      options: [],
      required: false,
      auto_next: false,
      next_question: null,
      branches: { yes: null, no: null }
    };

    setQuestions((prevQuestions) => [...prevQuestions, newQuestion]);
  };

  const handleUpdateQuestion = (updatedQuestion) => {
    setQuestions((prevQuestions) =>
      prevQuestions.map((q) =>
        q.id === updatedQuestion.id ? updatedQuestion : q
      )
    );
  };

  const handleDeleteQuestion = (questionToDelete) => {
    setQuestions((prevQuestions) =>
      prevQuestions.filter((q) => q.id !== questionToDelete.id)
    );
  };

  const handleExportJson = () => {
    // UUID Generator
    const generateUUID = () =>
      "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      });

    if (!questions || questions.length === 0) return;

    const graphUUID = generateUUID();
    const questionMap = {}; // id => UUID
    const nodeMap = {}; // id => UUID
    let edgePkCounter = 2100;
    let criteriaPkCounter = 1800;

    // Generate UUIDs
    questions.forEach((q) => {
      questionMap[q.id] = generateUUID();
      nodeMap[q.id] = generateUUID();
    });

    const json = [];

    // Push graph model
    json.push({
      model: "questionnaire.questionnairegraph",
      pk: graphUUID,
      fields: {
        name: "Survey",
        start: nodeMap[questions[0].id],
        end: nodeMap[questions[questions.length - 1].id],
        category: 5,
        status: "active",
        internal_note: "Survey Test",
        variant: "A",
        variant_weighting: "100",
      },
    });

    // Push question model
    json.push(
      ...questions.map((q) => ({
        model: "questionnaire.question",
        pk: questionMap[q.id],
        fields: {
          title: q.text || "Untitled",
          subtitle: q.subtitle || null,
          placeholder: q.placeholder || null,
          type: q.type || "text",
          type_params: {
            options: q.options || [],
            exclusive: [],
          },
          required: q.required ?? true,
          auto_next: q.auto_next || false,
          internal_note: q.internal_note || "Generated by builder",
        },
      }))
    );

    // Push node model
    json.push(
      ...questions.map((q) => ({
        model: "questionnaire.node",
        pk: nodeMap[q.id],
        fields: {
          question: questionMap[q.id],
          sub_graph: null,
          parent_graph: graphUUID,
        },
      }))
    );

    const edges = [];
    const criteria = [];

    questions.forEach((q) => {
      const sourceNode = nodeMap[q.id];

      // Handle linear next_question
      if (q.next_question && nodeMap[q.next_question]) {
        const edgePk = edgePkCounter++;
        edges.push({
          model: "questionnaire.edge",
          pk: edgePk,
          fields: {
            start: sourceNode,
            end: nodeMap[q.next_question],
          },
        });

        criteria.push({
          model: "questionnaire.edgetriggercriteria",
          pk: criteriaPkCounter++,
          fields: {
            choice: "Boolean yes", // default for linear
            config: {},
            edge: edgePk,
          },
        });
      }

      // Handle branching logic
      if (q.branches) {
        Object.entries(q.branches).forEach(([branchKey, targetId]) => {
          if (!nodeMap[targetId]) return;

          const edgePk = edgePkCounter++;
          edges.push({
            model: "questionnaire.edge",
            pk: edgePk,
            fields: {
              start: sourceNode,
              end: nodeMap[targetId],
            },
          });

          criteria.push({
            model: "questionnaire.edgetriggercriteria",
            pk: criteriaPkCounter++,
            fields: {
              choice: `Boolean ${branchKey}`, // yes / no
              config: {},
              edge: edgePk,
            },
          });
        });
      }
    });

    json.push(...edges, ...criteria);

    const blob = new Blob([JSON.stringify(json, null, 2)], {
      type: "application/json",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "questions.json";
    link.click();
  };

  const handleMouseDown = (e) => {
    setIsResizing(true);
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleMouseMove = (e) => {
    if (!isResizing) return;
    
    const container = containerRef.current;
    const containerRect = container.getBoundingClientRect();
    const newLeftWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;
    
    // Limit the width between 25% and 75%
    if (newLeftWidth >= 25 && newLeftWidth <= 75) {
      setLeftWidth(newLeftWidth);
    }
  };

  const handleMouseUp = () => {
    setIsResizing(false);
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  };

  const handleMoveQuestion = (questionId, newPosition) => {
    setQuestions((prevQuestions) =>
      prevQuestions.map((q) =>
        q.id === questionId ? { ...q, next_question: newPosition } : q
      )
    );
  };

  const handleQuestionsChange = (newQuestions) => {
    setQuestions(newQuestions);
  };

  return (
    <div className="container-fluid p-3">
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h1 className="h3 mb-0">Questionnaire Builder</h1>
            <div className="d-flex gap-2">
              <button
                className="btn btn-outline-primary"
                onClick={() => setShowGuide(!showGuide)}
              >
                Visualisation Guide
              </button>
              <button
                className="btn btn-outline-primary"
                onClick={() => setShowJsonPreview(!showJsonPreview)}
              >
                <FontAwesomeIcon icon={faCode} className="me-2" />
                JSON Preview
              </button>
            </div>
          </div>

          <VisualizationGuide isOpen={showGuide} onToggle={() => setShowGuide(!showGuide)} />
          <JsonPreview 
            questions={questions}
            isOpen={showJsonPreview} 
            onToggle={() => setShowJsonPreview(!showJsonPreview)} 
          />

          <div className="card mb-3">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="card-title mb-0">Import/Export</h5>
                <div className="d-flex gap-2">
                  <div className="mb-4">
                    <button
                      onClick={() => document.getElementById('jsonFile').click()}
                      className="btn btn-primary me-2"
                    >
                      <i className="fas fa-file-import me-2"></i>Import JSON
                    </button>
                    <input
                      type="file"
                      id="jsonFile"
                      accept=".json"
                      onChange={handleImportJson}
                      style={{ display: 'none' }}
                    />
                    <button
                      onClick={handleExportJson}
                      className="btn btn-success"
                      disabled={!questions.length}
                    >
                      <i className="fas fa-file-export me-2"></i>Export JSON
                    </button>
                  </div>
                </div>
              </div>
              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="row" ref={containerRef}>
        <div 
          className="position-relative" 
          style={{ width: `${leftWidth}%` }}
        >
          <div className="card h-100">
            <div className="card-body">
              <h5 className="card-title">Form Builder</h5>
              <div style={{ maxHeight: "calc(100vh - 300px)", overflowY: "auto" }}>
                <FormBuilder
                  questions={questions}
                  setQuestions={setQuestions}
                  onUpdateQuestion={handleUpdateQuestion}
                  onDeleteQuestion={handleDeleteQuestion}
                  onAddQuestion={handleAddQuestion}
                />
              </div>
            </div>
          </div>
          <div
            className="resizer"
            onMouseDown={handleMouseDown}
            style={{
              width: "5px",
              cursor: "col-resize",
              position: "absolute",
              right: 0,
              top: 0,
              bottom: 0,
              backgroundColor: isResizing ? "#007bff" : "#dee2e6",
              zIndex: 1,
            }}
          />
        </div>
        <div 
          className="position-relative" 
          style={{ width: `${100 - leftWidth}%` }}
        >
          <div className="card h-100">
            <div className="card-body">
              <h5 className="card-title">Graph View</h5>
              <div style={{ height: "calc(100vh - 300px)" }}>
                <ReactFlowProvider>
                  <QuestionGraph
                    ref={graphRef}
                    questions={questions}
                    setQuestions={setQuestions}
                    setJsonOutput={setJsonOutput}
                    onUpdateQuestion={handleUpdateQuestion}
                    onDeleteQuestion={handleDeleteQuestion}
                    selectedNode={selectedNode}
                    setSelectedNode={setSelectedNode}
                  />
                </ReactFlowProvider>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
