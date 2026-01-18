// /components/NodeInspector.jsx
import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faInfoCircle, 
  faChevronDown, 
  faChevronUp, 
  faListUl, 
  faCode, 
  faAlignLeft,
  faToggleOn
} from "@fortawesome/free-solid-svg-icons";

const NodeInspector = ({ selectedNode, questions }) => {
  const [expandedSections, setExpandedSections] = useState({
    basic: true,
    options: false,
    connections: false,
    criteria: false,
    additionalDetails: false
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  if (!selectedNode) {
    return (
      <div className="card shadow-sm">
        <div className="card-body p-3">
          <h5 className="card-title fs-6 mb-0">
            <FontAwesomeIcon icon={faInfoCircle} className="me-2 text-secondary" />
            Node Inspector
          </h5>
          <p className="card-text small text-muted mt-2 mb-0">Select a node to view its details</p>
        </div>
      </div>
    );
  }

  // Find the full question data from the questions array
  const question = questions.find(q => q.id === selectedNode.id);
  
  // If we don't have the full question data, fall back to the node data
  const nodeData = question || selectedNode.data.question || selectedNode.data;

  const hasOptions = (nodeData.type === "single_selection_list" || nodeData.type === "multi_selection_list") && 
                     (nodeData.options?.length > 0 || nodeData.type_params?.exclusive?.length > 0);
  
  const hasBranches = nodeData.type === "boolean" && (nodeData.branches?.yes || nodeData.branches?.no);
  
  const hasNextQuestion = nodeData.type !== "dead_end" && nodeData.type !== "boolean" && nodeData.next_question;
  
  const hasCriteria = nodeData.edge_criteria && Object.keys(nodeData.edge_criteria).length > 0;

  return (
    <div className="card shadow-sm h-100">
      <div className="card-header bg-white py-2 px-3 d-flex align-items-center">
        <FontAwesomeIcon icon={faInfoCircle} className="me-2 text-primary" />
        <h5 className="card-title mb-0 fs-6">Node Details</h5>
      </div>
      <div className="card-body p-0" style={{ maxHeight: "calc(100vh - 300px)", overflowY: "auto" }}>
        {/* Basic Information Section */}
        <div className="border-bottom">
          <div 
            className="p-2 d-flex justify-content-between align-items-center cursor-pointer"
            onClick={() => toggleSection('basic')}
            style={{ cursor: 'pointer' }}
          >
            <span className="fw-bold text-primary small">Basic Information</span>
            <FontAwesomeIcon 
              icon={expandedSections.basic ? faChevronUp : faChevronDown} 
              className="text-secondary"
            />
          </div>
          
          {expandedSections.basic && (
            <div className="px-3 py-2">
              <div className="row g-2">
                <div className="col-12">
                  <div className="border-bottom pb-2 mb-2">
                    <div className="small text-muted">ID</div>
                    <div className="small text-truncate">{nodeData.id || selectedNode.id}</div>
                  </div>
                </div>
                
                <div className="col-12">
                  <div className="border-bottom pb-2 mb-2">
                    <div className="small text-muted">Text</div>
                    <div>{nodeData.text || nodeData.label || "No text provided"}</div>
                  </div>
                </div>
                
                <div className="col-6">
                  <div className="small text-muted">Type</div>
                  <div className="small">{nodeData.type || "Not specified"}</div>
                </div>
                
                <div className="col-6">
                  <div className="small text-muted">Required</div>
                  <div className="small">{nodeData.required ? "Yes" : "No"}</div>
                </div>
                
                <div className="col-6">
                  <div className="small text-muted">Auto Next</div>
                  <div className="small">{nodeData.auto_next ? "Yes" : "No"}</div>
                </div>
              </div>
              
              {(nodeData.subtitle || nodeData.placeholder || nodeData.internal_note) && (
                <button 
                  className="btn btn-sm btn-outline-secondary w-100 mt-2"
                  type="button"
                  onClick={() => toggleSection('additionalDetails')}
                >
                  {expandedSections.additionalDetails ? 'Hide' : 'Show'} additional details
                </button>
              )}
              
              {expandedSections.additionalDetails && (
                <div className="mt-2">
                  {nodeData.subtitle && (
                    <div className="mb-2">
                      <div className="small text-muted">Subtitle</div>
                      <div className="small">{nodeData.subtitle}</div>
                    </div>
                  )}
                  
                  {nodeData.placeholder && (
                    <div className="mb-2">
                      <div className="small text-muted">Placeholder</div>
                      <div className="small">{nodeData.placeholder}</div>
                    </div>
                  )}
                  
                  {nodeData.internal_note && (
                    <div className="mb-2">
                      <div className="small text-muted">Internal Note</div>
                      <div className="small">{nodeData.internal_note}</div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Options Section */}
        {hasOptions && (
          <div className="border-bottom">
            <div 
              className="p-2 d-flex justify-content-between align-items-center"
              onClick={() => toggleSection('options')}
              style={{ cursor: 'pointer' }}
            >
              <span className="fw-bold text-primary small">
                <FontAwesomeIcon icon={faListUl} className="me-2" />
                Options
              </span>
              <FontAwesomeIcon 
                icon={expandedSections.options ? faChevronUp : faChevronDown} 
                className="text-secondary"
              />
            </div>
            
            {expandedSections.options && (
              <div className="px-3 py-2">
                {nodeData.options && nodeData.options.length > 0 && (
                  <div className="mb-2">
                    <div className="small text-muted mb-1">Selection Options</div>
                    <div className="list-group list-group-flush">
                      {nodeData.options.map((opt, index) => (
                        <div key={index} className="list-group-item py-1 px-2 small">{opt}</div>
                      ))}
                    </div>
                  </div>
                )}
                
                {nodeData.type_params?.other && (
                  <div className="badge bg-info me-1 mb-2">Other option enabled</div>
                )}
                
                {nodeData.type_params?.exclusive?.length > 0 && (
                  <div>
                    <div className="small text-muted mb-1">Exclusive Options</div>
                    <div className="list-group list-group-flush">
                      {nodeData.type_params.exclusive.map((opt, index) => (
                        <div key={index} className="list-group-item py-1 px-2 small">{opt}</div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        
        {/* Connections Section */}
        {(hasBranches || hasNextQuestion) && (
          <div className="border-bottom">
            <div 
              className="p-2 d-flex justify-content-between align-items-center"
              onClick={() => toggleSection('connections')}
              style={{ cursor: 'pointer' }}
            >
              <span className="fw-bold text-primary small">
                <FontAwesomeIcon icon={faAlignLeft} className="me-2" />
                Navigation
              </span>
              <FontAwesomeIcon 
                icon={expandedSections.connections ? faChevronUp : faChevronDown} 
                className="text-secondary"
              />
            </div>
            
            {expandedSections.connections && (
              <div className="px-3 py-2">
                {hasBranches && (
                  <div>
                    <div className="small text-muted mb-1">Branches</div>
                    <div className="card card-body p-2 bg-light">
                      <div className="d-flex align-items-center mb-1">
                        <span className="badge bg-success me-2">Yes</span>
                        <span className="small">
                          {nodeData.branches?.yes ? (
                            questions.find(q => q.id === nodeData.branches.yes)?.text || "Not set"
                          ) : (
                            <span className="text-muted">Not set</span>
                          )}
                        </span>
                      </div>
                      <div className="d-flex align-items-center">
                        <span className="badge bg-danger me-2">No</span>
                        <span className="small">
                          {nodeData.branches?.no ? (
                            questions.find(q => q.id === nodeData.branches.no)?.text || "Not set"
                          ) : (
                            <span className="text-muted">Not set</span>
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
                
                {hasNextQuestion && (
                  <div>
                    <div className="small text-muted mb-1">Next Question</div>
                    <div className="card card-body p-2 bg-light">
                      <span className="small">
                        {questions.find(q => q.id === nodeData.next_question)?.text || "Not set"}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        
        {/* Criteria Section */}
        {hasCriteria && (
          <div>
            <div 
              className="p-2 d-flex justify-content-between align-items-center"
              onClick={() => toggleSection('criteria')}
              style={{ cursor: 'pointer' }}
            >
              <span className="fw-bold text-primary small">
                <FontAwesomeIcon icon={faCode} className="me-2" />
                Edge Criteria
              </span>
              <FontAwesomeIcon 
                icon={expandedSections.criteria ? faChevronUp : faChevronDown} 
                className="text-secondary"
              />
            </div>
            
            {expandedSections.criteria && (
              <div className="px-3 py-2">
                {Object.entries(nodeData.edge_criteria).map(([type, criteria]) => (
                  <div key={type} className="mb-2">
                    <div className="d-flex align-items-center mb-1">
                      <span className={`badge ${type === 'yes' ? 'bg-success' : type === 'no' ? 'bg-danger' : 'bg-primary'} me-2`}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </span>
                    </div>
                    
                    {Array.isArray(criteria) && criteria.length > 0 ? (
                      <div className="list-group list-group-flush">
                        {criteria.map((criterion, index) => (
                          <div key={index} className="list-group-item py-2 px-2">
                            <div className="fw-bold small">{criterion.choice}</div>
                            {criterion.config && Object.keys(criterion.config).length > 0 && (
                              <div className="small text-muted mt-1">
                                Config: {JSON.stringify(criterion.config)}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="fst-italic small text-muted">No criteria defined</div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default NodeInspector;
