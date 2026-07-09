<div style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; color: #334155; line-height: 1.6; max-width: 1100px; margin: 0 auto; padding: 20px;">

  <!-- ── MAIN HEADER ──────────────────────────────────────────────────────── -->
  <h1 style="color: #1e3a8a; font-size: 2.8rem; font-weight: 800; border-bottom: 4px solid #3b82f6; padding-bottom: 15px; margin-bottom: 25px; display: flex; align-items: center; gap: 15px;">
    <span style="background: linear-gradient(135deg, #3b82f6, #6366f1); color: white; padding: 8px 16px; border-radius: 16px; font-size: 2.2rem; box-shadow: 0 4px 12px rgba(59,130,246,0.25);">R</span>
    ResearchMind AI — Agentic AI Research OS
  </h1>

  <p style="font-size: 1.25rem; color: #475569; font-weight: 500; margin-bottom: 30px;">
    An advanced, production-grade <b>Full-Stack Agentic AI Research Assistant SaaS</b> designed to eliminate the fragmentation of academic workflows. Built on a state-of-the-art <b>LangGraph multi-agent architecture</b> with a strict <b>ChromaDB RAG pipeline</b>, ResearchMind AI processes PDFs, indexes semantic chunks, and deploys 17 specialized AI agents to extract metadata, citations, research gaps, mathematical formulas, and write outlines.
  </p>

  <hr style="border: 0; height: 1px; background: #e2e8f0; margin: 40px 0;">

  <!-- ── TABLE OF CONTENTS ────────────────────────────────────────────────── -->
  <h2 style="color: #4f46e5; font-size: 1.8rem; font-weight: 700; margin-bottom: 20px; display: flex; align-items: center; gap: 10px;">
    <span>📑</span> Table of Contents
  </h2>

  <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; padding: 24px; margin-bottom: 40px; box-shadow: inset 0 2px 4px rgba(0,0,0,0.02);">
    <ul style="list-style-type: none; padding-left: 0; margin: 0; display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 12px;">
      <li>🔍 <a href="#what-is-researchmind" style="color: #2563eb; text-decoration: none; font-weight: 600;">What is ResearchMind AI</a></li>
      <li>👥 <a href="#who-its-for" style="color: #2563eb; text-decoration: none; font-weight: 600;">Who It's For</a></li>
      <li>⚠️ <a href="#problems-solved" style="color: #2563eb; text-decoration: none; font-weight: 600;">What Problems It Solves</a></li>
      <li>🖼️ <a href="#visual-diagrams" style="color: #2563eb; text-decoration: none; font-weight: 600;">System Diagrams & Workflows</a></li>
      <li>🤖 <a href="#agentic-architecture" style="color: #2563eb; text-decoration: none; font-weight: 600;">Multi-Agent Architecture</a></li>
      <li>📖 <a href="#how-to-use" style="color: #2563eb; text-decoration: none; font-weight: 600;">How to Use the Project</a></li>
      <li>📂 <a href="#project-structure" style="color: #2563eb; text-decoration: none; font-weight: 600;">Project Structure</a></li>
      <li>💻 <a href="#tech-stack" style="color: #2563eb; text-decoration: none; font-weight: 600;">Tech Stack</a></li>
      <li>⚙️ <a href="#local-setup" style="color: #2563eb; text-decoration: none; font-weight: 600;">How to Run Locally</a></li>
      <li>🔑 <a href="#environment-variables" style="color: #2563eb; text-decoration: none; font-weight: 600;">Environment Templates</a></li>
      <li>🌐 <a href="#api-endpoints" style="color: #2563eb; text-decoration: none; font-weight: 600;">All API Routes Summary</a></li>
      <li>🔒 <a href="#security-groundedness" style="color: #2563eb; text-decoration: none; font-weight: 600;">Security & Groundedness</a></li>
      <li>📦 <a href="#dependencies" style="color: #2563eb; text-decoration: none; font-weight: 600;">Package Dependencies</a></li>
    </ul>
  </div>

  <hr style="border: 0; height: 1px; background: #e2e8f0; margin: 40px 0;">

  <!-- ── SECTION 1 ───────────────────────────────────────────────────────── -->
  <h2 id="what-is-researchmind" style="color: #059669; font-size: 1.8rem; font-weight: 700; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; margin-bottom: 20px;">
    🔍 What is ResearchMind AI
  </h2>

  <p style="margin-bottom: 16px;">
    ResearchMind AI serves as a comprehensive <b>Research Operating System (OS)</b> that bridges the gap between raw scientific papers (PDFs) and structured academic understanding. Users upload papers, which are instantly hosted via Cloudinary, parsed by PyMuPDF and pdfplumber, and sent to a Python-based FastAPI microservice.
  </p>

  <p style="margin-bottom: 20px;">
    Once the microservice receives the paper, it runs a stateful, multi-agent pipeline using <b>LangGraph</b>. The text is cleaned, split into semantic sections, chunked with overlap, and embedded into a persistent <b>ChromaDB vector store</b>. Subsequently, a coordinated network of 17 AI agents runs sequentially to compile summaries, gap analyses, experiment hypotheses, mind maps, quizzes, and writing drafts.
  </p>

  <div style="background: linear-gradient(135deg, #eff6ff, #f5f3ff); border: 1px solid #dbeafe; border-radius: 16px; padding: 20px; margin-bottom: 30px;">
    <p style="margin: 0; font-weight: 700; color: #1e40af;">Features at a Glance:</p>
    <ul style="margin: 8px 0 0 0; padding-left: 20px;">
      <li>Upload papers up to 25 MB securely</li>
      <li>Interact with papers using grounded RAG (Retrieval-Augmented Generation) QA</li>
      <li>Compare multiple documents for automated Literature Reviews</li>
      <li>Auto-compile flashcards and interactive multiple-choice quizzes</li>
      <li>Render LaTeX equations and map out key concepts in hierarchical mind maps</li>
    </ul>
  </div>

  <hr style="border: 0; height: 1px; background: #e2e8f0; margin: 40px 0;">

  <!-- ── SECTION 2 ───────────────────────────────────────────────────────── -->
  <h2 id="who-its-for" style="color: #d97706; font-size: 1.8rem; font-weight: 700; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; margin-bottom: 20px;">
    👥 Who It's For
  </h2>

  <p style="margin-bottom: 20px;">
    ResearchMind AI is optimized for diverse stakeholders within academic, institutional, and independent research environments:
  </p>

  <table style="border-collapse: collapse; width: 100%; text-align: left; margin-bottom: 30px; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
    <thead>
      <tr style="background-color: #4f46e5; color: white;">
        <th style="padding: 12px 16px; font-weight: 700; border: 1px solid #e2e8f0;">User Group</th>
        <th style="padding: 12px 16px; font-weight: 700; border: 1px solid #e2e8f0;">Primary Use Cases</th>
      </tr>
    </thead>
    <tbody>
      <tr style="background-color: #ffffff;">
        <td style="padding: 12px 16px; font-weight: 600; color: #1e1b4b; border: 1px solid #e2e8f0;">🎓 Students & Undergraduates</td>
        <td style="padding: 12px 16px; border: 1px solid #e2e8f0;">Auto-generated simple summaries, flashcards, and conceptual quizzes to grasp complex research quickly.</td>
      </tr>
      <tr style="background-color: #f8fafc;">
        <td style="padding: 12px 16px; font-weight: 600; color: #1e1b4b; border: 1px solid #e2e8f0;">🔬 PhD Candidates & Researchers</td>
        <td style="padding: 12px 16px; border: 1px solid #e2e8f0;">Detecting unexplored methodology gaps, tracking citations, creating literature review outlines, and rendering complex LaTeX formulas.</td>
      </tr>
      <tr style="background-color: #ffffff;">
        <td style="padding: 12px 16px; font-weight: 600; color: #1e1b4b; border: 1px solid #e2e8f0;">🏫 Academic Advisors & Institutions</td>
        <td style="padding: 12px 16px; border: 1px solid #e2e8f0;">Managing institutional libraries, tracing academic contributions, and deploying private RAG microservices.</td>
      </tr>
    </tbody>
  </table>

  <hr style="border: 0; height: 1px; background: #e2e8f0; margin: 40px 0;">

  <!-- ── SECTION 3 ───────────────────────────────────────────────────────── -->
  <h2 id="problems-solved" style="color: #dc2626; font-size: 1.8rem; font-weight: 700; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; margin-bottom: 20px;">
    ⚠️ What Problems It Solves
  </h2>

  <ol style="line-height: 2; margin-bottom: 30px; padding-left: 24px;">
    <li><b>Information Overload:</b> Researchers spend days reviewing hundreds of papers. The multi-agent pipeline extracts core claims and methodologies in under 30 seconds.</li>
    <li><b>LLM Hallucinations:</b> Naive chat models make up facts. The ChromaDB vector store forces the QA Agent to cite specific page sections, guaranteeing groundedness.</li>
    <li><b>Fragmented Workflows:</b> Users copy-paste text between PDF readers, word processors, flashcard apps, and citation managers. ResearchMind AI bundles these into a single workspace.</li>
    <li><b>Literature Review Fatigue:</b> Synthesizing comparative reviews across multiple papers is laborious. The Literature Review agent generates complete comparative drafts automatically.</li>
  </ol>

  <hr style="border: 0; height: 1px; background: #e2e8f0; margin: 40px 0;">

  <!-- ── SECTION 4: VISUAL DIAGRAMS (EXTERNAL IMAGE REFERENCES) ───────────── -->
  <h2 id="visual-diagrams" style="color: #0f172a; font-size: 1.8rem; font-weight: 700; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; margin-bottom: 20px;">
    🖼️ System Diagrams & Workflows
  </h2>

  <p style="margin-bottom: 25px;">
    The following vector diagrams outline the architectural models, entity frameworks, data flows, and interactive user journeys in ResearchMind AI:
  </p>

  <!-- 4.1 System Architecture Diagram -->
  <h3 style="color: #2563eb; font-size: 1.4rem; margin-bottom: 12px;">1. System Architecture Diagram</h3>
  <div style="text-align: center; margin-bottom: 35px;">
    <img src="./system_architecture.svg" alt="System Architecture Diagram" style="max-width: 100%; height: auto; border: 1px solid #e2e8f0; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);" />
    <p style="font-size: 0.85rem; color: #64748b; margin-top: 10px; margin-bottom: 0;">Figure 1: High-level architectural pipeline showcasing separate HTTP and LLM flows.</p>
  </div>

  <!-- 4.2 Entity Relationship (ER) Diagram -->
  <h3 style="color: #2563eb; font-size: 1.4rem; margin-bottom: 12px;">2. Entity Relationship (ER) Diagram</h3>
  <div style="text-align: center; margin-bottom: 35px;">
    <img src="./er_diagram.svg" alt="Entity Relationship Diagram" style="max-width: 100%; height: auto; border: 1px solid #e2e8f0; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);" />
    <p style="font-size: 0.85rem; color: #64748b; margin-top: 10px; margin-bottom: 0;">Figure 2: Mongoose database entity relationships mapping user libraries to agent findings.</p>
  </div>

  <!-- 4.3 Data Flow Diagram (DFD) -->
  <h3 style="color: #2563eb; font-size: 1.4rem; margin-bottom: 12px;">3. Data Flow Diagram (DFD)</h3>
  <div style="text-align: center; margin-bottom: 35px;">
    <img src="./data_flow.svg" alt="Data Flow Diagram" style="max-width: 100%; height: auto; border: 1px solid #e2e8f0; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);" />
    <p style="font-size: 0.85rem; color: #64748b; margin-top: 10px; margin-bottom: 0;">Figure 3: Data flow detailing document ingestion, temporary hosting, chunk storage, and LLM processing.</p>
  </div>

  <!-- 4.4 User Workflow Diagram -->
  <h3 style="color: #2563eb; font-size: 1.4rem; margin-bottom: 12px;">4. User Workflow Diagram</h3>
  <div style="text-align: center; margin-bottom: 35px;">
    <img src="./user_workflow.svg" alt="User Workflow Diagram" style="max-width: 100%; height: auto; border: 1px solid #e2e8f0; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);" />
    <p style="font-size: 0.85rem; color: #64748b; margin-top: 10px; margin-bottom: 0;">Figure 4: Core user flow from initial verification up to deep literature synthesis.</p>
  </div>

  <hr style="border: 0; height: 1px; background: #e2e8f0; margin: 40px 0;">

  <!-- ── HOW TO USE SECTION ────────────────────────────────────────────────── -->
  <h2 id="how-to-use" style="color: #4f46e5; font-size: 1.8rem; font-weight: 700; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; margin-bottom: 20px;">
    📖 How to Use the Project
  </h2>

  <p style="margin-bottom: 16px;">
    Follow this step-by-step guide to complete a full research synthesis lifecycle:
  </p>

  <ol style="line-height: 1.8; margin-bottom: 30px; padding-left: 24px;">
    <li style="margin-bottom: 15px;">
      <b>Create and Verify Your Account:</b>
      <br>Navigate to <code>/register</code>, enter your email and password, and complete verification using the 6-digit OTP code emailed to you.
    </li>
    <li style="margin-bottom: 15px;">
      <b>Upload Research Papers:</b>
      <br>Access <code>/upload</code>, drag-and-drop a PDF file (e.g. up to 25 MB), select descriptive tags, and click **Process Paper**. The server sends the PDF to the FastAPI agent.
    </li>
    <li style="margin-bottom: 15px;">
      <b>Monitor Analysis Status:</b>
      <br>On the dashboard, you will see a card with status <i>"processing"</i>. The agent extracts metadata, runs gap analysis, maps out formulas, and saves coordinates. Status changes to <i>"ready"</i> once complete.
    </li>
    <li style="margin-bottom: 15px;">
      <b>Deep Dive Into Paper Details:</b>
      <br>Click on a ready paper to open the workspace. Tabs let you browse:
      <ul style="padding-left: 20px; margin-top: 5px;">
        <li><b>Study Cards:</b> Self-test using 20 flashcards compiled by the educator agent.</li>
        <li><b>Equations:</b> View parsed LaTeX formulas rendering complex formulations.</li>
        <li><b>Grounded Chat:</b> Type questions. The agent retrieves context chunks and responds with exact source citations.</li>
      </ul>
    </li>
    <li>
      <b>Compile Literature Reviews:</b>
      <br>Select multiple papers in your library dashboard and click **Compile Literature Review** to generate comparative markdown papers.
    </li>
  </ol>

  <hr style="border: 0; height: 1px; background: #e2e8f0; margin: 40px 0;">

  <!-- ── PROJECT STRUCTURE SECTION ─────────────────────────────────────────── -->
  <h2 id="project-structure" style="color: #0f172a; font-size: 1.8rem; font-weight: 700; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; margin-bottom: 20px;">
    📂 Project Structure
  </h2>

  <pre style="background-color: #1e293b; border-radius: 12px; padding: 20px; overflow-x: auto; font-family: 'Consolas', 'Courier New', Courier, monospace; font-size: 0.85rem; color: #f8fafc; line-height: 1.5; margin-bottom: 30px;">
