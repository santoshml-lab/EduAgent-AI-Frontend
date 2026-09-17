const BACKEND_URL =
  "https://eduagent-ai-osvz.onrender.com/ask";


/* =========================================
   HELPER
========================================= */

const sleep = (ms) =>
  new Promise(resolve => setTimeout(resolve, ms));


/* =========================================
   NODE STATE
========================================= */

function setNode(nodeId, status, active = false) {

  const node = document.getElementById(nodeId);

  if (!node) return;

  const statusElement =
    node.querySelector(".node-status");

  if (!statusElement) return;

  statusElement.innerText = status;

  node.classList.remove(
    "active",
    "completed",
    "error"
  );


  /* Active */

  if (active) {

    node.classList.add("active");

  }


  /* Completed */

  else if (
    status.includes("✓") ||
    status.includes("Completed") ||
    status.includes("Received") ||
    status.includes("Generated")
  ) {

    node.classList.add("completed");

  }


  /* Error */

  else if (
    status.includes("⚠") ||
    status.includes("Failed")
  ) {

    node.classList.add("error");

  }

}


/* =========================================
   RESET WORKFLOW
========================================= */

function resetWorkflow() {

  setNode(
    "userNode",
    "Waiting"
  );

  setNode(
    "routerNode",
    "Waiting"
  );

  setNode(
    "toolNode",
    "Waiting"
  );

  setNode(
    "responseNode",
    "Waiting"
  );

}


/* =========================================
   ASK AGENT
========================================= */

async function askAgent() {

  const input =
    document.getElementById("questionInput");

  const button =
    document.getElementById("askButton");

  const responseSection =
    document.getElementById("responseSection");

  const answerBox =
    document.getElementById("answerBox");


  const question =
    input.value.trim();


  if (!question) {

    alert("Please enter a question.");

    return;

  }


  button.disabled = true;

  button.innerText =
    "Agent Working...";


  responseSection.style.display =
    "block";


  answerBox.innerHTML =
    "<p>🤔 EduAgent is thinking...</p>";


  resetWorkflow();


  try {

    /* =====================================
       STEP 1 — USER QUERY
    ===================================== */

    setNode(
      "userNode",
      "⏳ Processing...",
      true
    );

    await sleep(500);

    setNode(
      "userNode",
      "✓ Received"
    );


    /* =====================================
       STEP 2 — EDUCATION ROUTER
    ===================================== */

    setNode(
      "routerNode",
      "⏳ Routing...",
      true
    );


    /* =====================================
       BACKEND REQUEST
    ===================================== */

    const response =
      await fetch(BACKEND_URL, {

        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({
          question: question
        })

      });


    if (!response.ok) {

      throw new Error(
        `Server error: ${response.status}`
      );

    }


    const data =
      await response.json();


    /* =====================================
       ROUTER COMPLETED
    ===================================== */

    setNode(
      "routerNode",
      "✓ Completed"
    );

    await sleep(400);


    /* =====================================
       STEP 3 — TOOL
    ===================================== */

    let actualTool = null;


    if (
      data.tool_trace &&
      data.tool_trace.length > 0
    ) {

      actualTool =
        data.tool_trace.find(
          item =>
            item.tool !== "education_router"
        );

    }


    const toolNames = {

      calculator:
        "🧮 Calculator",

      web_search:
        "🔎 SerpApi",

      quiz_generator:
        "📝 Quiz Generator",

      study_plan_generator:
        "📅 Study Planner"

    };


    if (actualTool) {

      const displayName =
        toolNames[actualTool.tool] ||
        `🔧 ${actualTool.tool}`;


      setNode(
        "toolNode",
        `⏳ ${displayName}`,
        true
      );


      await sleep(700);


      if (actualTool.status === "error") {

        setNode(
          "toolNode",
          `⚠ ${displayName} Failed`
        );

      } else {

        setNode(
          "toolNode",
          `✓ ${displayName}`
        );

      }

    }


    /* =====================================
       DIRECT ANSWER
    ===================================== */

    else {

      setNode(
        "toolNode",
        "⏳ Direct Answer",
        true
      );


      await sleep(500);


      setNode(
        "toolNode",
        "✓ Direct Answer"
      );

    }


    /* =====================================
       STEP 4 — AI RESPONSE
    ===================================== */

    setNode(
      "responseNode",
      "⏳ Generating...",
      true
    );


    await sleep(700);


    setNode(
      "responseNode",
      "✓ Generated"
    );


    /* =====================================
       SHOW ANSWER
    ===================================== */

    answerBox.innerHTML =
      `<div class="answer-content">
        ${formatAnswer(data.answer)}
      </div>`;


  }


  /* =======================================
     ERROR HANDLING
  ======================================= */

  catch (error) {

    console.error(
      "EduAgent Error:",
      error
    );


    setNode(
      "routerNode",
      "⚠ Error"
    );


    setNode(
      "toolNode",
      "⚠ Failed"
    );


    setNode(
      "responseNode",
      "⚠ Failed"
    );


    answerBox.innerHTML =
      `<p>
        ❌ Unable to connect to EduAgent backend.
      </p>`;

  }


  /* =====================================
     RESTORE BUTTON
  ===================================== */

  button.disabled = false;

  button.innerText =
    "Ask EduAgent";

}


/* =========================================
   FORMAT AI ANSWER
========================================= */

function formatAnswer(answer) {

  if (!answer) {

    return "No answer received.";

  }


  return answer

    /* Math delimiters */

    .replace(/\\\[/g, "")
    .replace(/\\\]/g, "")
    .replace(/\\\(/g, "")
    .replace(/\\\)/g, "")

    /* Math symbols */

    .replace(/\\times/g, "×")
    .replace(/\\div/g, "÷")
    .replace(/\\cdot/g, "·")

    /* Bold */

    .replace(
      /\*\*(.*?)\*\*/g,
      "<strong>$1</strong>"
    )

    /* Italic */

    .replace(
      /\*(.*?)\*/g,
      "<em>$1</em>"
    )

    /* New lines */

    .replace(
      /\n/g,
      "<br>"
    );

}


/* =========================================
   ENTER KEY SUPPORT
========================================= */

document.addEventListener(
  "DOMContentLoaded",
  () => {

    const input =
      document.getElementById("questionInput");


    if (!input) return;


    input.addEventListener(
      "keydown",
      (event) => {

        if (event.key === "Enter") {

          askAgent();

        }

      }
    );

  }
);
