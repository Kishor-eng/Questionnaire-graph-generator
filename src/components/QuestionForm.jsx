import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";

// Add complete QuestionTagChoices
const QuestionTagChoices = {
  ADDRESS: 'address',
  ALLERGIES: 'allergies',
  CURRENTLY_ON_PILL: 'currently_on_pill',
  DEMOGRAPHIC_DOB: 'demographic_dob',
  DEMOGRAPHIC_FULL_NAME: 'demographic_full_name',
  DEMOGRAPHIC_GENDER: 'demographic_gender',
  DEMOGRAPHIC_OTHER: 'demographic_other',
  DVA: 'dva',
  EMAIL: 'email',
  ESCRIPT_ONLY: 'eScript_only',
  ETHNICITY: 'ethnicity',
  FAMILY_HISTORY: 'family_history',
  MEDICAL_HISTORY: 'medical_history',
  MEDICARE: 'medicare',
  MEDICATION: 'medication',
  MOBILE: 'mobile',
  NIB_MEMBERSHIP_NUMBER: 'nib_membership_number',
  OBSERVATION_ALCOHOL: 'observation_alcohol',
  OBSERVATION_BP: 'observation_bp',
  OBSERVATION_HEIGHT: 'observation_height',
  OBSERVATION_SMOKING: 'observation_smoking',
  OBSERVATION_WAIST: 'observation_waist',
  OBSERVATION_WEIGHT: 'observation_weight',
  OTHER: 'other',
  PAYMENT: 'payment',
  PREFERRED_PRODUCT: 'preferred_product',
  PREVIOUSLY_ON_PILL: 'previously_on_pill',
  RECENTLY_ON_MEDICATION: 'recently_on_medication'
};

