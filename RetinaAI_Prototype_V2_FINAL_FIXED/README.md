# RetinaAI Final Prototype

## Final flow

- Sidebar contains **Home** and **Dashboard** only.
- Dashboard accepts **Left Eye + Right Eye** images for one patient.
- Images appear in the right-side viewer.
- Analyze Patient Images produces the current prototype prediction.
- A hard-coded explanation is shown according to the predicted class.
- At the bottom of the dashboard:
  - **New Prediction** resets/refreshes the dashboard for a new case.
  - **Ask About This Prediction** opens a placeholder for the future RAG/LLM conversation.
- New Prediction is intentionally removed from the sidebar.

The current prediction is hard-coded as Diabetic Retinopathy (94.2%) for UI testing. Replace `predict_patient()` in `app.py` with the trained model later.

Replace the image placeholders in `templates/index.html` and `YOUR_BACKGROUND_RETINAL_IMAGE_URL` in `static/style.css`.

Run with:

python app.py

Then open http://127.0.0.1:5000


## Latest UI changes

- Home **Start Analysis** button is now **Go to Dashboard**. Clicking it only takes the user to the Dashboard; image upload starts there.
- The right-side patient image viewer now displays the **Left Eye and Right Eye vertically**, making better use of the available panel space.


## V2 minimal fixes

Only two UI changes were made to the original V2:
1. Removed the Home-page "Go to Dashboard" button.
2. Reduced the right-side retinal image viewer and kept it sticky/static.

The original V2 upload, prediction, result, New Prediction, and Ask About This Prediction logic was preserved.


## Compact right viewer update

Only the right-side viewer sizing was changed:
- Width reduced from 430px to 330px.
- Each vertical eye image area reduced to about 145px high.
- Viewer remains sticky/static.
- All V2 upload, prediction, result, New Prediction, and Ask About This Prediction logic remains unchanged.


## Square viewer update
Only the right-side viewer was adjusted for square 1:1 retinal images. The images remain vertically stacked, the viewer remains sticky/static, and the application logic was not changed.


## Final Home gallery fix
Home-page retinal disease gallery images are now displayed in square 1:1 cards. No application logic was changed.


## Final Home image-frame fix
The Home-page retinal gallery now uses true square 1:1 frames, matching the dashboard image shape. Images are contained inside the square frame so the square fundus images are not stretched or cropped.
