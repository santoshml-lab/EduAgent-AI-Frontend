EduAgent AI

Agentic AI Learning Assistant for Smarter, Personalized Education

EduAgent AI is an Agentic AI-powered education platform designed to help learners learn, search, calculate, practice, analyze weaknesses, and plan their studies through an intelligent tool-using workflow.

Unlike a traditional chatbot that simply generates an answer, EduAgent AI follows an agentic pipeline:

«User Query → Agent Planner → Tool Selection → Execution → Validation → Recovery → Final Response»

The goal is to make AI-powered education more personalized, transparent, reliable, and actionable.

---

🚀 Live Demo

Frontend

Vercel:
https://edu-agent-ai-frontend.vercel.app/

Backend

Render:
https://eduagent-ai-osvz.onrender.com/

GitHub

Repository:
https://github.com/santoshml-lab/EduAgent-AI-Frontend

---

🎯 Problem

Modern learners often use multiple disconnected tools for learning:

- Chatbots for explanations
- Search engines for current information
- Calculators for numerical problems
- Quiz platforms for practice
- Spreadsheets for performance tracking
- Study planners for revision

This creates a fragmented learning experience.

EduAgent AI addresses this by bringing these workflows together into one intelligent agent.

Ask a question
      ↓
AI understands the task
      ↓
Plans the required action
      ↓
Selects the appropriate tool
      ↓
Executes the task
      ↓
Validates the result
      ↓
Creates an actionable response

---

🧠 Agentic AI Architecture

                    ┌────────────────────┐
                    │     USER QUERY     │
                    └─────────┬──────────┘
                              ↓
                    ┌────────────────────┐
                    │   AGENT PLANNER    │
                    └─────────┬──────────┘
                              ↓
                    ┌────────────────────┐
                    │   TOOL SELECTION   │
                    └─────────┬──────────┘
                              ↓
          ┌───────────────────┼───────────────────┐
          ↓                   ↓                   ↓
     Calculator           SerpApi             Education
      /Recovery           Search               Tools
          │                   │                   │
          └───────────────────┼───────────────────┘
                              ↓
                    ┌────────────────────┐
                    │  RESULT VALIDATOR  │
                    └─────────┬──────────┘
                              ↓
                       ┌─────────────┐
                       │   RESULT    │
                       │  ACCEPTED   │
                       └──────┬──────┘
                              ↓
                    ┌────────────────────┐
                    │  FINAL RESPONSE    │
                    └────────────────────┘

Recovery Path

When validation rejects a tool result:

Tool Execution
      ↓
Validation
      ↓
Rejected
      ↓
Recovery / Retry
      ↓
Validation
      ↓
Final Response

This gives EduAgent AI a fault-aware agent workflow rather than a simple request-response architecture.

---

✨ Key Features

1. AI Learning Assistant

Learners can ask educational questions using natural language.

Example:

Explain Newton's laws with simple examples for a Class 10 student.

The agent generates a learner-friendly response according to the requested context.

---

2. Intelligent Calculator

EduAgent AI can recognize calculation-based requests and route them to a calculator tool.

Example:

Calculate 125 × 48.

Result:

6000

The workflow can also expose recovery when an initial calculation attempt requires another execution.

Agent Planner
      ↓
Calculator
      ↓
Calculator Recovery
      ↓
Result Validator
      ↓
Final Response

---

3. Live Web Search with SerpApi

For current or web-dependent information, EduAgent AI can use SerpApi-powered web search.

Example:

Search the web for the latest AI developments in education in 2026
and give me 3 important findings with their sources.

The system can return:

- Important findings
- Source titles
- Source URLs
- Search-based information

Example workflow:

Agent Planner
      ↓
SerpApi · Web Search
      ↓
Result Validation
      ↓
Sources
      ↓
Final Response

---

4. Interactive Quiz Generator

EduAgent AI can generate quizzes for educational topics.

Example:

Give me a 5-question Physics quiz on Force.

The frontend supports an interactive quiz experience with:

- Multiple-choice questions
- Answer selection
- Immediate feedback
- Score calculation
- Quiz completion
- Restart functionality

---

5. Weak Topic Detection

EduAgent AI can analyze academic scores and identify topics requiring more attention.

Example:

My Physics scores are:

