const homePage=document.getElementById("homePage"),dashboardPage=document.getElementById("dashboardPage");
const navItems=document.querySelectorAll(".nav-item");
function showPage(name)
{
    homePage.classList.toggle("hidden",name!=="home");
    dashboardPage.classList.toggle("hidden",name!=="dashboard");
    navItems.forEach(n=>n.classList.toggle("active",n.dataset.page===name));
    window.scrollTo({top:0,behavior:"smooth"});
}
navItems.forEach(n=>n.addEventListener("click",()=>showPage(n.dataset.page)));


const classes=["AMD","Cataract","Diabetic Retinopathy","Glaucoma","Hypertension","Myopia","Normal","Others"];

function renderProbabilities(values, containerId)
{

    const box = document.getElementById(containerId);

    box.innerHTML = "";

    classes.forEach(c => {

        const v = Number(values[c] || 0);

        box.insertAdjacentHTML(

            "beforeend",

            `<div class="probability">

                <div class="probability-top">

                    <span>${c}</span>

                    <span>${v.toFixed(1)}%</span>

                </div>

                <div class="probability-bar">

                    <span
                        style="width:${Math.min(v,100)}%"
                    ></span>

                </div>

            </div>`
        );

    });

}
let leftFile=null,rightFile=null;
function loadPreview(file,side){
 if(!file)return;
 const r=new FileReader();
 r.onload=e=>{
  document.getElementById(side+"Preview").src=e.target.result;
  document.getElementById(side+"Preview").classList.remove("hidden");
  document.getElementById(side+"Empty").classList.add("hidden");
  document.getElementById(side+"Label").textContent=file.name;
  document.getElementById(side+"Name").textContent=file.name;
  if(side==="left")leftFile=file;else rightFile=file;
  if(leftFile&&rightFile)
    {
        document.getElementById("selectedPanel").classList.remove("hidden");document.getElementById("analyzeButton").disabled=false;
    }
 };
 r.readAsDataURL(file);
}

document.getElementById("leftInput").addEventListener("change",e=>loadPreview(e.target.files[0],"left"));
document.getElementById("rightInput").addEventListener("change",e=>loadPreview(e.target.files[0],"right"));

function formatMedicalReport(text) {
    if (!text) {
        return "Medical explanation is currently unavailable.";
    }
    
    
    // Clean up the text
    let raw = String(text)
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();
    
    // If text is very short or doesn't have markdown, just return it as is
   if (raw.length < 50 || !raw.includes('\n')) {
       //  convert any asterisks to italic
       raw = raw.replace(/\*(.*?)\*/g, "<em>$1</em>");
       return `<p>${raw}</p>`;
   }
    // Step 1: Fix headings - look for heading patterns and convert to proper ### format
    const headings = {
        "what it is": "### What it is",
        "symptoms / signs": "### Symptoms / Signs",
        "risk factors": "### Risk Factors",
        "detection": "### Detection",
        "general management": "### General Management",
        "important note": "### Important Note",
        "summary": "### Summary",
        "conclusion": "### Conclusion"
    };

    // Add newlines before each heading and convert to proper format
    Object.keys(headings).forEach(key => {
        const regex = new RegExp(`(?:(?:^|\\n)\\s*)(?:#{2,5}\\s*)?(?:${key})(?:\\s*:)?(?!\\w)`, "gi");
        raw = raw.replace(regex, `\n\n${headings[key]}\n\n`);
    });

    // Step 2: Fix bullet points - ensure they start with "- "
    // Any line that starts with *, •, or - followed by space becomes "- "
    raw = raw.replace(/^[\s]*[\*•]\s+/gm, "- ");
    // Also convert numbered lists to bullet points
    raw = raw.replace(/^[\s]*\d+\.\s+/gm, "- ");
    // Fix bullets that are crammed in the middle of text
    raw = raw.replace(/([a-zA-Z0-9])\s+[-*•]\s+/g, "$1\n- ");

    // Step 3: Clean up extra spacing
    raw = raw.replace(/\n{3,}/g, "\n\n");
    raw = raw.trim();

    // Step 4: Convert markdown to HTML
    // First, escape HTML characters
    raw = raw
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");

    //  Convert italic FIRST (single asterisks)
    raw = raw.replace(/\*(.*?)\*/g, "<em>$1</em>");    
    // Convert bold text
    raw = raw.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

    // Convert headings (### Title) to HTML
    raw = raw.replace(/^###\s+(.+)$/gm, "<h3>$1</h3>");

    // Convert bullet points to HTML list
    // First, find all bullet point sections and wrap them in <ul>
    const lines = raw.split("\n");
    let result = [];
    let inList = false;
    let listItems = [];

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        if (!line) {
            // Empty line - close list if we're in one
            if (inList) {
                result.push(`<ul>${listItems.join("")}</ul>`);
                listItems = [];
                inList = false;
            }
            result.push(""); // Keep empty line
            continue;
        }

        // Check if line starts with "- "
        if (line.startsWith("- ")) {
            const itemText = line.substring(2);
            if (!inList) {
                // Start new list
                if (result.length > 0 && result[result.length - 1] !== "") {
                    result.push(""); // Add spacing before list
                }
                inList = true;
                listItems = [];
            }
            listItems.push(`<li>${itemText}</li>`);
        } else {
            // Not a bullet point - close list if we were in one
            if (inList) {
                result.push(`<ul>${listItems.join("")}</ul>`);
                listItems = [];
                inList = false;
            }
            // Check if this line is a heading (already converted to <h3>)
            if (line.startsWith("<h3>") || line.startsWith("<strong>")) {
                result.push(line);
            } else {
                // Regular text - wrap in paragraph
                result.push(`<p>${line}</p>`);
            }
        }
    }

    // Close any open list
    if (inList) {
        result.push(`<ul>${listItems.join("")}</ul>`);
    }

    // Step 5: Join everything and clean up
    let html = result.join("\n");

    // Remove empty paragraphs
    html = html.replace(/<p>\s*<\/p>/g, "");
    
    // Remove extra line breaks between elements
    html = html.replace(/\n{2,}/g, "\n");
    
    // Ensure proper spacing between elements
    html = html.replace(/<\/h3>\n/g, "</h3>");
    html = html.replace(/<\/ul>\n/g, "</ul>");
    html = html.replace(/<\/p>\n/g, "</p>");

    return html.trim();
}