CBSOT-FINAL/
│
├── README.md               &larr; This file (highly detailed HTML documentation)
├── SETUP_INSTRUCTIONS.md   &larr; Step-by-step account configuration instructions
│
├── FRONTEND/               &larr; React client (Vite build)
│   ├── src/
│   │   ├── Components/     &larr; Component layers
│   │   │   ├── Common/     &larr; Navbar, ProtectedRoute, Toast
│   │   │   └── Paper/      &larr; PaperCard
│   │   ├── Pages/          &larr; 11 Full-page views
│   │   │   ├── LandingPage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   ├── OTPPage.jsx
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── UploadPage.jsx
│   │   │   ├── PaperDetailPage.jsx
│   │   │   └── AboutPage.jsx
│   │   ├── Context/        &larr; AuthContext
│   │   ├── Hooks/          &larr; useAuth, usePaper, useUpload
│   │   ├── Utils/          &larr; API client configurations
│   │   ├── App.jsx         &larr; Router & Route Guard configuration
│   │   ├── index.css       &larr; Responsive keyframes and layout utilities
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
├── BACKEND/                &larr; Node Express API Server
│   ├── app.js              &larr; CORS, Helmet, rate-limiter, routing mounts
│   ├── index.js            &larr; Express port server listener
│   ├── config/             &larr; db, cloudinary
│   ├── controllers/        &larr; authController, paperController
│   ├── middleware/         &larr; authMiddleware, errorMiddleware, uploadMiddleware
│   ├── models/             &larr; User, Paper, AgentOutput, Notification, ActivityLog
│   ├── routes/             &larr; authRoutes, paperRoutes
│   ├── utils/              &larr; aiServiceClient helper
│   └── package.json
│
└── AI-AGENT/               &larr; Python FastAPI AI microservice
    ├── main.py             &larr; Server startup & model eager-loading
    ├── api/                &larr; paper_routes (process, agent-task, query)
    ├── graph/              &larr; graph_builder, graph_state definitions
    ├── agents/             &larr; 17 specialized agent files
    ├── services/           &larr; groq_service, pdf_service
    ├── rag/                &larr; chunker, cleaner, pipeline
    ├── vector_db/          &larr; chroma_client, collection_manager
    ├── embeddings/         &larr; model_loader (MiniLM sentence transformer)
    ├── logs/               &larr; FastAPI system log outputs
    └── requirements.txt
  </pre>

  <hr style="border: 0; height: 1px; background: #e2e8f0; margin: 40px 0;">

  <!-- ── TECH STACK SECTION ───────────────────────────────────────────────── -->
  <h2 id="tech-stack" style="color: #2563eb; font-size: 1.8rem; font-weight: 700; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; margin-bottom: 20px;">
    💻 Tech Stack
  </h2>

  <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin-bottom: 30px;">
    
    <div style="border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; background-color: #ffffff;">
      <h3 style="color: #4f46e5; margin-top: 0;">🎨 Frontend</h3>
      <ul style="padding-left: 20px;">
        <li><b>React 18.2:</b> Client UI rendering</li>
        <li><b>Vite 5.0:</b> Hot-reload compiler</li>
        <li><b>Tailwind CSS 4.0:</b> Utility layout styles</li>
        <li><b>Framer Motion:</b> Fluid page animations</li>
        <li><b>Axios:</b> Backend REST interaction</li>
        <li><b>React Hook Form:</b> Form control</li>
      </ul>
    </div>

    <div style="border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; background-color: #ffffff;">
      <h3 style="color: #059669; margin-top: 0;">⚙️ Backend</h3>
      <ul style="padding-left: 20px;">
        <li><b>Node.js:</b> Server runtime</li>
        <li><b>Express 4.18:</b> Web REST controllers</li>
        <li><b>MongoDB Atlas:</b> Production DB cluster</li>
        <li><b>Mongoose 8.0:</b> NoSQL schema ODM</li>
        <li><b>JSON Web Tokens:</b> Secure session tokens</li>
        <li><b>Cloudinary:</b> Raw PDF hosting</li>
        <li><b>Nodemailer:</b> System notification emails</li>
      </ul>
    </div>

    <div style="border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; background-color: #ffffff;">
      <h3 style="color: #7c3aed; margin-top: 0;">🤖 AI Service</h3>
      <ul style="padding-left: 20px;">
        <li><b>FastAPI:</b> Asynchronous microservice</li>
        <li><b>LangGraph:</b> Multi-agent orchestration</li>
        <li><b>Groq SDK:</b> Llama-3.3-70b-versatile engine</li>
        <li><b>ChromaDB:</b> Vector embedding repository</li>
        <li><b>Sentence Transformers:</b> MiniLM-L6 embeddings</li>
        <li><b>PyMuPDF & pdfplumber:</b> PDF text extraction</li>
      </ul>
    </div>

  </div>

  <hr style="border: 0; height: 1px; background: #e2e8f0; margin: 40px 0;">

  <!-- ── LOCAL SETUP SECTION ──────────────────────────────────────────────── -->
  <h2 id="local-setup" style="color: #059669; font-size: 1.8rem; font-weight: 700; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; margin-bottom: 20px;">
    ⚙️ How to Run the Project Locally
  </h2>

  <p style="margin-bottom: 20px;">
    Follow this order to run all services locally (Backend, AI microservice, and Frontend):
  </p>

  <h3 style="color: #1e3a8a; font-size: 1.3rem;">Step 1: MongoDB & Cloudinary Accounts</h3>
  <p style="margin-bottom: 20px;">
    Set up database clusters on MongoDB Atlas and file hosting on Cloudinary. Refer to <a href="file:///c:/Users/amang/Desktop/CBSOT-FINAL/SETUP_INSTRUCTIONS.md">SETUP_INSTRUCTIONS.md</a> for credentials retrieval steps.
  </p>

  <h3 style="color: #1e3a8a; font-size: 1.3rem;">Step 2: Configure Environment Files</h3>
  <p style="margin-bottom: 20px;">
    Create <code>.env</code> files inside each subdirectory. Refer to the next section for variable names.
  </p>

  <h3 style="color: #1e3a8a; font-size: 1.3rem;">Step 3: Launch AI Agent microservice</h3>
  <pre style="background-color: #f1f5f9; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; font-family: monospace; font-size: 0.9rem; color: #0f172a; margin-bottom: 20px;">