const QuestionForm = ({ question, onUpdate, onCancel }) => {
  const [formData, setFormData] = useState({
    text: question.text || "",
    subtitle: question.subtitle || "",
    placeholder: question.placeholder || "",
    type: question.type || "long_text",
    options: question.options || [],
    type_params: question.type_params || {},
    required: question.required || false,
    auto_next: question.auto_next || false,
    internal_note: question.internal_note || "",
    next_question: question.next_question || null,
    branches: question.branches || { yes: null, no: null },
    tags: question.tags || [] // Add tags to state
  });

  // Update form when question changes
  useEffect(() => {
    setFormData({
      text: question.text || "",
      subtitle: question.subtitle || "",
      placeholder: question.placeholder || "",
      type: question.type || "long_text",
      options: question.options || [],
      type_params: question.type_params || {},
      required: question.required || false,
      auto_next: question.auto_next || false,
      internal_note: question.internal_note || "",
      next_question: question.next_question || null,
      branches: question.branches || { yes: null, no: null },
      tags: question.tags || []
    });
  }, [question]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleTypeChange = (e) => {
    const newType = e.target.value;
    let newTypeParams = {};
    
    // Set default type_params based on type
    switch (newType) {
      case "single_selection_list":
      case "multi_selection_list":
        newTypeParams = { 
          other: question.type_params?.other || false,
          exclusive: question.type_params?.exclusive || []
        };
        break;
      case "boolean":
        newTypeParams = {};
        break;
      case "number":
        newTypeParams = { min: null, max: null };
        break;
      case "float":
        newTypeParams = { min: null, max: null, decimal_places: 2 };
        break;
      case "date":
        newTypeParams = { format: "YYYY-MM-DD" };
        break;
      case "time":
        newTypeParams = { format: "HH:mm" };
        break;
      case "datetime":
        newTypeParams = { format: "YYYY-MM-DD HH:mm" };
        break;
      default:
        newTypeParams = {};
    }

    setFormData(prev => ({
      ...prev,
      type: newType,
      type_params: newTypeParams,
      options: prev.options || []
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Submitting question form with data:", formData);
    onUpdate({
      ...question,
      ...formData
    });
  };

  const addOption = () => {
    setFormData(prev => ({
      ...prev,
      options: [...(prev.options || []), ""]
    }));
  };

  const updateOption = (index, value) => {
    setFormData(prev => ({
      ...prev,
      options: (prev.options || []).map((opt, i) => i === index ? value : opt)
    }));
  };

  const removeOption = (index) => {
    setFormData(prev => ({
      ...prev,
      options: (prev.options || []).filter((_, i) => i !== index)
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="p-3">
      <div className="mb-3">
        <label className="form-label">Question Title</label>
        <input
          type="text"
          className="form-control"
          name="text"
          value={formData.text}
          onChange={handleChange}
          required
        />
      </div>

      <div className="mb-3">
        <label className="form-label">Subtitle</label>
        <input
          type="text"
          className="form-control"
          name="subtitle"
          value={formData.subtitle}
          onChange={handleChange}
        />
      </div>

      <div className="mb-3">
        <label className="form-label">Placeholder</label>
        <input
          type="text"
          className="form-control"
          name="placeholder"
          value={formData.placeholder}
          onChange={handleChange}
        />
      </div>

      <div className="mb-3">
        <label className="form-label">Question Type</label>
        <select
          className="form-select"
          name="type"
          value={formData.type}
          onChange={handleTypeChange}
        >
          <option value="long_text">Long Text</option>
          <option value="short_text">Short Text</option>
          <option value="single_selection_list">Single Selection List</option>
          <option value="multi_selection_list">Multiple Selection List</option>
          <option value="boolean">Boolean (Yes/No)</option>
          <option value="number">Number</option>
          <option value="float">Float</option>
          <option value="date">Date</option>
          <option value="time">Time</option>
          <option value="datetime">Date Time</option>
        </select>
      </div>

      {/* Add Tag Selection */}
      <div className="mb-3">
        <label className="form-label">Question Tags</label>
        <div className="border rounded p-3" style={{ maxHeight: '200px', overflowY: 'auto' }}>
          {Object.entries(QuestionTagChoices).map(([key, value]) => (
            <div key={key} className="form-check">
              <input
                type="checkbox"
                className="form-check-input"
                id={`tag-${key}`}
                checked={formData.tags.includes(value)}
                onChange={(e) => {
                  const newTags = e.target.checked
                    ? [...formData.tags, value]
                    : formData.tags.filter(t => t !== value);
                  setFormData(prev => ({
                    ...prev,
                    tags: newTags
                  }));
                }}
              />
              <label className="form-check-label" htmlFor={`tag-${key}`}>
                {key.split('_').map(word => 
                  word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                ).join(' ')}
              </label>
            </div>
          ))}
        </div>
        <small className="text-muted">
          Select tags to enable specific edge criteria for this question
        </small>
      </div>

      {(formData.type === "single_selection_list" || formData.type === "multi_selection_list") && (
        <div className="mb-3">
          <label className="form-label">Options</label>
          <div className="options-list mb-2">
            {formData.options?.map((option, index) => (
              <div key={index} className="input-group mb-2">
                <input
                  type="text"
                  className="form-control"
                  value={option}
                  onChange={(e) => updateOption(index, e.target.value)}
                />
                <button
                  type="button"
                  className="btn btn-outline-danger"
                  onClick={() => removeOption(index)}
                >
                  <FontAwesomeIcon icon={faTrash} />
                </button>
              </div>
            ))}
          </div>
          <div className="d-flex justify-content-between align-items-center">
            <button
              type="button"
              className="btn btn-outline-primary"
              onClick={addOption}
            >
              Add Option
            </button>
            <div className="form-check">
              <input
                type="checkbox"
                className="form-check-input"
                checked={formData.type_params?.other || false}
                onChange={(e) => {
                  setFormData(prev => ({
                    ...prev,
                    type_params: {
                      ...prev.type_params,
                      other: e.target.checked
                    }
                  }));
                }}
              />
              <label className="form-check-label">Allow "Other" option</label>
            </div>
          </div>
        </div>
      )}

      {(formData.type === "number" || formData.type === "float") && (
        <div className="mb-3">
          <div className="row">
            <div className="col">
              <label className="form-label">Minimum Value</label>
              <input
                type="number"
                className="form-control"
                value={formData.type_params.min ?? ""}
                min="0"
                onChange={(e) => {
                  const value = e.target.value === "" ? null : parseFloat(e.target.value);
                  setFormData(prev => ({
                    ...prev,
                    type_params: {
                      ...prev.type_params,
                      min: value
                    }
                  }));
                }}
              />
            </div>
            <div className="col">
              <label className="form-label">Maximum Value</label>
              <input
                type="number"
                className="form-control"
                value={formData.type_params.max ?? ""}
                min="0"
                onChange={(e) => {
                  const value = e.target.value === "" ? null : parseFloat(e.target.value);
                  setFormData(prev => ({
                    ...prev,
                    type_params: {
                      ...prev.type_params,
                      max: value
                    }
                  }));
                }}
              />
            </div>
          </div>
        </div>
      )}

      {formData.type === "float" && (
        <div className="mb-3">
          <label className="form-label">Decimal Places</label>
          <input
            type="number"
            className="form-control"
            value={formData.type_params.decimal_places || 2}
            min="0"
            onChange={(e) => {
              setFormData(prev => ({
                ...prev,
                type_params: {
                  ...prev.type_params,
                  decimal_places: parseInt(e.target.value) || 2
                }
              }));
            }}
          />
        </div>
      )}

      <div className="mb-3 form-check">
        <input
          type="checkbox"
          className="form-check-input"
          name="required"
          checked={formData.required}
          onChange={handleChange}
        />
        <label className="form-check-label">Required</label>
      </div>

      <div className="mb-3 form-check">
        <input
          type="checkbox"
          className="form-check-input"
          name="auto_next"
          checked={formData.auto_next}
          onChange={handleChange}
        />
        <label className="form-check-label">Auto Next</label>
      </div>

      <div className="mb-3">
        <label className="form-label">Internal Note</label>
        <textarea
          className="form-control"
          name="internal_note"
          value={formData.internal_note || ""}
          onChange={handleChange}
          rows="3"
        />
      </div>

      <div className="d-flex justify-content-between">
        <button type="submit" className="btn btn-success">Save Changes</button>
        {onCancel && <button type="button" className="btn btn-secondary" onClick={onCancel}>Cancel</button>}
      </div>
    </form>
  );
};

export default QuestionForm; 