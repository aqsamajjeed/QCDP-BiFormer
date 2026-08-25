import torch
import torch.nn as nn
from torchvision import models, transforms
from PIL import Image
import io
import os

# 1. MODEL SETTINGS


CLASSES = ['N', 'D', 'G', 'C', 'A', 'H', 'M', 'O']

DISEASE_NAMES = {
    'N': 'Normal',
    'D': 'Diabetic Retinopathy',
    'G': 'Glaucoma',
    'C': 'Cataract',
    'A': 'AMD',
    'H': 'Hypertension',
    'M': 'Myopia',
    'O': 'Others'
}


# Use the thresholds from your testing
THRESHOLDS = {
    'N': 0.42,
    'D': 0.35,
    'G': 0.46,
    'C': 0.47,
    'A': 0.34,
    'H': 0.33,
    'M': 0.60,
    'O': 0.33
}



# 2. DEVICE


device = torch.device(
    "cuda" if torch.cuda.is_available() else "cpu"
)

print("Device:", device)



# 3. LOAD RESNET18


model = models.resnet18(
    weights=None
)

model.fc = nn.Linear(
    model.fc.in_features,
    8
)


MODEL_PATH =os.path.join(
    os.path.dirname(os.path.abspath(__file__)),
    "resnet18_odir_prototype_best.pth"
)

model.load_state_dict(
    torch.load(
        MODEL_PATH,
        map_location=device
    )
)

model = model.to(device)

model.eval()

print(" ResNet18 model loaded")



# 4. IMAGE TRANSFORMATION


transform = transforms.Compose([

    transforms.Resize((224, 224)),

    transforms.ToTensor(),

    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    )
])




# 6. PREDICT ONE EYE

def predict_eye(image_file):

    image_bytes = image_file.read()

    image = Image.open(
        io.BytesIO(image_bytes)
    ).convert("RGB")

    image_tensor = transform(image)

    image_tensor = image_tensor.unsqueeze(0)

    image_tensor = image_tensor.to(device)


    with torch.no_grad():

        output = model(image_tensor)

        probabilities = torch.sigmoid(output)[0]


    probabilities = probabilities.cpu().numpy()

    return probabilities


# 7. PATIENT-LEVEL PREDICTION


def predict_patient(left_image, right_image):

  

    left_probs = predict_eye(left_image)
    right_probs = predict_eye(right_image)


    # ==============================
    # LEFT EYE RESULT
    # ==============================

    left_probabilities = {}

    for i, disease in enumerate(CLASSES):

        left_probabilities[
            DISEASE_NAMES[disease]
        ] = float(left_probs[i] * 100)


    left_predicted = []

    for i, disease in enumerate(CLASSES):

        if left_probs[i] >= THRESHOLDS[disease]:

            left_predicted.append(
                DISEASE_NAMES[disease]
            )


    # Safety fallback for LEFT eye

    if len(left_predicted) == 0:

        best_index = max(
            range(len(left_probs)),
            key=lambda i: left_probs[i]
        )

        left_predicted = [
            DISEASE_NAMES[
                CLASSES[best_index]
            ]
        ]


    left_predicted = sorted(
        left_predicted,
        key=lambda x:
            left_probabilities[x],
        reverse=True
    )

    left_main_disease = left_predicted[0]

    left_confidence = left_probabilities[
        left_main_disease
    ]


    # ==============================
    # RIGHT EYE RESULT
    # ==============================

    right_probabilities = {}

    for i, disease in enumerate(CLASSES):

        right_probabilities[
            DISEASE_NAMES[disease]
        ] = float(right_probs[i] * 100)


    right_predicted = []

    for i, disease in enumerate(CLASSES):

        if right_probs[i] >= THRESHOLDS[disease]:

            right_predicted.append(
                DISEASE_NAMES[disease]
            )


    # Safety fallback for RIGHT eye

    if len(right_predicted) == 0:

        best_index = max(
            range(len(right_probs)),
            key=lambda i: right_probs[i]
        )

        right_predicted = [
            DISEASE_NAMES[
                CLASSES[best_index]
            ]
        ]


    right_predicted = sorted(
        right_predicted,
        key=lambda x:
            right_probabilities[x],
        reverse=True
    )

    right_main_disease = right_predicted[0]

    right_confidence = right_probabilities[
        right_main_disease
    ]


    # ==============================
    # RETURN BOTH EYES SEPARATELY
    # ==============================

    return {

        "left": {

            "disease":
                ", ".join(left_predicted),

            "confidence":
                left_confidence,

            "probabilities":
                left_probabilities
        },


        "right": {

            "disease":
                ", ".join(right_predicted),

            "confidence":
                right_confidence,

            "probabilities":
                right_probabilities
        }
    }