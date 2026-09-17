const BACKEND_URL =
  "https://eduagent-ai-osvz.onrender.com/ask";

const sleep = (ms) =>
  new Promise(resolve => setTimeout(resolve, ms));


/* =========================================
   WORKFLOW NODE CONTROL
========================================= */

function setNode(nodeId, status, active = false) {

  const node = document.getElementById(nodeId);

  if (!node) return;

  const statusElement =
    node.querySelector(".node-status");

  statusElement.innerText = status;

  node.classList.remove(
    "active",
    "completed",
    "error"
  );

  if (
    status.includes("✓") ||
    status.includes("Completed") ||
    status.includes("Received") ||
    status.includes("Generated")
  ) {

    node.classList.add("completed");

  } else if (
    status.includes("⚠") ||
    status.includes("Failed")
  ) {

    node.classList.add("error");

  } else if (active) {

    node.classList.add("active");
  }
}


/* =========================================
   RESET WORKFLOW
========================================= */

function resetWorkflow() {

  setNode("userNode", "Waiting");

  setNode("routerNode", "Waiting");

  setNode("toolNode", "Waiting");

  setNode("responseNode", "Waiting");
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


  answerBox.innerHTML = `
    <div class="ai-loading">
      <span>🤔</span>
      <div>
        <strong>EduAgent is thinking...</strong>
        <small>Analyzing your question</small>
      </div>
    </div>
  `;


  resetWorkflow();


  try {

    /* USER */

    setNode(
      "userNode",
      "⏳ Processing",
      true
    );

    await sleep(500);

    setNode(
      "userNode",
      "✓ Received"
    );


    /* ROUTER */

    setNode(
      "routerNode",
      "⏳ Routing...",
      true
    );


    /* BACKEND */

    const response =
      await fetch(BACKEND_URL, {

        method: "POST",

        headers: {
          "Content-Type":
            "application/json"
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


    /* ROUTER COMPLETE */

    setNode(
      "routerNode",
      "✓ Completed"
    );


    await sleep(400);


    /* =====================================
       DETECT ACTUAL TOOL
    ===================================== */

    let actualTool = null;


    if (
      data.tool_trace &&
      data.tool_trace.length > 0
    ) {

      actualTool =
        data.tool_trace.find(
          item =>
            item.tool !==
            "education_router"
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


    /* TOOL NODE */

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


      setNode(
        "toolNode",
        `✓ ${displayName}`
      );

    } else {

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


    /* RESPONSE */

    setNode(
      "responseNode",
      "⏳ Generating...",
      true
    );


    await sleep(600);


    setNode(
      "responseNode",
      "✓ Generated"
    );


    /* =====================================
       PREMIUM AI RESPONSE
    ===================================== */

    answerBox.innerHTML = `
      <div class="answer-header">
        <div class="ai-avatar">🧠</div>

        <div>
          <div class="answer-title">
            EduAgent AI
          </div>

          <div class="answer-subtitle">
            Intelligent education response
          </div>
        </div>
      </div>

      <div class="answer-divider"></div>

      <div class="answer-content">
        ${formatAnswer(data.answer)}
      </div>
    `;


  } catch (error) {

    console.error(error);


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


    answerBox.innerHTML = `
      <div class="error-card">

        <div class="error-icon">
          ⚠️
        </div>

        <div>
          <strong>
            Unable to connect to EduAgent
          </strong>

          <p>
            Please try again in a moment.
          </p>
        </div>

      </div>
    `;
  }


  button.disabled = false;

  button.innerText =
    "Ask EduAgent";
}


/* =========================================
   FORMAT AI ANSWER
========================================= */

function formatAnswer(answer) {

  if (!answer) {
    return "<p>No answer received.</p>";
  }

  /* Escape HTML */
  let text = answer
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  const lines = text.split("\n");

  let output = "";
  let tableRows = [];
  let insideTable = false;

  /* =====================================
     RENDER TABLE
  ===================================== */

  function renderTable(rows) {

    if (rows.length < 2) {
      return rows.join("");
    }

    const header = rows[0]
      .split("|")
      .map(cell => cell.trim())
      .filter(cell => cell !== "");

    const bodyRows = rows
      .slice(2)
      .map(row =>
        row
          .split("|")
          .map(cell => cell.trim())
          .filter(cell => cell !== "")
      );

    let table = `
      <div class="ai-table-wrapper">
        <table class="ai-table">
          <thead>
            <tr>
    `;

    header.forEach(cell => {
      table += `<th>${cell}</th>`;
    });

    table += `
            </tr>
          </thead>
          <tbody>
    `;

    bodyRows.forEach(row => {

      if (!row.length) return;

      table += "<tr>";

      row.forEach(cell => {
        table += `<td>${cell}</td>`;
      });

      table += "</tr>";
    });

    table += `
          </tbody>
        </table>
      </div>
    `;

    return table;
  }


  /* =====================================
     PROCESS LINES
  ===================================== */

  lines.forEach(line => {

    const trimmed = line.trim();

    /* Table line */

    if (
      trimmed.startsWith("|") &&
      trimmed.endsWith("|")
    ) {

      if (!insideTable) {
        insideTable = true;
        tableRows = [];
      }

      tableRows.push(trimmed);

      return;
    }


    /* Finish table */

    if (insideTable) {

      output += renderTable(tableRows);

      tableRows = [];
      insideTable = false;
    }


    /* Ignore empty lines */

    if (trimmed === "") {
      return;
    }


    output += line + "\n";
  });


  /* Final table */

  if (insideTable) {
    output += renderTable(tableRows);
  }


  text = output.trim();


  /* =====================================
     HEADINGS
  ===================================== */

  text = text.replace(
    /^###\s+(.*)$/gm,
    "<h4>$1</h4>"
  );

  text = text.replace(
    /^##\s+(.*)$/gm,
    "<h3>$1</h3>"
  );

  text = text.replace(
    /^#\s+(.*)$/gm,
    "<h2>$1</h2>"
  );


  /* =====================================
     BOLD
  ===================================== */

  text = text.replace(
    /\*\*(.*?)\*\*/g,
    "<strong>$1</strong>"
  );


  /* =====================================
     ITALIC
  ===================================== */

  text = text.replace(
    /(?<!\*)\*(.*?)\*(?!\*)/g,
    "<em>$1</em>"
  );


  /* =====================================
     BULLETS
  ===================================== */

  text = text.replace(
    /^[•\-]\s+(.*)$/gm,
    '<div class="answer-bullet">$1</div>'
  );


  /* =====================================
     NUMBERED LIST
  ===================================== */

  text = text.replace(
    /^\d+\.\s+(.*)$/gm,
    '<div class="answer-number">$1</div>'
  );


  /* =====================================
     HORIZONTAL LINE
  ===================================== */

  text = text.replace(
    /^---$/gm,
    "<hr>"
  );
  /* =====================================
   MARKDOWN LINKS
===================================== */

text = text.replace(
  /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
  '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>'
);


/* =====================================
   PLAIN URLs
===================================== */

text = text.replace(
  /(^|[\s>])(https?:\/\/[^\s<]+)/gm,
  '$1<a href="$2" target="_blank" rel="noopener noreferrer">$2</a>'
);


  /* =====================================
     LINE BREAKS
  ===================================== */

  text = text.replace(
    /\n/g,
    "<br>"
  );


  /* =====================================
     CLEAN HTML SPACING
  ===================================== */

  text = text
    .replace(/(<br>)+<h/g, "<h")
    .replace(/<\/h2>(<br>)+/g, "</h2>")
    .replace(/<\/h3>(<br>)+/g, "</h3>")
    .replace(/<\/h4>(<br>)+/g, "</h4>")
    .replace(
      /(<br>)+<div class="ai-table-wrapper">/g,
      '<div class="ai-table-wrapper">'
    )
    .replace(
      /<\/div>(<br>)+/g,
      "</div>"
    )
    .replace(
      /(<br>)+$/g,
      ""
    );

  return text;
}

  

  


   

  


  
