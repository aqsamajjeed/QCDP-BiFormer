import webbrowser,os
from flask import Flask, render_template, request, jsonify

from models.resnet18 import predict_patient


from llm.llm import (
    generate_initial_report,
    answer_followup_question
)

app = Flask(__name__)


# HOME

@app.route("/")
def index():

    return render_template(
        "index.html"
    )



#  Prediction API


@app.route(
    "/predict",
    methods=["POST"]
)

def predict():

    left = request.files.get(
        "left_image"
    )

    right = request.files.get(
        "right_image"
    )


    if not left or not right:

        return jsonify({

            "error":
                "Both left-eye and right-eye images are required."

        }), 400


    try:
     #  RESNET PREDICTION
        result = predict_patient(
            left,
            right
        )

        #  GET PREDICTIONS
        

        left_prediction = result[
            "left"
        ][
            "disease"
        ]
        right_prediction = result[
            "right"
        ][
            "disease"
        ]


        #  RAG + LLM

        report = generate_initial_report(
            left_prediction,
            right_prediction
        )
        
      
        # SEPARATE REPORTS

        result["left"]["medical_report"] = (
            report.get(
                "left",
                "Medical information unavailable."
            )
        )

        result["right"]["medical_report"] = (
            report.get(
                "right",
                "Medical information unavailable."
            )
        )

    #  SEND EVERYTHING TO FRONTEND
        return jsonify(result)
    
    except Exception as e:

        print("Prediction error:", e)

        return jsonify({

            "error":
                str(e)

        }), 500


# FOLLOW-UP QUESTION API
@app.route("/ask", methods=["POST"])

def ask():

    try:

        data = request.get_json()

 # GET CURRENT PREDICTIONS
        left_prediction = data.get(
            "left_prediction"
        )

        right_prediction = data.get(
            "right_prediction"
        )
      # GET USER QUESTION
        question = data.get(
            "question"
        )

     # VALIDATION
        if not left_prediction or not right_prediction:
            return jsonify({
                "error": "Predictions are required."
            }), 400


        if not question:
            return jsonify({
                "error": "Question is required."
            }), 400


       
        # RAG + LLM FOLLOW-UP

        answer = answer_followup_question(
            left_prediction,
            right_prediction,
            question
        )

       # RETURN ANSWER
        return jsonify({
            "answer": answer
        })


    except Exception as e:

        print("Question error:", e)

        return jsonify({
            "error": str(e)
        }), 500
    
#  RUN APPLICATION

if __name__ == "__main__":
      # Only open browser if not running in reloader process
    if os.environ.get('WERKZEUG_RUN_MAIN') != 'true':
        webbrowser.open('http://127.0.0.1:5000')

    app.run(debug=True, host='127.0.0.1', port=5000)