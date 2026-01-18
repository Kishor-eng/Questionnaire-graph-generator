import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faChevronDown, 
  faChevronUp,
  faMousePointer, 
  faLink, 
  faArrowsAlt, 
  faCode, 
  faFilter,
  faTags,
  faSitemap,
  faEdit
} from "@fortawesome/free-solid-svg-icons";

const VisualizationGuide = ({ isOpen, onToggle }) => {
  return (
    <div className="card mb-3">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h5 className="card-title mb-0">Visualisation Guide</h5>
        <button
          className="btn btn-link p-0"
          onClick={onToggle}
        >
          <FontAwesomeIcon icon={isOpen ? faChevronUp : faChevronDown} />
        </button>
      </div>
      {isOpen && (
        <div className="card-body">
          <div className="mb-3">
            <h6><FontAwesomeIcon icon={faMousePointer} className="me-2" />Basic Operations</h6>
            <ul className="list-group list-group-flush">
              <li className="list-group-item">
                <strong>Select Node:</strong> Click on a node to view its details and highlight the corresponding question in the form
              </li>
              <li className="list-group-item">
                <strong>Move Node:</strong> Click and drag to move nodes
              </li>
              <li className="list-group-item">
                <strong>Create Connection:</strong> Click and drag from one node to another
              </li>
              <li className="list-group-item">
                <strong>Right-click Node:</strong> Shows options to copy or delete the node
              </li>
              <li className="list-group-item">
                <strong>Right-click Edge:</strong> Shows option to delete the connection
              </li>
            </ul>
          </div>

          <div className="mb-3">
            <h6><FontAwesomeIcon icon={faSitemap} className="me-2" />Auto Layout</h6>
            <ul className="list-group list-group-flush">
              <li className="list-group-item">
                <strong>Automatic Layout:</strong> Graph will auto-arrange when:
                <ul className="mt-2">
                  <li>Importing a new JSON file</li>
                  <li>Clicking the "Auto Layout" button</li>
                </ul>
              </li>
              <li className="list-group-item">
                <strong>Manual Arrangement:</strong> You can freely drag nodes to customise their positions
              </li>
            </ul>
          </div>

          <div className="mb-3">
            <h6><FontAwesomeIcon icon={faEdit} className="me-2" />Node Interaction</h6>
            <ul className="list-group list-group-flush">
              <li className="list-group-item">
                <strong>Quick Navigation:</strong> Clicking a node will:
                <ul className="mt-2">
                  <li>Highlight the corresponding question in the form</li>
                  <li>Automatically scroll to the question</li>
                  <li>Show a visual feedback with blue highlight</li>
                </ul>
              </li>
              <li className="list-group-item">
                <strong>Edit Question:</strong> Click the edit button in the highlighted question card to modify its properties
              </li>
              <li className="list-group-item">
                <strong>Swap Question Titles:</strong> To swap titles between two questions:
                <ul className="mt-2">
                  <li>Click and drag a node near another node</li>
                  <li>When nodes are close enough, the target node will highlight in green</li>
                  <li>Release the drag to show swap confirmation dialog</li>
                  <li>Confirm to swap only the titles while preserving all other properties</li>
                </ul>
                <p className="mt-2 text-danger">
                  <strong>Warning:</strong> Swapping will NOT swap the node's data type. Please amend them in the Form Builder manually if needed.
                </p>
              </li>
            </ul>
          </div>

          <div className="mb-3">
            <h6><FontAwesomeIcon icon={faTags} className="me-2" />Question Tags</h6>
            <ul className="list-group list-group-flush">
              <li className="list-group-item">
                <strong>Purpose:</strong> Tags define the type and behavior of questions
              </li>
              <li className="list-group-item">
                <strong>Available Tags:</strong> Include demographic info, medical history, observations, etc.
              </li>
              <li className="list-group-item">
                <strong>Edge Criteria:</strong> Tags determine what criteria types are available for edges
              </li>
            </ul>
          </div>

          <div className="mb-3">
            <h6><FontAwesomeIcon icon={faLink} className="me-2" />Edge Types</h6>
            <ul className="list-group list-group-flush">
              <li className="list-group-item">
                <span className="badge bg-primary me-2">Next</span> - Default connection between questions
              </li>
              <li className="list-group-item">
                <span className="badge bg-success me-2">Yes</span> - Branch for "Yes" answer
              </li>
              <li className="list-group-item">
                <span className="badge bg-danger me-2">No</span> - Branch for "No" answer
              </li>
            </ul>
          </div>

          <div className="mb-3">
            <h6><FontAwesomeIcon icon={faFilter} className="me-2" />Edge Criteria</h6>
            <ul className="list-group list-group-flush">
              <li className="list-group-item">
                <strong>What is Edge Criteria?</strong> Conditions that determine when an edge should be followed based on the source question's answer and tags.
              </li>
              <li className="list-group-item">
                <strong>Tag-Based Criteria:</strong> Available criteria types depend on the question's tags
              </li>
              <li className="list-group-item">
                <strong>Adding Criteria:</strong> Click on an edge to select it, then use the Edge Inspector panel to add criteria
              </li>
              <li className="list-group-item">
                <strong>Criteria Types:</strong>
                <ul className="mt-2">
                  <li><strong>Demographics:</strong> Age, gender, ethnicity criteria</li>
                  <li><strong>Medical:</strong> BMI, medication usage criteria</li>
                  <li><strong>Lists:</strong> Value selection criteria</li>
                  <li><strong>Boolean:</strong> Yes/No criteria</li>
                </ul>
              </li>
              <li className="list-group-item">
                <strong>Multiple Criteria:</strong> Add multiple criteria to create complex conditions
              </li>
            </ul>
          </div>
          
          <div className="mb-3">
            <h6><FontAwesomeIcon icon={faArrowsAlt} className="me-2" />Layout Controls</h6>
            <ul className="list-group list-group-flush">
              <li className="list-group-item">
                <strong>Zoom:</strong> Use mouse wheel to zoom in/out
              </li>
              <li className="list-group-item">
                <strong>Pan:</strong> Hold space and drag to move the canvas
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default VisualizationGuide; 