document.getElementById("analyzeButton").addEventListener("click", async () => {

    const button = document.getElementById("analyzeButton");

    if (!leftFile || !rightFile) return;

    button.disabled = true;

    button.innerHTML =
        'Analyzing Patient...';


    const fd = new FormData();

    fd.append("left_image", leftFile);

    fd.append("right_image", rightFile);


    try {

        const response = await fetch(
            "/predict",
            {
                method: "POST",
                body: fd
            }
        );


        const data = await response.json();


        if (!response.ok) {

            throw new Error(
                data.error || "Prediction failed"
            );

        }


        // Left  Eye

        document.getElementById(
            "leftResultDisease"
        ).textContent =
            data.left.disease;


        document.getElementById(
            "leftResultConfidence"
        ).textContent =
            Number(
                data.left.confidence
            ).toFixed(1) + "%";


        // Right Eye

        document.getElementById(
            "rightResultDisease"
        ).textContent =
            data.right.disease;


        document.getElementById(
            "rightResultConfidence"
        ).textContent =
            Number(
                data.right.confidence
            ).toFixed(1) + "%";

        // Update Chat Prediction Summary

    document.getElementById("chatLeftPrediction").textContent =
    data.left.disease;

    document.getElementById("chatRightPrediction").textContent =
    data.right.disease;
        // LEFT EYE PROBABILITIES

        renderProbabilities(
            data.left.probabilities,
            "leftProbabilityList"
        );


        // RIGHT EYE PROBABILITIES

        renderProbabilities(
            data.right.probabilities,
            "rightProbabilityList"
        );


      // AUTOMATIC RAG + LLM REPORT

document.getElementById("leftMedicalReport").innerHTML =
    formatMedicalReport(
        data.left.medical_report ||
        "Medical explanation is currently unavailable."
    );

document.getElementById("rightMedicalReport").innerHTML =
    formatMedicalReport(
        data.right.medical_report ||
        "Medical explanation is currently unavailable."
    );


        // SHOW RESULT

        document.getElementById(
            "uploadPanel"
        ).classList.add("hidden");


        document.getElementById(
            "selectedPanel"
        ).classList.add("hidden");


        document.getElementById(
            "resultPanel"
        ).classList.remove("hidden");


        document.getElementById(
            "bottomActions"
        ).classList.remove("hidden");


        button.innerHTML =
            'Analysis Complete';


        document.getElementById(
            "resultPanel"
        ).scrollIntoView({
            behavior: "smooth",
            block: "start"
        });


    } catch (err) {

        alert(err.message);

        button.disabled = false;

        button.innerHTML =
            'Analyze Patient Images';

    }

});