Force: 45%
Work Energy: 55%
Light: 90%

Find my weak topics.

The agent can identify:

Force        → Weak
Work Energy  → Weak
Light        → Strong

This transforms raw marks into useful learning insights.

---

6. Personalized Study Planner

After identifying weak topics, EduAgent AI can generate a structured revision plan.

Example:

Create a 7-day revision plan with 2 hours per day.

Example output:

Day| Topic| Activity| Hours
1| Force| Revision + practice questions| 2.0
2| Work Energy| Revision + practice questions| 2.0
3| Force| Practice + error review| 2.0
4| Work Energy| Practice + error review| 2.0
5| Force| Revision + mixed practice| 2.0
6| Work Energy| Revision + mixed practice| 2.0
7| Force| Mixed practice + self-assessment| 2.0

The workflow becomes:

Student Scores
      ↓
Weak Topic Detection
      ↓
Study Plan Generation
      ↓
Validation
      ↓
Personalized Revision Plan

---

🛡️ Result Validation

Validation is a core part of the agent architecture.

Instead of directly displaying every tool result:

Tool
 ↓
Answer

EduAgent AI uses:

Tool
 ↓
Result Validator
 ↓
Validated Result
 ↓
Final Response

If a result is rejected, the system can trigger a recovery path.

This improves the reliability and transparency of the agent workflow.

---

🔄 Tool Recovery

EduAgent AI exposes recovery paths for supported tools.

Examples:

Calculator
      ↓
Calculator Recovery

and:

SerpApi · Web Search
      ↓
SerpApi · Web Search Recovery

The frontend displays these steps under Agent Workflow, allowing users and judges to understand how the agent handled the request.

---

👁️ Under the Hood — Agent Workflow

The dashboard visually represents the agent's execution.

Workflow Nodes

1. User
2. Agent Planner
3. Tool Execution
4. Result Validation
5. Final Response

During execution, nodes display states such as:

Received
Planning...
Executing...
Checking result...
Validated ✓
Completed ✓

This makes the system's reasoning workflow more transparent without exposing private chain-of-thought.

---

🎓 Education Use Cases

Learners

- Concept explanations
- Homework support
- Numerical problem solving
- Current-information search
- Quiz practice
- Weak-topic detection
- Personalized revision plans

Teachers

- Quiz generation
- Learning activity creation
- Topic explanations
- Revision planning
- Educational research support

EdTech Platforms

- AI tutoring
- Adaptive learning
- Automated assessment
- Personalized revision
- Learning analytics

---

🏗️ Technology Stack

Frontend

- HTML5
- CSS3
- JavaScript
- Responsive UI
- Interactive quiz engine
- Agent workflow visualization
- Markdown/table rendering

Backend

- Python
- FastAPI
- Agent orchestration
- Groq LLM
- Tool execution
- Validation and recovery

External Services

- SerpApi — Web Search
- Groq — LLM inference

Deployment

- Vercel — Frontend
- Render — Backend
- GitHub — Source Control

---

📁 Project Structure

EduAgent-AI-Frontend/
│
├── index.html
├── style.css
├── script.js
└── README.md

"index.html"

Contains:

- EduAgent dashboard
- AI Assistant interface
- Agent Workflow
- Response panel
- Sources section
- Demo prompts
- Capability cards

"style.css"

Handles:

- Dark AI dashboard
- Responsive design
- Workflow animations
- Loading states
- Error states
- Source cards
- Markdown tables
- Interactive quiz styling
- Mobile layout

"script.js"

Handles:

- Backend API communication
- Session management
- Agent workflow visualization
- Tool trace processing
- Source rendering
- Markdown formatting
- Table rendering
- Interactive quizzes
- Quiz scoring
- Error handling

---

🔐 Session Management

EduAgent AI maintains a browser-side session ID using "localStorage".

User
 ↓
Session ID
 ↓
Backend
 ↓
Agent Context
 ↓
Response

This allows the application to maintain a consistent conversation session across requests.

---

🧪 Testing & Validation

The frontend and agent workflow have been tested using practical education scenarios.

Test 1 — Calculator

Input

Calculate 125 × 48.

Expected Result

6000

Workflow

Agent Planner
      ↓
Calculator
      ↓
Calculator Recovery
      ↓
Result Validator
      ↓
Final Response

Status: PASS

