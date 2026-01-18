import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTrash,
  faChevronDown,
  faChevronUp,
  faPlus,
  faInfoCircle,
  faLink,
  faCode,
  faCheck
} from "@fortawesome/free-solid-svg-icons";

import {
  EDGE_CRITERIA_TYPES,
  EDGE_CRITERIA_LABELS,
  getCriteriaForQuestion,
  formatCriteriaForDropdown,
  getCriteriaForQuestionTags
} from '../constants/edgeCriteria';

const EdgeInspector = ({ selectedEdge, questions, onUpdateEdge }) => {
  const [formData, setFormData] = useState({ criteria: [] });
  const [expandedSections, setExpandedSections] = useState({
    basic: true,
    criteria: false
  });
  const [expandedCriteria, setExpandedCriteria] = useState({});
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  useEffect(() => {
    if (selectedEdge && selectedEdge.data) {
      console.log("Selected edge data:", selectedEdge.data);
      
      // Convert existing criteria from label to value format
      const convertedCriteria = Array.isArray(selectedEdge.data.criteria) ? 
        selectedEdge.data.criteria.map(criterion => {
          // Find the value that matches this label
          const value = Object.entries(EDGE_CRITERIA_LABELS).find(
            ([_, label]) => label === criterion.choice
          )?.[0];

          // Convert config based on criteria type
          let config = {};
          if (criterion.config) {
            if (criterion.config.trigger_value !== undefined) {
              config.value = criterion.config.trigger_value;
            }
            if (criterion.config.list_values) {
              config.list_values = criterion.config.list_values;
            }
            if (criterion.config.options_selection) {
              config.list_values = Object.keys(criterion.config.options_selection).filter(
                key => criterion.config.options_selection[key]
              );
            }
          }

          return {
            choice: value || criterion.choice,
            config: config
          };
        }) : [];

      setFormData({
        criteria: JSON.parse(JSON.stringify(convertedCriteria))
      });
      
      if (Array.isArray(selectedEdge.data.criteria)) {
        const expanded = {};
        selectedEdge.data.criteria.forEach((_, index) => {
          expanded[index] = false;
        });
        setExpandedCriteria(expanded);
      } else {
        setExpandedCriteria({});
      }
    } else {
      setFormData({ criteria: [] });
      setExpandedCriteria({});
    }
  }, [selectedEdge]);

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const getAvailableCriteriaTypes = () => {
    if (!selectedEdge) return [];
    
    const sourceQuestion = questions.find(q => q.id === selectedEdge.source);
    if (!sourceQuestion) return [];

    // Get criteria based on question tags
    const availableCriteria = getCriteriaForQuestionTags(sourceQuestion.tags || []);

    // If no tags or no criteria available, return basic criteria
    if (!availableCriteria || availableCriteria.length === 0) {
      return [
        { value: EDGE_CRITERIA_TYPES.BOOL_YES, label: EDGE_CRITERIA_LABELS[EDGE_CRITERIA_TYPES.BOOL_YES] },
        { value: EDGE_CRITERIA_TYPES.BOOL_NO, label: EDGE_CRITERIA_LABELS[EDGE_CRITERIA_TYPES.BOOL_NO] },
        { value: EDGE_CRITERIA_TYPES.LIST_VALUE_SET, label: EDGE_CRITERIA_LABELS[EDGE_CRITERIA_TYPES.LIST_VALUE_SET] },
        { value: EDGE_CRITERIA_TYPES.LIST_VALUE_NOT_SET, label: EDGE_CRITERIA_LABELS[EDGE_CRITERIA_TYPES.LIST_VALUE_NOT_SET] }
      ];
    }

    return availableCriteria;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedEdge) return;

    // Validasi dan format kriteria sesuai backend
    const validatedCriteria = (formData.criteria || []).map(criterion => {
      const baseStructure = {
        choice: EDGE_CRITERIA_LABELS[criterion.choice],
        config: {}
      };

      // Tambahkan konfigurasi berdasarkan tipe kriteria
      switch (criterion.choice) {
        case EDGE_CRITERIA_TYPES.LIST_VALUE_SET:
        case EDGE_CRITERIA_TYPES.LIST_VALUE_NOT_SET:
          baseStructure.config = {
            options_selection: criterion.config.list_values.reduce((acc, val) => {
              acc[val] = true;
              return acc;
            }, {}),
            other_value: null
          };
          break;

        case EDGE_CRITERIA_TYPES.BMI_GTE:
        case EDGE_CRITERIA_TYPES.BMI_LT:
        case EDGE_CRITERIA_TYPES.AGE_GTE:
        case EDGE_CRITERIA_TYPES.AGE_LT:
          baseStructure.config = {
            trigger_value: parseFloat(criterion.config.value)
          };
          break;

        case EDGE_CRITERIA_TYPES.ETHNICITY_SET:
        case EDGE_CRITERIA_TYPES.ETHNICITY_NOT_SET:
          baseStructure.config = {
            list_values: criterion.config.list_values || []
          };
          break;

        // Tidak perlu config untuk kriteria boolean
        case EDGE_CRITERIA_TYPES.BOOL_YES:
        case EDGE_CRITERIA_TYPES.BOOL_NO:
        case EDGE_CRITERIA_TYPES.GENDER_FEMALE:
        case EDGE_CRITERIA_TYPES.GENDER_NOT_FEMALE:
        case EDGE_CRITERIA_TYPES.RECENT_MEDICATION_USAGE_INDICATED:
        case EDGE_CRITERIA_TYPES.RECENT_MEDICATION_USAGE_NOT_INDICATED:
          baseStructure.config = {};
          break;
      }

      return baseStructure;
    });

    const updatedEdge = {
      ...selectedEdge,
      data: {
        ...selectedEdge.data,
        criteria: validatedCriteria
      }
    };

    console.log("Updating edge with criteria:", updatedEdge.data.criteria);
    onUpdateEdge(selectedEdge.id, updatedEdge);
    
    const newExpandedCriteria = {};
    Object.keys(expandedCriteria).forEach(key => {
      newExpandedCriteria[key] = false;
    });
    setExpandedCriteria(newExpandedCriteria);
    
    setToastMessage("Edge criteria saved successfully!");
    setShowToast(true);
    
    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCriteriaChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      criteria: (prev.criteria || []).map((criterion, i) => 
        i === index ? { ...criterion, [field]: value } : criterion
      )
    }));
  };

  const handleConfigChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      criteria: (prev.criteria || []).map((criterion, i) => {
        if (i === index) {
          if (field === "list_values") {
            return { 
              ...criterion, 
              config: { 
                ...criterion.config,
                list_values: Array.isArray(value) ? value : [value]
              }
            };
          }
          
          return { 
            ...criterion, 
            config: { ...criterion.config, [field]: value }
          };
        }
        return criterion;
      })
    }));
  };

  const addCriteria = () => {
    const availableTypes = getAvailableCriteriaTypes();
    if (availableTypes.length > 0) {
      const criteriaType = availableTypes[0];
      
      const newCriterion = {
        choice: criteriaType.value,
        config: {}
      };
      
      setFormData(prev => ({
        ...prev,
        criteria: [...(prev.criteria || []), newCriterion]
      }));
      
      const newIndex = formData.criteria.length;
      setExpandedCriteria(prev => ({
        ...prev,
        [newIndex]: true
      }));

      setExpandedSections(prev => ({
        ...prev,
        criteria: true
      }));
    } else {
      setToastMessage("Please select question tags first to enable edge criteria");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
  };

  const removeCriteria = (index, e) => {
    if (e) e.stopPropagation();
    
    const confirmDelete = window.confirm("Are you sure you want to delete this criterion?");
    
    if (confirmDelete) {
      setFormData(prev => ({
        ...prev,
        criteria: (prev.criteria || []).filter((_, i) => i !== index)
      }));
      
      const newExpandedCriteria = { ...expandedCriteria };
      delete newExpandedCriteria[index];
      
      const renumbered = {};
      Object.keys(newExpandedCriteria).forEach(key => {
        const keyNum = parseInt(key);
        if (keyNum > index) {
          renumbered[keyNum - 1] = newExpandedCriteria[key];
        } else {
          renumbered[keyNum] = newExpandedCriteria[key];
        }
      });
      
      setExpandedCriteria(renumbered);
      
      setToastMessage("Criterion deleted successfully!");
      setShowToast(true);
      
      setTimeout(() => {
        setShowToast(false);
      }, 3000);
    }
  };

  const toggleCriteria = (index) => {
    setExpandedCriteria(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  if (!selectedEdge) return null;

  const sourceQuestion = questions.find(q => q.id === selectedEdge.source);
  const targetQuestion = questions.find(q => q.id === selectedEdge.target);
  const availableCriteriaTypes = getAvailableCriteriaTypes();

  return (
    <>
      {showToast && (
        <div className="position-fixed top-0 end-0 p-3" style={{ zIndex: 1050 }}>
          <div className="toast show" role="alert" aria-live="assertive" aria-atomic="true">
            <div className="toast-header bg-success text-white">
              <FontAwesomeIcon icon={faCheck} className="me-2" />
              <strong className="me-auto">Success</strong>
              <button 
                type="button" 
                className="btn-close btn-close-white" 
                onClick={() => setShowToast(false)}
                aria-label="Close"
              ></button>
            </div>
            <div className="toast-body">{toastMessage}</div>
          </div>
        </div>
      )}

      <div className="card shadow-sm h-100">
        <div className="card-header bg-white py-2 px-3 d-flex align-items-center">
          <FontAwesomeIcon icon={faLink} className="me-2 text-primary" />
          <h5 className="card-title mb-0 fs-6">Edge Details</h5>
        </div>
        <div className="card-body p-0" style={{ maxHeight: "calc(100vh - 300px)", overflowY: "auto" }}>
          {/* Basic Information Section */}
          <div className="border-bottom">
            <div 
              className="p-2 d-flex justify-content-between align-items-center"
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
                <div className="row g-2 mb-2">
                  <div className="col-12">
                    <div className="small text-muted">Edge Type</div>
                    <div className="p-2 bg-light rounded">
                      <span className={`badge ${selectedEdge.label === 'Yes' ? 'bg-success' : 
                                             selectedEdge.label === 'No' ? 'bg-danger' : 
                                             'bg-primary'}`}>
                        {selectedEdge.label}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="row g-2 mb-2">
                  <div className="col-12">
                    <div className="small text-muted">Source Question</div>
                    <div className="p-2 bg-light rounded">
                      {sourceQuestion?.text || "Unknown"}
                      {sourceQuestion?.tag && (
                        <span className="badge bg-secondary ms-2">{sourceQuestion.tag}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="row g-2">
                  <div className="col-12">
                    <div className="small text-muted">Target Question</div>
                    <div className="p-2 bg-light rounded">
                      {targetQuestion?.text || "Unknown"}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Edge Criteria Section */}
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
              <div className="d-flex align-items-center">
                {availableCriteriaTypes.length > 0 && (
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-primary me-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      addCriteria();
                    }}
                    title="Add Criteria"
                  >
                    <FontAwesomeIcon icon={faPlus} />
                  </button>
                )}
                <FontAwesomeIcon 
                  icon={expandedSections.criteria ? faChevronUp : faChevronDown} 
                  className="text-secondary"
                />
              </div>
            </div>
            
            {expandedSections.criteria && (
              <form onSubmit={handleSubmit} className="px-3 py-2">
                {formData.criteria.length === 0 ? (
                  <div className="text-center py-3 text-muted small">
                    <p>No criteria defined yet.</p>
                    {availableCriteriaTypes.length > 0 ? (
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-primary"
                        onClick={addCriteria}
                      >
                        <FontAwesomeIcon icon={faPlus} className="me-1" />
                        Add Criteria
                      </button>
                    ) : (
                      <p className="small">No criteria types available for this question type.</p>
                    )}
                  </div>
                ) : (
                  <>
                    {formData.criteria.map((criterion, index) => (
                      <div key={index} className="card mb-2 border">
                        <div
                          className="card-header d-flex justify-content-between align-items-center py-2 px-3"
                          onClick={() => toggleCriteria(index)}
                          style={{ cursor: "pointer", backgroundColor: expandedCriteria[index] ? "#f8f9fa" : "white" }}
                        >
                          <span className="small">Criteria {index + 1}</span>
                          <div>
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-danger me-2"
                              onClick={(e) => removeCriteria(index, e)}
                            >
                              <FontAwesomeIcon icon={faTrash} />
                            </button>
                            <FontAwesomeIcon
                              icon={expandedCriteria[index] ? faChevronUp : faChevronDown}
                              className="text-secondary"
                            />
                          </div>
                        </div>

                        {expandedCriteria[index] && (
                          <div className="card-body p-3">
                            <div className="mb-3">
                              <label className="form-label small">Criteria Type</label>
                              <select
                                className="form-select form-select-sm"
                                value={criterion.choice}
                                onChange={(e) => handleCriteriaChange(index, "choice", e.target.value)}
                              >
                                <option value="">Select type</option>
                                {availableCriteriaTypes.map((type) => (
                                  <option key={type.value} value={type.value}>
                                    {type.label}
                                  </option>
                                ))}
                              </select>
                            </div>

                            {/* List Criteria Input */}
                            {['list_value_set', 'list_value_not_set'].includes(criterion.choice) && (
                              <div className="mb-3">
                                <label className="form-label small">List Values</label>
                                <div className="list-values-container border rounded p-2" style={{ maxHeight: "150px", overflowY: "auto" }}>
                                  {sourceQuestion?.options?.map((option) => (
                                    <div key={option} className="form-check">
                                      <input
                                        type="checkbox"
                                        className="form-check-input"
                                        checked={criterion.config?.list_values?.includes(option)}
                                        onChange={(e) => {
                                          const currentValues = criterion.config?.list_values || [];
                                          const newValues = e.target.checked
                                            ? [...currentValues, option]
                                            : currentValues.filter(val => val !== option);
                                          handleConfigChange(index, "list_values", newValues);
                                        }}
                                      />
                                      <label className="form-check-label small">{option}</label>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Numeric Criteria Input */}
                            {['bmi_gte', 'bmi_lt', 'age_gte', 'age_lt'].includes(criterion.choice) && (
                              <div className="mb-3">
                                <label className="form-label small">Value</label>
                                <input
                                  type="number"
                                  className="form-control form-control-sm"
                                  value={criterion.config?.value || ""}
                                  onChange={(e) => handleConfigChange(index, "value", e.target.value)}
                                  step="any"
                                />
                              </div>
                            )}

                            {/* Boolean dan kriteria lain tanpa config */}
                            {['bool_yes', 'bool_no', 'gender_female', 'gender_not_female',
                              'ethnicity_set', 'ethnicity_not_set',
                              'recent_medication_usage_indicated', 'recent_medication_usage_not_indicated'
                            ].includes(criterion.choice) && (
                              <div className="text-muted small">
                                No additional configuration needed for this criteria type.
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}

                    <div className="d-grid mt-3">
                      <button type="submit" className="btn btn-sm btn-success">
                        <FontAwesomeIcon icon={faCheck} className="me-1" />
                        Save Changes
                      </button>
                    </div>
                  </>
                )}
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default EdgeInspector; 