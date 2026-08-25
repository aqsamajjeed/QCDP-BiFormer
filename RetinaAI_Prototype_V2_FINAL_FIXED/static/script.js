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

        document.getElementById(
            "medicalReport"
        ).textContent =
            data.medical_report ||
            "Medical explanation is currently unavailable.";


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