cd AI-AGENT
python -m venv venv
venv\Scripts\activate   # On Windows
pip install -r requirements.txt
python main.py
  </pre>
  <p style="margin-bottom: 20px;">
    FastAPI will start listening at <b>http://localhost:8080</b>.
  </p>

  <h3 style="color: #1e3a8a; font-size: 1.3rem;">Step 4: Start Express Backend</h3>
  <pre style="background-color: #f1f5f9; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; font-family: monospace; font-size: 0.9rem; color: #0f172a; margin-bottom: 20px;">
cd BACKEND
npm install
npm run dev
  </pre>
  <p style="margin-bottom: 20px;">
    Express Backend will start at <b>http://localhost:5000</b>.
  </p>

  <h3 style="color: #1e3a8a; font-size: 1.3rem;">Step 5: Start React Frontend</h3>
  <pre style="background-color: #f1f5f9; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; font-family: monospace; font-size: 0.9rem; color: #0f172a; margin-bottom: 20px;">
cd FRONTEND
npm install
npm run dev
  </pre>
  <p style="margin-bottom: 20px;">
    React app runs at <b>http://localhost:5173</b>.
  </p>

  <hr style="border: 0; height: 1px; background: #e2e8f0; margin: 40px 0;">

  <!-- ── ENVIRONMENT VARIABLES SECTION ─────────────────────────────────────── -->
  <h2 id="environment-variables" style="color: #b45309; font-size: 1.8rem; font-weight: 700; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; margin-bottom: 20px;">
    🔑 Environment Templates
  </h2>

  <p style="margin-bottom: 20px;">
    Copy the following configurations into files named <code>.env</code> in the respective directories:
  </p>

  <h3 style="color: #1e3a8a; font-size: 1.3rem; margin-bottom: 12px;">1. Backend Environment Template (<code>BACKEND/.env</code>)</h3>
  <pre style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; overflow-x: auto; font-family: monospace; font-size: 0.85rem; color: #334155; line-height: 1.5; margin-bottom: 30px;">
