import React, { useState, useEffect, useCallback, useRef, forwardRef, useImperativeHandle } from "react";
import ReactFlow, {
  Controls,
  Background,
  MarkerType,
  useReactFlow,
  useNodesState,
  useEdgesState,
  addEdge,
  Handle,
  Position
} from "reactflow";
import "reactflow/dist/style.css";
import dagre from "dagre";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faTrash, faEdit } from "@fortawesome/free-solid-svg-icons";
import NodeInspector from "./NodeInspector";
import EdgeInspector from "./EdgeInspector";

const nodeWidth = 200;
const nodeHeight = 50;

// Custom node component
const QuestionNode = ({ data, id }) => {
  const questionType = data.type || 'text';
  const label = data.label || 'Untitled Question';
  
  // Define different background colors based on question type
  let bgColor = '#f5f5f5';
  let textColor = '#000';
  
  switch (questionType) {
    case 'boolean':
      bgColor = '#e3f2fd'; // Light blue
      break;
    case 'single_selection_list':
    case 'multi_selection_list':
      bgColor = '#e8f5e9'; // Light green
      break;
    case 'number':
    case 'float':
      bgColor = '#fff8e1'; // Light yellow
      break;
    case 'date':
    case 'time':
    case 'datetime':
      bgColor = '#fce4ec'; // Light pink
      break;
    default:
      bgColor = '#f5f5f5'; // Default light gray
  }
  
  return (
    <div 
      style={{
        padding: 10,
        borderRadius: 5,
        border: '1px solid #ddd',
        background: bgColor,
        color: textColor,
        width: nodeWidth,
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        fontSize: '14px',
        position: 'relative'
      }}
    >
      <Handle type="target" position={Position.Top} style={{ background: '#555' }} />
      <div style={{ 
        position: 'absolute',
        top: -8,
        left: -8,
        background: '#666',
        color: 'white',
        borderRadius: '50%',
        width: 24,
        height: 24,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '12px',
        fontWeight: 'bold',
        border: '2px solid white'
      }}>
        {data.questionNumber || '?'}
      </div>
      <div style={{ fontWeight: 'bold', marginBottom: '5px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {label}
      </div>
      <div style={{ fontSize: '12px', color: '#666', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        Type: {questionType}
      </div>
      <Handle type="source" position={Position.Bottom} style={{ background: '#555' }} />
    </div>
  );
};

// Node types configuration for ReactFlow
const nodeTypes = {
  questionNode: QuestionNode
};

const getLayoutedElements = (nodes, edges) => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({ rankdir: "TB", nodesep: 50, ranksep: 100 });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const { x, y } = dagreGraph.node(node.id);
    return {
      ...node,
      position: { x, y },
      targetPosition: "top",
      sourcePosition: "bottom",
    };
  });

  return { nodes: layoutedNodes, edges };
};

const generateUUID = () =>
  "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });

// Move these functions outside the component to avoid initialization order issues
const createJsonFromGraph = (nodes, edges, questions) => {
  const formattedJson = [];
  const graphUUID = generateUUID();
  const questionMap = {};
  const nodeMap = {};

  let edgePkCounter = 2100;
  let criteriaPkCounter = 1800;

  nodes.forEach((node) => {
    questionMap[node.id] = generateUUID();
    nodeMap[node.id] = generateUUID();
  });

  formattedJson.push({
    model: "questionnaire.questionnairegraph",
    pk: graphUUID,
    fields: {
      name: "Graph Import",
      start: nodeMap[nodes[0]?.id],
      end: nodeMap[nodes[nodes.length - 1]?.id],
      category: 5,
      status: "active",
      internal_note: "Survey Test",
      variant: "A",
      variant_weighting: "100",
    },
  });

  formattedJson.push(
    ...nodes.map((node) => {
      // Find the corresponding question for complete data
      const question = questions.find(q => q.id === node.id) || {};
      
      // Prioritize question attributes over node.data for all properties
      return {
        model: "questionnaire.question",
        pk: questionMap[node.id],
        fields: {
          title: question.text || node.data.label || "No Title",
          subtitle: question.subtitle || node.data.subtitle || "TEST SUBTITLE",
          placeholder: question.placeholder || node.data.placeholder || null,
          type: question.type || node.data.type || "text",
          type_params: { 
            options: question.options || node.data.options || [], 
            exclusive: question.type_params?.exclusive || [],
            ...(question.type_params || {})
          },
          required: question.required ?? node.data.required ?? true,
          auto_next: question.auto_next ?? node.data.auto_next ?? false,
          internal_note: question.internal_note || node.data.internal_note || "Survey Question",
        },
      };
    })
  );

  formattedJson.push(
    ...nodes.map((node) => ({
      model: "questionnaire.node",
      pk: nodeMap[node.id],
      fields: {
        question: questionMap[node.id],
        sub_graph: null,
        parent_graph: graphUUID,
      },
    }))
  );

  // Collect edges and criteria
  const edgesCollection = [];
  const criteriaCollection = [];

  edges.forEach((edge) => {
    const edgePk = edgePkCounter++;
    
    // Add edge to collection
    edgesCollection.push({
      model: "questionnaire.edge",
      pk: edgePk,
      fields: {
        start: nodeMap[edge.source],
        end: nodeMap[edge.target],
      },
    });
    
    // Process criteria
    if (edge.data?.criteria && Array.isArray(edge.data.criteria) && edge.data.criteria.length > 0) {
      // Add custom criteria
      console.log(`Processing edge ${edge.id} with criteria:`, edge.data.criteria);
      edge.data.criteria.forEach(criterion => {
        criteriaCollection.push({
          model: "questionnaire.edgetriggercriteria",
          pk: criteriaPkCounter++,
          fields: {
            choice: criterion.choice,
            config: criterion.config || {},
            edge: edgePk,
          },
        });
      });
    } else {
      // Add default boolean criteria based on edge label
      console.log(`No custom criteria for edge ${edge.id}, using default`);
      criteriaCollection.push({
        model: "questionnaire.edgetriggercriteria",
        pk: criteriaPkCounter++,
        fields: {
          choice: `Boolean ${edge.label || "Next"}`,
          config: {},
          edge: edgePk,
        },
      });
    }
  });

  // Add edges and criteria to formatted JSON
  formattedJson.push(...edgesCollection);
  formattedJson.push(...criteriaCollection);

  return formattedJson;
};

const createFormBuilderFromGraph = (nodes, edges) => {
  return nodes.map((node) => ({
    id: node.id,
    label: node.data.label,
    type: "text",
    options: edges
      .filter((e) => e.source === node.id)
      .map((e) => ({
        label: e.label,
        value: e.target,
      })),
  }));
};

const QuestionGraph = forwardRef(({
  questions = [],
  setQuestions = () => {},
  setJsonOutput = () => {},
  setFormBuilderData = () => {},
  onUpdateQuestion,
  onDeleteQuestion,
  selectedNode,
  setSelectedNode
}, ref) => {
  const { fitView, getViewport, setViewport } = useReactFlow();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [edgeType, setEdgeType] = useState("Next");
  const isImportingRef = useRef(false);
  const containerRef = useRef(null);
  const autoLayoutButtonRef = useRef(null);
  const [selectedEdge, setSelectedEdge] = useState(null);
  const [draggedNode, setDraggedNode] = useState(null);
  const [nearbyNode, setNearbyNode] = useState(null);
  const [showNodeForm, setShowNodeForm] = useState(false);
  const [alert, setAlert] = useState({ show: false, message: '', type: 'warning' });
  const [contextMenu, setContextMenu] = useState({
    show: false,
    x: 0,
    y: 0,
    type: null, // 'node' or 'edge'
    data: null
  });
  const [swapSource, setSwapSource] = useState(null);
  const [showSwapConfirm, setShowSwapConfirm] = useState(false);
  const [swapNodes, setSwapNodes] = useState({ source: null, target: null });

  // Expose methods to parent through ref
  useImperativeHandle(ref, () => ({
    setIsImporting: (value) => {
      isImportingRef.current = value;
      if (value && autoLayoutButtonRef.current) {
        setTimeout(() => {
          autoLayoutButtonRef.current.click();
        }, 300);
      }
    }
  }));

  // Function to show alert
  const showAlert = (message, type = 'warning') => {
    setAlert({ show: true, message, type });
    setTimeout(() => setAlert({ show: false, message: '', type: 'warning' }), 3000);
  };

  // Handle layout
 const handleLayout = useCallback(() => {
  if (!nodes.length) return;
  
  const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(nodes, edges);
  
  // Update React Flow state with the new layout.
  setNodes([...layoutedNodes]);
  setEdges([...layoutedEdges]);
  
  // Persist each node's computed position back into the questions data.
  setQuestions(prevQuestions =>
    prevQuestions.map(q => {
      const correspondingNode = layoutedNodes.find(n => n.id === q.id);
      if (correspondingNode) {
        return { ...q, position: correspondingNode.position };
      }
      return q;
    })
  );
  
  setTimeout(() => {
    fitView({ padding: 0.2 });
  }, 100);
}, [nodes, edges, setNodes, setEdges, fitView, setQuestions]);

  // Create graph elements from questions
  const graphElements = useCallback(() => {
    if (!questions || questions.length === 0) {
      return { nodes: [], edges: [] };
    }

    const nodes = [];
    const edges = [];
    const edgeTracker = new Map();
    
    questions.forEach((q, index) => {
      nodes.push({
        id: q.id,
        type: 'questionNode',
        position: q.position || { x: Math.random() * 500, y: Math.random() * 300 },
        data: {
          label: q.text || 'Untitled Question',
          type: q.type || 'short_text',
          question: q,
          questionNumber: index + 1
        }
      });
    });
    
    questions.forEach((q) => {
      const sourceId = q.id;
      
      const createEdge = (targetId, type, criteria = []) => {
        const edgeId = `e-${sourceId}-${targetId}-${type.toLowerCase()}`;
        if (edgeTracker.has(edgeId)) return;
        
        let style = { stroke: '#757575' };
        let labelStyle = { fill: '#757575', fontWeight: 700 };
        let markerColor = '#757575';
        
        if (type === 'Yes') {
          style = { stroke: '#4caf50' };
          labelStyle = { fill: '#4caf50', fontWeight: 700 };
          markerColor = '#4caf50';
        } else if (type === 'No') {
          style = { stroke: '#f44336' };
          labelStyle = { fill: '#f44336', fontWeight: 700 };
          markerColor = '#f44336';
        }
        
        edges.push({
          id: edgeId,
          source: sourceId,
          target: targetId,
          type: 'smoothstep',
          label: type,
          labelStyle,
          style,
          markerEnd: {
            type: MarkerType.ArrowClosed,
            width: 20,
            height: 20,
            color: markerColor,
          },
          data: {
            label: type,
            criteria
          }
        });
        
        edgeTracker.set(edgeId, true);
      };

      if (q.next_question) {
        createEdge(q.next_question, 'Next', q.edge_criteria?.next || []);
      }

      if (q.branches) {
        if (q.branches.yes) {
          createEdge(q.branches.yes, 'Yes', q.edge_criteria?.yes || []);
        }
        if (q.branches.no) {
          createEdge(q.branches.no, 'No', q.edge_criteria?.no || []);
        }
      }
    });

    return { nodes, edges };
  }, [questions]);

  // Update graph when questions change
  useEffect(() => {
    const { nodes: newNodes, edges: newEdges } = graphElements();
    setNodes(newNodes);
    setEdges(newEdges);

    // Only auto-layout on import
    if (isImportingRef.current) {
      requestAnimationFrame(() => {
        handleLayout();
        isImportingRef.current = false;
      });
    }
  }, [graphElements, setNodes, setEdges]);

  // Function to handle node copy
  const handleCopyNode = useCallback((node) => {
    const originalQuestion = questions.find(q => q.id === node.id);
    if (!originalQuestion) return;

    const newId = Date.now().toString();
    const copiedQuestion = {
      ...originalQuestion,
      id: newId,
      text: `${originalQuestion.text} (Copy)`,
      next_question: null,
      branches: { yes: null, no: null }
    };

    setQuestions(prev => [...prev, copiedQuestion]);
    setContextMenu({ show: false, x: 0, y: 0, type: null, data: null });
  }, [questions, setQuestions]);

  // Function to swap titles
  const handleSwapTitles = useCallback(() => {
    const { source, target } = swapNodes;
    if (!source || !target) return;

    const sourceQuestion = questions.find(q => q.id === source.id);
    const targetQuestion = questions.find(q => q.id === target.id);

    if (sourceQuestion && targetQuestion) {
      // Swap only the text/title
      const sourceText = sourceQuestion.text;
      const targetText = targetQuestion.text;

      const updatedSource = { ...sourceQuestion, text: targetText };
      const updatedTarget = { ...targetQuestion, text: sourceText };

      // Update both questions
      onUpdateQuestion(updatedSource);
      onUpdateQuestion(updatedTarget);

      // Update nodes display
      setNodes(nodes => nodes.map(node => {
        if (node.id === source.id) {
          return { ...node, data: { ...node.data, label: targetText } };
        }
        if (node.id === target.id) {
          return { ...node, data: { ...node.data, label: sourceText } };
        }
        return node;
      }));

      showAlert('Question titles swapped successfully', 'success');
    }

    // Reset states
    setShowSwapConfirm(false);
    setSwapNodes({ source: null, target: null });
    setDraggedNode(null);
    setNearbyNode(null);
  }, [swapNodes, questions, onUpdateQuestion, setNodes]);

  // Node dragging handlers for swapping
  const onNodeDragStart = useCallback((event, node) => {
    setDraggedNode(node);
  }, []);

  const onNodeDrag = useCallback((event, node) => {
    if (!node) return;

    // Find nearby nodes for swapping
    const swapThreshold = 100; // Adjust this value to change swap sensitivity
    const otherNodes = nodes.filter(n => n.id !== node.id);
    
    const nearby = otherNodes.find(otherNode => {
      const dx = Math.abs(node.position.x - otherNode.position.x);
      const dy = Math.abs(node.position.y - otherNode.position.y);
      return dx < swapThreshold && dy < swapThreshold;
    });

    if (nearby !== nearbyNode) {
      setNearbyNode(nearby);
      
      // Update visual feedback
      setNodes(nds => nds.map(n => {
        if (nearby && n.id === nearby.id) {
          return {
            ...n,
            style: { ...n.style, boxShadow: '0 0 0 2px #4CAF50' },
            className: 'node-nearby'
          };
        }
        return {
          ...n,
          style: { ...n.style, boxShadow: null },
          className: ''
        };
      }));
    }
  }, [nodes, nearbyNode]);

  const onNodeDragStop = useCallback((event, draggedNode) => {
    if (!draggedNode || !nearbyNode) {
      setDraggedNode(null);
      setNearbyNode(null);
      setNodes(nds => nds.map(n => ({
        ...n,
        style: { ...n.style, boxShadow: null },
        className: ''
      })));
      return;
    }

    // Show swap confirmation
    setSwapNodes({
      source: draggedNode,
      target: nearbyNode
    });
    setShowSwapConfirm(true);

    // Reset drag states
    setDraggedNode(null);
    setNearbyNode(null);
    setNodes(nds => nds.map(n => ({
      ...n,
      style: { ...n.style, boxShadow: null },
      className: ''
    })));
  }, [nearbyNode]);

  // Handle node/edge deletion
const handleDelete = useCallback((item, type) => {
  // Capture the current viewport
  const currentViewport = getViewport();

  if (type === 'node') {
    // Remove the node from the questions array
    setQuestions(prevQuestions => prevQuestions.filter(q => q.id !== item.id));
    // Remove from React Flow’s internal state
    setNodes(nodes => nodes.filter(n => n.id !== item.id));
    setEdges(edges => edges.filter(e => e.source !== item.id && e.target !== item.id));
  
    if (onDeleteQuestion) {
      onDeleteQuestion(item);
    }
  
    // **DO NOT** call handleLayout() here so that existing layout is preserved.
    // setTimeout(() => { handleLayout(); }, 100);

  } else if (type === 'edge') {
    setEdges(edges => edges.filter(e => e.id !== item.id));
  
    // Update source question’s connection (if needed)
    const sourceQuestion = questions.find(q => q.id === item.source);
    if (sourceQuestion) {
      const updatedQuestion = { ...sourceQuestion };
      if (item.label === 'Next') {
        updatedQuestion.next_question = null;
      } else if (item.label === 'Yes' || item.label === 'No') {
        updatedQuestion.branches = {
          ...updatedQuestion.branches,
          [item.label.toLowerCase()]: null
        };
      }
      onUpdateQuestion(updatedQuestion);
    }
  }
  setContextMenu({ show: false, x: 0, y: 0, type: null, data: null });

    // Restore the viewport shortly after deletion.
  setTimeout(() => {
    setViewport(currentViewport);
  }, 0);

}, [nodes, edges, questions, onDeleteQuestion, onUpdateQuestion, setQuestions, getViewport, setViewport]);

  // Function to complete the swap operation
  const handleCompleteSwap = useCallback((targetNode) => {
    if (!swapSource || swapSource.id === targetNode.id) {
      setSwapSource(null);
      return;
    }

    setSwapNodes({
      source: swapSource,
      target: targetNode
    });
    setShowSwapConfirm(true);
    setSwapSource(null);
  }, [swapSource]);

  // Handle node click with swap support
  const handleNodeClick = useCallback((event, node) => {
    event.preventDefault();
    
    // If we're in swap mode, complete the swap
    if (swapSource) {
      handleCompleteSwap(node);
      return;
    }

    setSelectedEdge(null);
    
    if (setSelectedNode) {
      setSelectedNode(node);
    }

    // Reset all cards
    document.querySelectorAll('.question-card').forEach(el => {
      el.style.backgroundColor = 'white';
      el.style.borderColor = '#dee2e6';
      el.style.boxShadow = 'none';
      el.style.transition = 'all 0.5s ease-in-out';
    });

    // Find and highlight the question card
    const questionElement = document.getElementById(`question-${node.id}`);
    if (questionElement) {
      // Make sure transition is set before any color changes
      questionElement.style.transition = 'all 0.5s ease-in-out';
      
      // Scroll into view first
      questionElement.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center'
      });

      // Start the color sequence
      setTimeout(() => {
        // First highlight - soft blue
        questionElement.style.backgroundColor = '#E3F2FD';
        questionElement.style.borderColor = '#90CAF9';
        questionElement.style.boxShadow = '0 0 15px rgba(144, 202, 249, 0.2)';

        setTimeout(() => {
          // Back to white
          questionElement.style.backgroundColor = 'white';
          questionElement.style.borderColor = '#dee2e6';
          questionElement.style.boxShadow = 'none';

          setTimeout(() => {
            // Second highlight - slightly more intense
            questionElement.style.backgroundColor = '#BBDEFB';
            questionElement.style.borderColor = '#64B5F6';
            questionElement.style.boxShadow = '0 0 15px rgba(100, 181, 246, 0.3)';

            // Return to default after 2 seconds
            setTimeout(() => {
              questionElement.style.backgroundColor = 'white';
              questionElement.style.borderColor = '#dee2e6';
              questionElement.style.boxShadow = 'none';
            }, 2000);
          }, 400);
        }, 400);
      }, 100);
    }
  }, [setSelectedNode, swapSource, handleCompleteSwap]);

  // Handle edge click
  const onEdgeClick = useCallback((event, edge) => {
    event.stopPropagation();
    setSelectedEdge(edge);
    if (setSelectedNode) {
      setSelectedNode(null);
    }
  }, [setSelectedNode]);

  // Handle edge type change
  const handleEdgeTypeChange = useCallback((e) => {
    setEdgeType(e.target.value);
  }, []);

  // Handle add node
  const handleAddNode = useCallback(() => {
    const newId = Date.now().toString();
    const newQuestion = {
      id: newId,
      text: "New Question",
      type: "long_text",
      options: [],
      required: false,
      auto_next: false,
      next_question: null,
      branches: { yes: null, no: null },
      edge_criteria: {}
    };

    setQuestions(prevQuestions => [...prevQuestions, newQuestion]);
  }, [setQuestions]);

  // Handle node update
  const handleUpdateNode = useCallback((nodeId) => {
    const question = questions.find(q => q.id === nodeId);
    if (question && onUpdateQuestion) {
      onUpdateQuestion(question);
    }
  }, [questions, onUpdateQuestion]);

  // Handle node deletion
  const handleNodeDelete = useCallback((nodeId) => {
    setNodes(nodes => nodes.filter(n => n.id !== nodeId));
    setEdges(edges => edges.filter(e => e.source !== nodeId && e.target !== nodeId));
    
    if (onDeleteQuestion) {
      const questionToDelete = questions.find(q => q.id === nodeId);
      if (questionToDelete) {
        onDeleteQuestion(questionToDelete);
      }
    }
    
    if (selectedNode?.id === nodeId) {
      setSelectedNode(null);
    }
  }, [nodes, edges, questions, selectedNode, setSelectedNode, onDeleteQuestion]);

  // Handle connection
  const onConnect = useCallback((params) => {
    const sourceQuestion = questions.find(q => q.id === params.source);
    const targetQuestion = questions.find(q => q.id === params.target);
    
    if (!sourceQuestion || !targetQuestion) return;

    // Get existing edges from the source node
    const existingSourceEdges = edges.filter(edge => edge.source === params.source);

    // Validation Rule 1: Boolean questions can only have Yes/No edges
    if (sourceQuestion.type === 'boolean') {
      if (edgeType === 'Next') {
        showAlert('Boolean questions can only have Yes/No edges');
        return;
      }
      
      // Check if trying to add duplicate Yes/No edge
      const hasYesEdge = existingSourceEdges.some(edge => edge.label === 'Yes');
      const hasNoEdge = existingSourceEdges.some(edge => edge.label === 'No');
      
      if ((edgeType === 'Yes' && hasYesEdge) || (edgeType === 'No' && hasNoEdge)) {
        showAlert(`This boolean question already has a ${edgeType} edge`);
        return;
      }
    }

    // Validation Rule 2: Next edge should only connect to one question
    if (edgeType === 'Next') {
      const hasNextEdge = existingSourceEdges.some(edge => edge.label === 'Next');
      if (hasNextEdge) {
        showAlert('A question can only have one Next edge');
        return;
      }
    }

    // Validation Rule 3: Non-boolean questions should not have Yes/No edges
    if (sourceQuestion.type !== 'boolean' && (edgeType === 'Yes' || edgeType === 'No')) {
      showAlert('Only boolean questions can have Yes/No edges');
      return;
    }

    // Check if connection already exists
    const connectionExists = edges.some(
      edge => edge.source === params.source && 
             edge.target === params.target && 
             edge.label === edgeType
    );
    
    if (connectionExists) {
      showAlert('This connection already exists');
      return;
    }

    const edgeId = `e-${params.source}-${params.target}-${edgeType.toLowerCase()}`;
    let edgeStyle = { stroke: '#757575' };
    let labelStyle = { fill: '#757575', fontWeight: 700 };
    let markerColor = '#757575';
    
    if (edgeType === 'Yes') {
      edgeStyle = { stroke: '#4caf50' };
      labelStyle = { fill: '#4caf50', fontWeight: 700 };
      markerColor = '#4caf50';
    } else if (edgeType === 'No') {
      edgeStyle = { stroke: '#f44336' };
      labelStyle = { fill: '#f44336', fontWeight: 700 };
      markerColor = '#f44336';
    }
    
    const newEdge = {
      id: edgeId,
      ...params,
      type: 'smoothstep',
      label: edgeType,
      labelStyle,
      style: edgeStyle,
      markerEnd: {
        type: MarkerType.ArrowClosed,
        width: 20,
        height: 20,
        color: markerColor,
      },
      data: {
        label: edgeType,
        criteria: []
      }
    };
    
    setEdges(eds => addEdge(newEdge, eds));
    
    // Update question connections
    if (sourceQuestion) {
      const updatedQuestion = { ...sourceQuestion };
      
      if (edgeType === 'Next') {
        updatedQuestion.next_question = params.target;
      } else {
        updatedQuestion.branches = updatedQuestion.branches || { yes: null, no: null };
        if (edgeType === 'Yes') {
          updatedQuestion.branches.yes = params.target;
        } else if (edgeType === 'No') {
          updatedQuestion.branches.no = params.target;
        }
      }
      
      onUpdateQuestion(updatedQuestion);
    }
  }, [edges, questions, edgeType, onUpdateQuestion]);

  // Handle node context menu
  const onNodeContextMenu = useCallback((event, node) => {
    event.preventDefault();
    const rect = containerRef.current.getBoundingClientRect();
    setContextMenu({
      show: true,
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
      type: 'node',
      data: node
    });
  }, []);

  // Handle edge context menu
  const onEdgeContextMenu = useCallback((event, edge) => {
    event.preventDefault();
    const rect = containerRef.current.getBoundingClientRect();
    setContextMenu({
      show: true,
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
      type: 'edge',
      data: edge
    });
  }, []);

  // Close context menu when clicking outside
  useEffect(() => {
    const handleClick = () => {
      setContextMenu({ show: false, x: 0, y: 0, type: null, data: null });
    };

    if (contextMenu.show) {
      document.addEventListener('click', handleClick);
    }

    return () => {
      document.removeEventListener('click', handleClick);
    };
  }, [contextMenu.show]);

  return (
    <div className="row" style={{ height: "100%" }}>
      <div className="col-md-9" style={{ height: "100%" }}>
        <div 
          ref={containerRef}
          style={{ 
            height: "100%", 
            border: "1px solid black", 
            padding: "10px",
            position: "relative",
            overflow: "hidden"
          }}
        >
          {/* Context Menu */}
          {contextMenu.show && (
            <div 
              style={{
                position: 'absolute',
                top: contextMenu.y,
                left: contextMenu.x,
                backgroundColor: 'white',
                border: '1px solid #ccc',
                borderRadius: '4px',
                padding: '5px',
                boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
                zIndex: 1000
              }}
            >
              {contextMenu.type === 'node' && (
                <>
                  <button 
                    className="btn btn-sm btn-light d-block w-100 mb-1"
                    onClick={() => handleCopyNode(contextMenu.data)}
                  >
                    Copy Node
                  </button>
                  <button 
                    className="btn btn-sm btn-danger d-block w-100"
                    onClick={() => handleDelete(contextMenu.data, 'node')}
                  >
                    Delete Node
                  </button>
                </>
              )}
              {contextMenu.type === 'edge' && (
                <button 
                  className="btn btn-sm btn-danger d-block w-100"
                  onClick={() => handleDelete(contextMenu.data, 'edge')}
                >
                  Delete Connection
                </button>
              )}
            </div>
          )}

          {/* Visual indicator for swap mode */}
          {swapSource && (
            <div 
              className="alert alert-info"
              style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                zIndex: 1000,
                maxWidth: '300px'
              }}
            >
              Click another question to swap titles with "{swapSource.data.label}"
              <button 
                type="button" 
                className="btn-close" 
                onClick={() => setSwapSource(null)}
              ></button>
            </div>
          )}

          {alert.show && (
            <div 
              className={`alert alert-${alert.type} alert-dismissible fade show`}
              style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                zIndex: 1000,
                maxWidth: '300px'
              }}
            >
              {alert.message}
              <button type="button" className="btn-close" onClick={() => setAlert({ show: false, message: '', type: 'warning' })}></button>
            </div>
          )}

          {/* Swap Confirmation Modal */}
          {showSwapConfirm && (
            <div 
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0,0,0,0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1100
              }}
            >
              <div 
                className="card"
                style={{
                  width: '400px',
                  maxWidth: '90%'
                }}
              >
                <div className="card-header">
                  Confirm Swap Titles
                </div>
                <div className="card-body">
                  <p>Are you sure you want to swap titles between:</p>
                  <ul>
                    <li><strong>"{swapNodes.source?.data.label}"</strong></li>
                    <li><strong>"{swapNodes.target?.data.label}"</strong></li>
                  </ul>
                  <p className="mt-3 text-danger">
                    <strong>Warning:</strong> Swapping titles will NOT swap data types. Please amend data types in the Form Builder if needed. 
                  </p>
                  <div className="d-flex justify-content-end gap-2">
                    <button 
                      className="btn btn-secondary"
                      onClick={() => {
                        setShowSwapConfirm(false);
                        setSwapNodes({ source: null, target: null });
                      }}
                    >
                      Cancel
                    </button>
                    <button 
                      className="btn btn-primary"
                      onClick={handleSwapTitles}
                    >
                      Swap Titles
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <h2>Graph Visualisation</h2>
          <div style={{ marginBottom: "10px" }}>
            <label htmlFor="edgeType" className="me-2">Select Edge Type: </label>
            <select 
              id="edgeType" 
              value={edgeType} 
              onChange={handleEdgeTypeChange}
              className="form-select d-inline-block w-auto me-2"
            >
              <option value="Next">Next</option>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
            <button 
              ref={autoLayoutButtonRef}
              onClick={handleLayout} 
              className="btn btn-outline-primary me-2"
              title="Automatically arrange nodes"
            >
              <i className="fas fa-sitemap me-1"></i>Auto Layout
            </button>
            <button 
              onClick={handleAddNode}
              className="btn btn-outline-info"
              title="Add new question"
            >
              <i className="fas fa-plus me-1"></i>Add Node
            </button>
          </div>

          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={handleNodeClick}
            onEdgeClick={onEdgeClick}
            onNodeContextMenu={onNodeContextMenu}
            onEdgeContextMenu={onEdgeContextMenu}
            onNodeDragStart={onNodeDragStart}
            onNodeDrag={onNodeDrag}
            onNodeDragStop={onNodeDragStop}
            fitView={false}
            fitViewOptions={{ duration: 300 }}
            minZoom={0.1}
            maxZoom={2}
            defaultViewport={{ x: 0, y: 0, zoom: 1 }}
            elementsSelectable={true}
            nodesDraggable={true}
            edgesUpdatable={true}
            edgesFocusable={true}
            connectionMode="loose"
            snapToGrid={true}
            snapGrid={[15, 15]}
            deleteKeyCode={null}
            nodeTypes={nodeTypes}
            connectionRadius={60}
          >
            <Background />
            <Controls />
          </ReactFlow>
        </div>
      </div>
      <div className="col-md-3">
        {selectedNode && (
          <NodeInspector
            selectedNode={selectedNode}
            questions={questions}
            onUpdateNode={handleUpdateNode}
            onDeleteNode={handleNodeDelete}
            isOpen={showNodeForm}
            onClose={() => setShowNodeForm(false)}
          />
        )}
        {selectedEdge && (
          <EdgeInspector
            selectedEdge={selectedEdge}
            questions={questions}
            onUpdateEdge={(edgeId, newEdge) => {
              // Update edge in graph
              setEdges(edges.map(e => 
                e.id === edgeId ? { ...e, ...newEdge } : e
              ));

              // Update edge criteria in question
              const sourceQuestion = questions.find(q => q.id === newEdge.source);
              if (sourceQuestion) {
                const updatedQuestion = { ...sourceQuestion };
                const edgeType = newEdge.label?.toLowerCase();

                // Initialize edge_criteria if needed
                updatedQuestion.edge_criteria = updatedQuestion.edge_criteria || {};
                
                // Update criteria based on edge type
                if (edgeType === 'next') {
                  updatedQuestion.edge_criteria.next = newEdge.data.criteria || [];
                } else if (edgeType === 'yes') {
                  updatedQuestion.edge_criteria.yes = newEdge.data.criteria || [];
                } else if (edgeType === 'no') {
                  updatedQuestion.edge_criteria.no = newEdge.data.criteria || [];
                }

                onUpdateQuestion(updatedQuestion);
              }
            }}
          />
        )}
      </div>
    </div>
  );
});

export default QuestionGraph;
