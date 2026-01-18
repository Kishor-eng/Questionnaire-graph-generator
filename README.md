# Survey Flow Builder

A powerful and intuitive graph-based questionnaire builder that allows you to create complex surveys with branching logic and conditional flows.

## Features

### Visual Graph Editor
- Drag-and-drop interface for creating questionnaires
- Visual representation of question flow and relationships
- Auto-layout functionality for clean graph arrangement
- Smooth pan and zoom controls

### Node Management
- Create, edit, and delete question nodes
- Copy existing nodes with preserved properties
- Swap question titles via drag and drop
- Visual feedback for node interactions
- Quick navigation between graph and form views

### Connection Types
- **Next**: Standard flow connection (gray)
- **Yes**: Positive branch for boolean questions (green)
- **No**: Negative branch for boolean questions (red)
- Smart validation for connection types:
  * Boolean questions only allow Yes/No edges
  * Non-boolean questions only allow Next edges
  * Prevents duplicate connections

### Edge Criteria
- Add conditional logic to question flows
- Multiple criteria types based on question tags:
  * Demographics (age, gender, ethnicity)
  * Medical (BMI, medication usage)
  * Lists (value selection)
  * Boolean (Yes/No conditions)
- Stack multiple criteria for complex conditions

### Question Properties
- Multiple question types:
  * Text (short/long)
  * Boolean (Yes/No)
  * Single/Multi Selection Lists
  * Numeric
  * Date/Time
- Required/Optional settings
- Auto-next capability
- Custom placeholders
- Internal notes

### Data Management
- Import/Export questionnaires as JSON
- Preserve graph layout and node positions
- Maintain edge criteria and conditions
- Version tracking support

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Extract the zip file to your desired location and set folder as current directory:
```bash
unzip survey-flow-builder.zip
cd survey-graph-generator
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Start the development server:
```bash
npm start
# or
yarn start
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage Guide

### Basic Operations
- Click and drag nodes to move them
- Connect nodes by dragging from one node to another
- Right-click nodes or edges for additional options
- Use mouse wheel to zoom in/out
- Hold space and drag to pan the canvas

### Creating a Survey
1. Click "Add Node" to create a new question
2. Configure question properties in the form panel
3. Connect questions by dragging between nodes
4. Select edge type (Next/Yes/No) before connecting
5. Add criteria to edges as needed
6. Use auto-layout for clean arrangement

### Swapping Question Titles
1. Click and drag a node near another node
2. Wait for the target node to highlight in green
3. Release to show swap confirmation
4. Confirm to swap titles while preserving other properties

## Contributing

We welcome contributions! Please feel free to submit pull requests.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built with [React](https://reactjs.org/)
- Graph visualization powered by [React Flow](https://reactflow.dev/)
- Layout algorithms by [dagre](https://github.com/dagrejs/dagre)

## Project Structure

```
survey-flow-builder/
├── src/
│   ├── components/         # React components
│   │   ├── QuestionGraph.jsx      # Main graph editor
│   │   ├── QuestionForm.jsx       # Question form editor
│   │   ├── EdgeInspector.jsx      # Edge properties editor
│   │   ├── NodeInspector.jsx      # Node properties editor
│   │   └── VisualizationGuide.jsx # User guide component
│   ├── constants/         # Application constants
│   ├── hooks/            # Custom React hooks
│   ├── utils/            # Utility functions
│   └── App.js            # Root component
├── public/              # Static files
├── package.json         # Dependencies and scripts
└── README.md           # This file
```

## Deployment

To create a production build:

```bash
npm run build
# or
yarn build
```

This will create a `build` folder with optimized production files that can be served by any static file server.

## Support

For any questions or issues, please contact account holder.