PORT=5000
NODE_ENV=development

# MongoDB Atlas Database
MONGODB_URI=mongodb+srv://&lt;username&gt;:&lt;password&gt;@cluster0.xxxxx.mongodb.net/researchmind?retryWrites=true&amp;w=majority

# JWT Token Configurations
JWT_SECRET=your_long_64_character_hexadecimal_signing_secret_key_string
JWT_EXPIRES_IN=7d
BCRYPT_SALT_ROUNDS=12

# Cloudinary credentials
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Nodemailer SMTP setup (Gmail App Password)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=youremail@gmail.com
SMTP_PASS=your_16_character_google_app_password
EMAIL_FROM="ResearchMind AI &lt;youremail@gmail.com&gt;"

# FastAPI Agent Communication
AI_SERVICE_URL=http://localhost:8080
AI_SERVICE_API_KEY=your_random_32_character_internal_communication_api_key
FRONTEND_URL=http://localhost:5173
ALLOW_TEST_OTP=true
  </pre>

  <h3 style="color: #1e3a8a; font-size: 1.3rem; margin-bottom: 12px;">2. AI Agent Environment Template (<code>AI-AGENT/.env</code>)</h3>
  <pre style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; overflow-x: auto; font-family: monospace; font-size: 0.85rem; color: #334155; line-height: 1.5; margin-bottom: 30px;">