---

Test 2 — SerpApi Web Search

Input

Search the web for the latest AI developments in education in 2026
and give me 3 important findings with their sources.

Verified Components

- Agent Planner
- SerpApi Web Search
- Search result sources
- Source rendering
- Final response

Example Sources

- UNESCO — Artificial intelligence in education
- Digital Education Council — AI in Higher Education Global Survey 2026
- EngageLi — AI in Education Statistics

Status: PASS

---

Test 3 — Weak Topic Detection + Study Planner

Input

My Physics scores are:

Force 45%
Work Energy 55%
Light 90%

Find my weak topics and create a 7-day revision plan
with 2 hours per day.

Verified Output

- Weak-topic identification
- Personalized revision plan
- 7-day schedule
- 2-hour daily allocation
- Structured Markdown table

Status: PASS

---

🏆 Competition Highlights

EduAgent AI demonstrates several important concepts relevant to modern Agentic AI systems:

🤖 Agent Planning

The system determines what action is required instead of treating every request identically.

🔧 Tool Use

Different tasks can be routed to different tools.

🌐 Web-Augmented Intelligence

SerpApi provides access to current web information.

🧮 Deterministic Computation

Calculation tasks can be delegated to a calculator tool.

🛡️ Validation

Tool outputs pass through a validation stage.

🔄 Recovery

Failed or rejected tool executions can trigger recovery paths.

🎓 Personalized Learning

Student performance can be converted into weak-topic insights and revision plans.

👁️ Transparent Execution

The dashboard exposes the high-level agent workflow to users and judges.

---

💡 Why It Is Agentic

A traditional chatbot can be represented as:

Question
   ↓
LLM
   ↓
Answer

EduAgent AI follows a more structured process:

Question
   ↓
Understand
   ↓
Plan
   ↓
Select Tool
   ↓
Execute
   ↓
Validate
   ↓
Recover if Required
   ↓
Respond

The key idea is that the AI decides how to solve the task, rather than simply generating one direct response.

---

🔮 Future Scope

Future versions can extend EduAgent AI with:

- RAG-based textbook learning
- PDF and document understanding
- Student knowledge graphs
- Adaptive difficulty
- Long-term learner profiles
- Automatic mistake analysis
- Voice-based tutoring
- Multilingual education
- Teacher dashboards
- Learning analytics
- AI-generated lesson plans
- Personalized curriculum pathways
- Multi-agent collaboration

---

🌍 Vision

The long-term vision is to evolve EduAgent AI into an AI Learning Operating System.

             ASK
              ↓
            LEARN
              ↓
           PRACTICE
              ↓
          GET EVALUATED
              ↓
       IDENTIFY WEAKNESS
              ↓
            REVISE
              ↓
           IMPROVE

Instead of requiring learners to switch between multiple educational tools, EduAgent AI aims to provide a unified intelligent learning environment.

---

🚀 Demo Flow

For a competition presentation, the recommended flow is:

1. AI Assistant

Show a normal educational question.

2. Calculator

Demonstrate a numerical task and show the tool workflow.

3. Web Search

Use a current education/AI query and show SerpApi sources.

4. Quiz Generator

Generate an interactive Physics quiz.

5. Personalized Learning

Provide student scores and generate:

Weak Topics → Revision Plan

6. Under the Hood

Highlight:

Planner → Tools → Validation → Recovery → Final Response

---

📌 Project Information

Project: EduAgent AI
Category: Agentic AI / EdTech
Focus: Personalized AI-powered Learning
Frontend: HTML, CSS, JavaScript
Backend: FastAPI + Groq
Search: SerpApi
Frontend Deployment: Vercel
Backend Deployment: Render

---

👨‍💻 Built For

An education-focused Agentic AI competition project demonstrating practical AI orchestration, tool usage, validation, recovery, and personalized learning workflows.

---

⭐ Final Takeaway

«EduAgent AI is not just an AI chatbot.»

It is designed as an agentic learning system that can:

Plan → Use Tools → Validate → Recover → Respond → Personalize Learning

The project brings together AI agents, web search, deterministic tools, interactive assessment, performance analysis, and personalized study planning into one education-focused platform.

---

Built with Python · FastAPI · Groq · SerpApi · JavaScript · HTML · CSS · Vercel · Render