document.getElementById("newPredictionButton").addEventListener("click",()=>
    {
 leftFile=null;rightFile=null;
 ["leftInput","rightInput"].forEach(id=>document.getElementById(id).value="");
 ["leftPreview","rightPreview"].forEach(id=>{document.getElementById(id).src="";
    document.getElementById(id).classList.add("hidden");});
 ["leftEmpty","rightEmpty"].forEach(id=>document.getElementById(id).classList.remove("hidden"));
 document.getElementById("leftLabel").textContent="Select left-eye fundus image";
 document.getElementById("rightLabel").textContent="Select right-eye fundus image";
 document.getElementById("leftName").textContent="—";
 document.getElementById("rightName").textContent="—";
 document.getElementById("resultPanel").classList.add("hidden");
 document.getElementById("selectedPanel").classList.add("hidden");
 document.getElementById("bottomActions").classList.add("hidden");
 document.getElementById("chatPanel").classList.add("hidden");
 document.getElementById("chatHistory").innerHTML = "";
 document.getElementById("uploadPanel").classList.remove("hidden");
 const b=document.getElementById("analyzeButton");b.disabled=true;
 b.innerHTML='Analyze Patient Images';
 window.scrollTo({top:0,behavior:"smooth"});
});

document.getElementById("askQuestionButton").addEventListener("click",()=>{
 document.getElementById("chatPanel").classList.remove("hidden");
 document.getElementById("chatPanel").scrollIntoView({behavior:"smooth",block:"start"});
});
document.getElementById("closeChat").addEventListener("click",()=>document.getElementById("chatPanel").classList.add("hidden"));

document.getElementById("sendQuestionButton").addEventListener("click", async () => {

    const questionInput =
        document.getElementById("questionInput");

    const sendButton =
        document.getElementById("sendQuestionButton");

    const answerBox =
        document.getElementById("chatAnswerBox");

    const history =
        document.getElementById("chatHistory");

    const question =
        questionInput.value.trim();

    if (!question) {
        alert("Please enter a question.");
        return;
    }

    const leftPrediction =
        document.getElementById("chatLeftPrediction")
        .textContent.trim();

    const rightPrediction =
        document.getElementById("chatRightPrediction")
        .textContent.trim();

    sendButton.disabled = true;

    sendButton.innerHTML =
        'Asking...';

    answerBox.classList.remove("hidden");

    /* Create a new history item */
    const historyItem =
        document.createElement("div");

    historyItem.className =
        "chat-history-item";

    historyItem.innerHTML = `
        <div class="chat-history-question">
            ${escapeHtml(question)}
        </div>

        <div class="chat-history-answer">
            Generating answer...
        </div>
    `;

    history.appendChild(historyItem);

    /* Move the newest question into view */
    historyItem.scrollIntoView(
        {
        behavior: "smooth",
        block: "nearest"
    });

    const answer =
        historyItem.querySelector(
            ".chat-history-answer"
        );

    try {

        const response = await fetch("/ask",
            {
            method:"POST",

            headers:{
                "Content-Type":"application/json"
            },

            body:JSON.stringify(
            {
                left_prediction:leftPrediction,
                right_prediction:rightPrediction,
                question:question
            })
        });

        const data =
            await response.json();

        if (!response.ok) {
            throw new Error(
                data.error ||
                "Unable to get answer."
            );
        }

        answer.innerHTML =
            formatMedicalReport(
                data.answer ||
                "No answer was returned."
            );

        /* Clear input for the next question */
        questionInput.value = "";

    } catch (error) {

        console.error(
            "Question error:",
            error
        );

        answer.innerHTML =
            `<strong>Error:</strong> ${escapeHtml(error.message)}`;

    } finally {

        sendButton.disabled = false;

        sendButton.innerHTML =
            '</i> Send';
    }
});

function escapeHtml(text) {

    const div = document.createElement("div");

    div.textContent = text;

    return div.innerHTML;
}