GROQ_API_KEY=gsk_your_groq_developer_api_auth_key_string
GROQ_MODEL=llama-3.3-70b-versatile
GROQ_MAX_OUTPUT_TOKENS=4096
GROQ_TEMPERATURE=0.3

# Mock Mode Configuration
USE_MOCK_GROQ=false

# Vector DB persist directory
CHROMA_HOST=localhost
CHROMA_PORT=8000
CHROMA_PERSIST_DIRECTORY=./chroma_db

# Sentence Transformer embeddings configuration
EMBEDDING_MODEL=sentence-transformers/all-MiniLM-L6-v2
EMBEDDING_BATCH_SIZE=32

# Port mapping
FASTAPI_PORT=8080
INTERNAL_API_KEY=your_random_32_character_internal_communication_api_key
BACKEND_URL=http://localhost:5000
LOG_LEVEL=INFO
LOG_FILE=logs/app.log
  </pre>

  <h3 style="color: #1e3a8a; font-size: 1.3rem; margin-bottom: 12px;">3. Frontend Environment Template (<code>FRONTEND/.env</code>)</h3>
  <pre style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; overflow-x: auto; font-family: monospace; font-size: 0.85rem; color: #334155; line-height: 1.5; margin-bottom: 30px;">
VITE_API_BASE_URL=http://localhost:5000/api
VITE_APP_NAME="ResearchMind AI"
VITE_MAX_UPLOAD_SIZE_MB=25
  </pre>

  <hr style="border: 0; height: 1px; background: #e2e8f0; margin: 40px 0;">

  <!-- ── ALL API ROUTES SUMMARY SECTION ────────────────────────────────────── -->
  <h2 id="api-endpoints" style="color: #1d4ed8; font-size: 1.8rem; font-weight: 700; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; margin-bottom: 20px;">
    🌐 All API Routes Summary
  </h2>

  <h3 style="color: #1e3a8a; font-size: 1.3rem; margin-bottom: 12px;">Express Backend Endpoints</h3>
  <table style="border-collapse: collapse; width: 100%; text-align: left; margin-bottom: 30px;">
    <thead>
      <tr style="background-color: #f1f5f9;">
        <th style="padding: 10px; border: 1px solid #cbd5e1; font-weight: 700; width: 15%;">Method</th>
        <th style="padding: 10px; border: 1px solid #cbd5e1; font-weight: 700; width: 40%;">Route Path</th>
        <th style="padding: 10px; border: 1px solid #cbd5e1; font-weight: 700;">Description</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td style="padding: 10px; border: 1px solid #cbd5e1; font-family: monospace; color: #2563eb; font-weight: 600;">POST</td>
        <td style="padding: 10px; border: 1px solid #cbd5e1; font-family: monospace;">/api/auth/register</td>
        <td style="padding: 10px; border: 1px solid #cbd5e1;">Registers a new user, hashes password, emails OTP code</td>
      </tr>
      <tr>
        <td style="padding: 10px; border: 1px solid #cbd5e1; font-family: monospace; color: #2563eb; font-weight: 600;">POST</td>
        <td style="padding: 10px; border: 1px solid #cbd5e1; font-family: monospace;">/api/auth/verify-otp</td>
        <td style="padding: 10px; border: 1px solid #cbd5e1;">Verifies registration OTP to unlock user login permissions</td>
      </tr>
      <tr>
        <td style="padding: 10px; border: 1px solid #cbd5e1; font-family: monospace; color: #2563eb; font-weight: 600;">POST</td>
        <td style="padding: 10px; border: 1px solid #cbd5e1; font-family: monospace;">/api/auth/login</td>
        <td style="padding: 10px; border: 1px solid #cbd5e1;">Authenticates credentials, returns signed JWT access token</td>
      </tr>
      <tr>
        <td style="padding: 10px; border: 1px solid #cbd5e1; font-family: monospace; color: #2563eb; font-weight: 600;">POST</td>
        <td style="padding: 10px; border: 1px solid #cbd5e1; font-family: monospace;">/api/auth/forgot-password</td>
        <td style="padding: 10px; border: 1px solid #cbd5e1;">Sends a secure reset password OTP verification to email</td>
      </tr>
      <tr>
        <td style="padding: 10px; border: 1px solid #cbd5e1; font-family: monospace; color: #2563eb; font-weight: 600;">POST</td>
        <td style="padding: 10px; border: 1px solid #cbd5e1; font-family: monospace;">/api/auth/reset-password</td>
        <td style="padding: 10px; border: 1px solid #cbd5e1;">Resets user password given a valid OTP authorization token</td>
      </tr>
      <tr>
        <td style="padding: 10px; border: 1px solid #cbd5e1; font-family: monospace; color: #059669; font-weight: 600;">POST</td>
        <td style="padding: 10px; border: 1px solid #cbd5e1; font-family: monospace;">/api/papers/upload</td>
        <td style="padding: 10px; border: 1px solid #cbd5e1;">Accepts PDF multipart upload, commits to Cloudinary, sends async process job to FastAPI</td>
      </tr>
      <tr>
        <td style="padding: 10px; border: 1px solid #cbd5e1; font-family: monospace; color: #ea580c; font-weight: 600;">GET</td>
        <td style="padding: 10px; border: 1px solid #cbd5e1; font-family: monospace;">/api/papers/</td>
        <td style="padding: 10px; border: 1px solid #cbd5e1;">Fetches all papers for active authenticated user with paginated details</td>
      </tr>
      <tr>
        <td style="padding: 10px; border: 1px solid #cbd5e1; font-family: monospace; color: #ea580c; font-weight: 600;">GET</td>
        <td style="padding: 10px; border: 1px solid #cbd5e1; font-family: monospace;">/api/papers/:id/agent-outputs</td>
        <td style="padding: 10px; border: 1px solid #cbd5e1;">Loads structured results generated by the 17 AI agents for detail rendering</td>
      </tr>
      <tr>
        <td style="padding: 10px; border: 1px solid #cbd5e1; font-family: monospace; color: #2563eb; font-weight: 600;">POST</td>
        <td style="padding: 10px; border: 1px solid #cbd5e1; font-family: monospace;">/api/papers/:id/agent-task</td>
        <td style="padding: 10px; border: 1px solid #cbd5e1;">Triggers manual agent runs or multi-paper comparative literature reviews</td>
      </tr>
      <tr>
        <td style="padding: 10px; border: 1px solid #cbd5e1; font-family: monospace; color: #ea580c; font-weight: 600;">GET</td>
        <td style="padding: 10px; border: 1px solid #cbd5e1; font-family: monospace;">/api/papers/:id/query</td>
        <td style="padding: 10px; border: 1px solid #cbd5e1;">Submits user queries to RAG agent to obtain a cited, page-anchored response</td>
      </tr>
      <tr>
        <td style="padding: 10px; border: 1px solid #cbd5e1; font-family: monospace; color: #2563eb; font-weight: 600;">POST</td>
        <td style="padding: 10px; border: 1px solid #cbd5e1; font-family: monospace;">/api/papers/status-callback</td>
        <td style="padding: 10px; border: 1px solid #cbd5e1;">Webhook endpoint securing FastAPI job completion callbacks</td>
      </tr>
    </tbody>
  </table>

  <h3 style="color: #1e3a8a; font-size: 1.3rem; margin-bottom: 12px;">FastAPI Microservice Endpoints</h3>
  <table style="border-collapse: collapse; width: 100%; text-align: left; margin-bottom: 30px;">
    <thead>
      <tr style="background-color: #f1f5f9;">
        <th style="padding: 10px; border: 1px solid #cbd5e1; font-weight: 700; width: 15%;">Method</th>
        <th style="padding: 10px; border: 1px solid #cbd5e1; font-weight: 700; width: 40%;">Route Path</th>
        <th style="padding: 10px; border: 1px solid #cbd5e1; font-weight: 700;">Description</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td style="padding: 10px; border: 1px solid #cbd5e1; font-family: monospace; color: #2563eb; font-weight: 600;">POST</td>
        <td style="padding: 10px; border: 1px solid #cbd5e1; font-family: monospace;">/api/papers/process-paper</td>
        <td style="padding: 10px; border: 1px solid #cbd5e1;">Accepts payload details, downloads PDF raw buffer, runs LangGraph pipeline as async task</td>
      </tr>
      <tr>
        <td style="padding: 10px; border: 1px solid #cbd5e1; font-family: monospace; color: #2563eb; font-weight: 600;">POST</td>
        <td style="padding: 10px; border: 1px solid #cbd5e1; font-family: monospace;">/api/papers/agent-task</td>
        <td style="padding: 10px; border: 1px solid #cbd5e1;">Triggers comparative synthesis review or on-demand regeneration of single modules</td>
      </tr>
      <tr>
        <td style="padding: 10px; border: 1px solid #cbd5e1; font-family: monospace; color: #ea580c; font-weight: 600;">GET</td>
        <td style="padding: 10px; border: 1px solid #cbd5e1; font-family: monospace;">/api/papers/{paper_id}/query</td>
        <td style="padding: 10px; border: 1px solid #cbd5e1;">Executes semantic query matching against ChromaDB vector index, feeding context to Groq</td>
      </tr>
    </tbody>
  </table>

  <hr style="border: 0; height: 1px; background: #e2e8f0; margin: 40px 0;">

  <!-- ── SECURITY SECTION ─────────────────────────────────────────────────── -->
  <h2 id="security-groundedness" style="color: #b91c1c; font-size: 1.8rem; font-weight: 700; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; margin-bottom: 20px;">
    🔒 Security & Groundedness Implementation
  </h2>

  <div style="background-color: #fdf2f2; border: 1px solid #fca5a5; border-radius: 12px; padding: 20px; margin-bottom: 30px;">
    <h3 style="color: #991b1b; font-size: 1.3rem; margin-top: 0; margin-bottom: 12px;">Core Security Safeguards</h3>
    <ul style="padding-left: 20px; margin-bottom: 0; line-height: 1.8;">
      <li><b>Content Security Policy (CSP):</b> Express Helmet config blocks iframe embedding, sets strict Content-Security-Policy rules, and limits script resources to 'self'.</li>
      <li><b>Double-Sided Token Authentication:</b> Communication between Node Express and Python FastAPI is secured via an asymmetric key handshake using `X-API-Key`. Mismatch calls are immediately blocked.</li>
      <li><b>IP-Based Rate Limiting:</b> express-rate-limit enforces a global limit of 200 requests per 15 minutes per IP to prevent DDoS and API scraping.</li>
      <li><b>Factual Grounding:</b> No hallucination rule. The vector database parses PDF sentences into chunk nodes. Retrieval is bounded by cosine similarity. In case of zero similarity, agents output a clean fallback payload rather than guess information.</li>
    </ul>
  </div>

  <hr style="border: 0; height: 1px; background: #e2e8f0; margin: 40px 0;">

  <!-- ── DEPENDENCIES SECTION ─────────────────────────────────────────────── -->
  <h2 id="dependencies" style="color: #4f46e5; font-size: 1.8rem; font-weight: 700; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; margin-bottom: 20px;">
    📦 Package Dependencies
  </h2>

  <h3 style="color: #1e3a8a; font-size: 1.3rem; margin-bottom: 12px;">React Frontend Dependencies</h3>
  <table style="border-collapse: collapse; width: 100%; text-align: left; margin-bottom: 30px;">
    <thead>
      <tr style="background-color: #f1f5f9;">
        <th style="padding: 10px; border: 1px solid #cbd5e1; font-weight: 700; width: 30%;">Package</th>
        <th style="padding: 10px; border: 1px solid #cbd5e1; font-weight: 700; width: 20%;">Version</th>
        <th style="padding: 10px; border: 1px solid #cbd5e1; font-weight: 700;">Usage</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td style="padding: 10px; border: 1px solid #cbd5e1; font-family: monospace;">react</td>
        <td style="padding: 10px; border: 1px solid #cbd5e1; font-family: monospace;">^18.2.0</td>
        <td style="padding: 10px; border: 1px solid #cbd5e1;">Base component framework</td>
      </tr>
      <tr>
        <td style="padding: 10px; border: 1px solid #cbd5e1; font-family: monospace;">react-router-dom</td>
        <td style="padding: 10px; border: 1px solid #cbd5e1; font-family: monospace;">^6.20.0</td>
        <td style="padding: 10px; border: 1px solid #cbd5e1;">Dynamic routes and authentication guards</td>
      </tr>
      <tr>
        <td style="padding: 10px; border: 1px solid #cbd5e1; font-family: monospace;">framer-motion</td>
        <td style="padding: 10px; border: 1px solid #cbd5e1; font-family: monospace;">^10.16.0</td>
        <td style="padding: 10px; border: 1px solid #cbd5e1;">Interactive slide effects and animations</td>
      </tr>
      <tr>
        <td style="padding: 10px; border: 1px solid #cbd5e1; font-family: monospace;">react-icons</td>
        <td style="padding: 10px; border: 1px solid #cbd5e1; font-family: monospace;">^4.12.0</td>
        <td style="padding: 10px; border: 1px solid #cbd5e1;">Lucide and Feather icon packages</td>
      </tr>
      <tr>
        <td style="padding: 10px; border: 1px solid #cbd5e1; font-family: monospace;">axios</td>
        <td style="padding: 10px; border: 1px solid #cbd5e1; font-family: monospace;">^1.6.0</td>
        <td style="padding: 10px; border: 1px solid #cbd5e1;">REST request client</td>
      </tr>
    </tbody>
  </table>

  <h3 style="color: #1e3a8a; font-size: 1.3rem; margin-bottom: 12px;">Express Backend Dependencies</h3>
  <table style="border-collapse: collapse; width: 100%; text-align: left; margin-bottom: 30px;">
    <thead>
      <tr style="background-color: #f1f5f9;">
        <th style="padding: 10px; border: 1px solid #cbd5e1; font-weight: 700; width: 30%;">Package</th>
        <th style="padding: 10px; border: 1px solid #cbd5e1; font-weight: 700; width: 20%;">Version</th>
        <th style="padding: 10px; border: 1px solid #cbd5e1; font-weight: 700;">Usage</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td style="padding: 10px; border: 1px solid #cbd5e1; font-family: monospace;">express</td>
        <td style="padding: 10px; border: 1px solid #cbd5e1; font-family: monospace;">^4.18.2</td>
        <td style="padding: 10px; border: 1px solid #cbd5e1;">HTTP routing and server control</td>
      </tr>
      <tr>
        <td style="padding: 10px; border: 1px solid #cbd5e1; font-family: monospace;">mongoose</td>
        <td style="padding: 10px; border: 1px solid #cbd5e1; font-family: monospace;">^8.0.0</td>
        <td style="padding: 10px; border: 1px solid #cbd5e1;">NoSQL database communication layer</td>
      </tr>
      <tr>
        <td style="padding: 10px; border: 1px solid #cbd5e1; font-family: monospace;">jsonwebtoken</td>
        <td style="padding: 10px; border: 1px solid #cbd5e1; font-family: monospace;">^9.0.0</td>
        <td style="padding: 10px; border: 1px solid #cbd5e1;">Access control token signature verification</td>
      </tr>
      <tr>
        <td style="padding: 10px; border: 1px solid #cbd5e1; font-family: monospace;">cloudinary</td>
        <td style="padding: 10px; border: 1px solid #cbd5e1; font-family: monospace;">^2.0.0</td>
        <td style="padding: 10px; border: 1px solid #cbd5e1;">File uploads management and retrieval</td>
      </tr>
      <tr>
        <td style="padding: 10px; border: 1px solid #cbd5e1; font-family: monospace;">helmet</td>
        <td style="padding: 10px; border: 1px solid #cbd5e1; font-family: monospace;">^7.1.0</td>
        <td style="padding: 10px; border: 1px solid #cbd5e1;">Response headers protection and CSP config</td>
      </tr>
    </tbody>
  </table>

  <hr style="border: 0; height: 1px; background: #e2e8f0; margin: 40px 0;">

  <p style="text-align: center; color: #94a3b8; font-size: 0.85rem; margin-top: 50px;">
    ResearchMind AI OS &bull; Deployed securely with end-to-end encrypted node callbacks &bull; 2026.
  </p>

</div>
