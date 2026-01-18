// /components/FormBuilder.jsx
import React, { useState, useEffect, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowUp, faArrowDown, faTrash, faPlus, faEdit } from "@fortawesome/free-solid-svg-icons";
import QuestionForm from "./QuestionForm";

const generateUUID = () =>
  "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });

const FormBuilder = ({
  questions = [],
  setQuestions = () => {},
  setJsonOutput = () => {},
  selectedNode = null,
  nodes = [],
  setNodes = () => {},
  onAddQuestion = null,
  onUpdateQuestion = () => {},
  onDeleteQuestion = () => {}
}) => {
  const [localQuestions, setLocalQuestions] = useState([]);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    setLocalQuestions(questions);
  }, [questions]);

  const handleAddQuestion = () => {
    if (onAddQuestion) {
      onAddQuestion();
      return;
    }
    
    const newQuestion = {
      id: generateUUID(),
      text: "New Question",
      subtitle: "",
      placeholder: "",
      type: "long_text",
      options: [],
      type_params: {},
      required: false,
      auto_next: false,
      internal_note: "",
      next_question: null,
      branches: { yes: null, no: null },
      edge_criteria: {}
    };

    setQuestions([...questions, newQuestion]);
  };

  const handleEditQuestion = (question) => {
    setSelectedQuestion(question);
    setIsEditing(true);
  };

  const handleUpdateQuestion = (updatedQuestion) => {
    const originalQuestion = questions.find(q => q.id === updatedQuestion.id) || {};
    
    const updatedQuestions = questions.map((q) => {
      if (q.id === updatedQuestion.id) {
        return {
          ...originalQuestion,
          ...updatedQuestion,
          edge_criteria: updatedQuestion.edge_criteria || originalQuestion.edge_criteria || {}
        };
      }
      return q;
    });
    
    setQuestions(updatedQuestions);
    setIsEditing(false);
    setSelectedQuestion(null);
  };

  const handleDeleteQuestion = (questionId) => {
    const questionToDelete = questions.find(q => q.id === questionId);
    
    if (questionToDelete) {
      if (typeof onDeleteQuestion === 'function') {
        onDeleteQuestion(questionToDelete);
      } else {
        deleteQuestion(questionId);
      }
    }
  };

  const handleMoveQuestion = (index, direction) => {
    if (direction === "up" && index > 0) {
      const newQuestions = [...questions];
      const temp = newQuestions[index];
      newQuestions[index] = newQuestions[index - 1];
      newQuestions[index - 1] = temp;
      
      newQuestions.forEach((q, i) => {
        q.order = i;
      });
      
      setQuestions(newQuestions);
    } else if (direction === "down" && index < questions.length - 1) {
      const newQuestions = [...questions];
      const temp = newQuestions[index];
      newQuestions[index] = newQuestions[index + 1];
      newQuestions[index + 1] = temp;
      
      newQuestions.forEach((q, i) => {
        q.order = i;
      });
      
      setQuestions(newQuestions);
    }
  };

  const updateQuestion = useCallback((id, key, value) => {
    const updatedQuestions = localQuestions.map((q) => {
      if (q.id === id) {
        if (key === "type") {
          // Reset fields based on new type
          if (value === "single_selection_list") {
            return {
              ...q,
              type: value,
              options: q.options || [],
              branches: {},
              next_question: "",
              edge_criteria: q.edge_criteria || {} // Preserve edge criteria
            };
          } else if (value === "boolean") {
            return {
              ...q,
              type: value,
              options: [],
              branches: q.branches || { yes: "", no: "" },
              next_question: "",
              edge_criteria: q.edge_criteria || { yes: [], no: [] } // Initialize edge criteria for boolean
            };
          } else if (value === "long_text") {
            return {
              ...q,
              type: value,
              options: [],
              branches: {},
              next_question: q.next_question || "",
              edge_criteria: q.edge_criteria || {} // Preserve edge criteria
            };
          } else if (value === "dead_end") {
            return {
              ...q,
              type: value,
              options: [],
              branches: {},
              next_question: "",
              edge_criteria: q.edge_criteria || {} // Preserve edge criteria
            };
          }
        } else if (key.startsWith("branches.")) {
          return {
                ...q,
                branches: {
              ...(q.branches || {}),
                  [key.replace("branches.", "")]: value,
                },
          };
        } else if (key.startsWith("edge_criteria.")) {
          const [_, branch, index] = key.split(".");
          return {
            ...q,
            edge_criteria: {
              ...(q.edge_criteria || {}),
              [branch]: [
                ...(q.edge_criteria?.[branch] || []).slice(0, index),
                value,
                ...(q.edge_criteria?.[branch] || []).slice(parseInt(index) + 1)
              ]
            }
          };
        }
        return { ...q, [key]: value };
      }
      return q;
    });
    setLocalQuestions(updatedQuestions);
    setQuestions(updatedQuestions);
  }, [localQuestions, setQuestions]);

  const addOption = useCallback((id) => {
    const updatedQuestions = localQuestions.map((q) =>
      q.id === id ? { ...q, options: [...(q.options || []), ""] } : q
    );
    setLocalQuestions(updatedQuestions);
    setQuestions(updatedQuestions);
  }, [localQuestions, setQuestions]);

  const updateOption = useCallback((qId, optIndex, value) => {
    const updatedQuestions = localQuestions.map((q) =>
        q.id === qId
          ? {
              ...q,
            options: (q.options || []).map((opt, i) =>
                i === optIndex ? value : opt
              ),
            }
          : q
    );
    setLocalQuestions(updatedQuestions);
    setQuestions(updatedQuestions);
  }, [localQuestions, setQuestions]);

  const deleteQuestion = useCallback((id) => {
    const newQuestions = localQuestions.filter((q) => q.id !== id);
    setLocalQuestions(newQuestions);
    setQuestions(newQuestions);
  }, [localQuestions, setQuestions]);

  if (!Array.isArray(localQuestions)) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h2 className="text-center mb-4">Form Builder</h2>

      {isEditing && selectedQuestion ? (
        <QuestionForm
          question={selectedQuestion}
          onUpdate={handleUpdateQuestion}
          onCancel={() => {
            setIsEditing(false);
            setSelectedQuestion(null);
          }}
        />
      ) : (
        <div className="questions-list">
          {localQuestions.map((q, index) => (
            <div 
              key={q.id} 
              id={`question-${q.id}`}
              className="card mb-3 question-card"
              style={{ 
                backgroundColor: 'white',
                borderColor: '#dee2e6',
                transition: 'all 0.3s ease'
              }}
            >
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h5 className="card-title">Question {index + 1}</h5>
                  <div>
                    <button 
                      className="btn btn-light me-2" 
                      onClick={() => handleMoveQuestion(index, "up")}
                      disabled={index === 0}
                    >
                      <FontAwesomeIcon icon={faArrowUp} />
                    </button>
                    <button 
                      className="btn btn-light me-2" 
                      onClick={() => handleMoveQuestion(index, "down")}
                      disabled={index === localQuestions.length - 1}
                    >
                      <FontAwesomeIcon icon={faArrowDown} />
                    </button>
                    <button 
                      className="btn btn-light me-2" 
                      onClick={() => handleEditQuestion(q)}
                    >
                      <FontAwesomeIcon icon={faEdit} />
                    </button>
                    <button 
                      className="btn btn-danger" 
                      onClick={() => handleDeleteQuestion(q.id)}
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </div>
                </div>
                <p className="card-text"><strong>Text:</strong> {q.text}</p>
                <p className="card-text"><strong>Type:</strong> {q.type}</p>
                {q.tags && q.tags.length > 0 && (
                  <p className="card-text">
                    <strong>Tags:</strong>{" "}
                    {q.tags.map((tag, idx) => (
                      <span 
                        key={idx} 
                        className="badge bg-info me-1"
                        style={{ fontSize: '0.8em' }}
                      >
                        {tag}
                      </span>
                    ))}
                  </p>
                )}
                {q.subtitle && <p className="card-text"><strong>Subtitle:</strong> {q.subtitle}</p>}
                {q.placeholder && <p className="card-text"><strong>Placeholder:</strong> {q.placeholder}</p>}
                {q.required && <p className="card-text"><strong>Required:</strong> Yes</p>}
                {q.auto_next && <p className="card-text"><strong>Auto Next:</strong> Yes</p>}
                {q.internal_note && <p className="card-text"><strong>Internal Note:</strong> {q.internal_note}</p>}
                {(q.type === "single_selection_list" || q.type === "multi_selection_list") && (
                  <>
                    <p className="card-text">
                      <strong>Options:</strong> {q.options?.length > 0 ? q.options.join(", ") : "No options"}
                    </p>
                    {q.type_params?.other && (
                      <p className="card-text">
                        <strong>Other Option:</strong> Enabled
                      </p>
                    )}
                    {q.type_params?.exclusive?.length > 0 && (
                      <p className="card-text">
                        <strong>Exclusive Options:</strong> {q.type_params.exclusive.join(", ")}
                      </p>
                    )}
                  </>
                )}
                {q.type === "boolean" && (
                  <p className="card-text">
                    <strong>Branches:</strong> Yes → {q.branches?.yes ? "Question " + (localQuestions.findIndex(q2 => q2.id === q.branches.yes) + 1) : "None"}, 
                    No → {q.branches?.no ? "Question " + (localQuestions.findIndex(q2 => q2.id === q.branches.no) + 1) : "None"}
                  </p>
                )}
                {q.type !== "boolean" && q.next_question && (
                  <p className="card-text">
                    <strong>Next Question:</strong> {localQuestions.findIndex(q2 => q2.id === q.next_question) + 1}
                  </p>
                )}
                {q.type_params && (
                  <div className="card-text">
                    <strong>Type Parameters:</strong>
                    <pre className="mt-1" style={{ fontSize: '0.8rem' }}>
                      {JSON.stringify(q.type_params, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          ))}
          <button onClick={handleAddQuestion} className="btn btn-primary w-100">
            Add Question
          </button>
        </div>
      )}
    </div>
  );
};

const QuestionCard = ({ question, onEdit, onDelete, onMoveUp, onMoveDown, isFirst, isLast }) => {
  return (
    <div className="card mb-3">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-start mb-2">
          <div>
            <h5 className="card-title mb-1">{question.text || "Untitled Question"}</h5>
            <div className="text-muted small mb-2">Type: {question.type}</div>
            
            {/* Display Tags */}
            {question.tags && question.tags.length > 0 && (
              <div className="mb-2">
                {question.tags.map((tag, index) => (
                  <span 
                    key={index} 
                    className="badge bg-info me-1"
                    style={{ fontSize: '0.8em' }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Display Options if any */}
            {question.options && question.options.length > 0 && (
              <div className="small text-muted mt-1">
                Options: {question.options.join(", ")}
              </div>
            )}
          </div>
          <div className="d-flex">
            <button
              className="btn btn-sm btn-outline-secondary me-1"
              onClick={() => onMoveUp(question.id)}
              disabled={isFirst}
            >
              ↑
            </button>
            <button
              className="btn btn-sm btn-outline-secondary me-1"
              onClick={() => onMoveDown(question.id)}
              disabled={isLast}
            >
              ↓
            </button>
            <button
              className="btn btn-sm btn-outline-primary me-1"
              onClick={() => onEdit(question)}
            >
              <FontAwesomeIcon icon={faEdit} />
            </button>
            <button
              className="btn btn-sm btn-outline-danger"
              onClick={() => onDelete(question)}
            >
              <FontAwesomeIcon icon={faTrash} />
            </button>
          </div>
        </div>

        {/* Additional Question Info */}
        <div className="d-flex flex-wrap gap-2">
          {question.required && (
            <span className="badge bg-danger">Required</span>
          )}
          {question.auto_next && (
            <span className="badge bg-success">Auto Next</span>
          )}
          {question.internal_note && (
            <div className="small text-muted mt-1 w-100">
              Note: {question.internal_note}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FormBuilder;
