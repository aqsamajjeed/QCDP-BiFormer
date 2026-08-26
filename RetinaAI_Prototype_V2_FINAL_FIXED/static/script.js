const homePage=document.getElementById("homePage"),dashboardPage=document.getElementById("dashboardPage");
const navItems=document.querySelectorAll(".nav-item");
function showPage(name){homePage.classList.toggle("hidden",name!=="home");dashboardPage.classList.toggle("hidden",name!=="dashboard");navItems.forEach(n=>n.classList.toggle("active",n.dataset.page===name));window.scrollTo({top:0,behavior:"smooth"});}
navItems.forEach(n=>n.addEventListener("click",()=>showPage(n.dataset.page)));


const classes=["AMD","Cataract","Diabetic Retinopathy","Glaucoma","Hypertension","Myopia","Normal","Others"];

function renderProbabilities(values, containerId){

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
  document.getElementById("viewerState").textContent="Images ready";
  document.getElementById("viewerState").classList.add("ready");
  if(leftFile&&rightFile){document.getElementById("selectedPanel").classList.remove("hidden");document.getElementById("analyzeButton").disabled=false;}
 };
 r.readAsDataURL(file);
}

document.getElementById("leftInput").addEventListener("change",e=>loadPreview(e.target.files[0],"left"));
document.getElementById("rightInput").addEventListener("change",e=>loadPreview(e.target.files[0],"right"));

function formatMedicalReport(text) {
    if (!text) {
        return "Medical explanation is currently unavailable.";
    }

    let html = String(text)
        .replace(/\r\n/g, "\n")
        .replace(/\r/g, "\n")
        .trim();

    // Remove horizontal separators
    html = html.replace(/^\s*---+\s*$/gm, "");

    // Escape HTML
    html = html
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");

    // Bold
    html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

    // H3 / H4 / H5
    html = html.replace(
        /^###\s+(.*?)$/gm,
        '<h3>$1</h3>'
    );

    html = html.replace(
        /^####\s+(.*?)$/gm,
        '<h4>$1</h4>'
    );

    html = html.replace(
        /^#####\s+(.*?)$/gm,
        '<h5>$1</h5>'
    );

    // Bullet lists
    html = html.replace(
        /^\s*[\*\-]\s+(.*?)$/gm,
        "<li>$1</li>"
    );

    // Group consecutive li elements
    html = html.replace(
        /(<li>.*?<\/li>\s*)+/gs,
        match => `<ul>${match}</ul>`
    );

    // Remove remaining single markdown emphasis
    html = html.replace(/\*(.*?)\*/g, "$1");

    // Convert remaining new lines
    html = html.replace(/\n{2,}/g, "<br><br>");
    html = html.replace(/\n/g, "<br>");

    return html;
}

document.getElementById("analyzeButton").addEventListener("click", async () => {

    const button = document.getElementById("analyzeButton");

    if (!leftFile || !rightFile) return;

    button.disabled = true;

    button.innerHTML =
        '<i class="fa-solid fa-spinner fa-spin"></i> Analyzing Patient...';


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


        // LEFT EYE

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


        // RIGHT EYE

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

        // UPDATE CHAT PREDICTION SUMMARY

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
            '<i class="fa-solid fa-check"></i> Analysis Complete';


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
            '<i class="fa-solid fa-microscope"></i> Analyze Patient Images';

    }

});

document.getElementById("newPredictionButton").addEventListener("click",()=>{
 leftFile=null;rightFile=null;
 ["leftInput","rightInput"].forEach(id=>document.getElementById(id).value="");
 ["leftPreview","rightPreview"].forEach(id=>{document.getElementById(id).src="";document.getElementById(id).classList.add("hidden");});
 ["leftEmpty","rightEmpty"].forEach(id=>document.getElementById(id).classList.remove("hidden"));
 document.getElementById("leftLabel").textContent="Select left-eye fundus image";
 document.getElementById("rightLabel").textContent="Select right-eye fundus image";
 document.getElementById("leftName").textContent="—";document.getElementById("rightName").textContent="—";
 document.getElementById("viewerState").textContent="Waiting";document.getElementById("viewerState").classList.remove("ready");
 document.getElementById("resultPanel").classList.add("hidden");document.getElementById("selectedPanel").classList.add("hidden");
 document.getElementById("bottomActions").classList.add("hidden");document.getElementById("chatPanel").classList.add("hidden");
 document.getElementById("uploadPanel").classList.remove("hidden");
 const b=document.getElementById("analyzeButton");b.disabled=true;b.innerHTML='<i class="fa-solid fa-microscope"></i> Analyze Patient Images';
 window.scrollTo({top:0,behavior:"smooth"});
});

document.getElementById("askQuestionButton").addEventListener("click",()=>{
 document.getElementById("chatPanel").classList.remove("hidden");
 document.getElementById("chatPanel").scrollIntoView({behavior:"smooth",block:"start"});
});
document.getElementById("closeChat").addEventListener("click",()=>document.getElementById("chatPanel").classList.add("hidden"));

document.getElementById("sendQuestionButton").addEventListener("click", async () => {

    const questionInput = document.getElementById("questionInput");
    const sendButton = document.getElementById("sendQuestionButton");
    const answerBox = document.getElementById("chatAnswerBox");
    const answer = document.getElementById("chatAnswer");

    const question = questionInput.value.trim();

    if (!question) {
        alert("Please enter a question.");
        return;
    }

    const leftPrediction =
        document.getElementById("chatLeftPrediction").textContent.trim();

    const rightPrediction =
        document.getElementById("chatRightPrediction").textContent.trim();

    sendButton.disabled = true;

    sendButton.innerHTML =
        '<i class="fa-solid fa-spinner fa-spin"></i> Asking...';

    answerBox.classList.remove("hidden");

    answer.innerHTML = "Generating answer...";

    try {

        const response = await fetch("/ask", {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                left_prediction: leftPrediction,
                right_prediction: rightPrediction,
                question: question
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.error || "Unable to get answer."
            );
        }

        answer.innerHTML = formatMedicalReport(
            data.answer || "No answer was returned."
        );

    } catch (error) {

        console.error("Question error:", error);

        answer.innerHTML =
            `<strong>Error:</strong> ${error.message}`;

    } finally {

        // Re-enable Send button
        sendButton.disabled = false;

        sendButton.innerHTML =
            '<i class="fa-solid fa-paper-plane"></i> Send';
    }
});