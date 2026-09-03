# QCDP-BiFormer

**Quality-Conditioned Disease-Prototype Bilateral Transformer for Multi-Label Eye Disease Classification.**

QCDP-BiFormer is a deep learning framework for **multi-label eye disease classification** using the **ODIR-5K dataset**. It combines image quality assessment, disease prototypes, attention mechanisms, and bilateral eye information to improve retinal disease prediction.

### Pipeline

```text
ODIR-5K
   ↓
Quality Assessment
   ↓
FiLM + ConvNeXt-Tiny
   ↓
Disease Prototype Memory
   ↓
Disease-Aware Attention
   ↓
Cross-Eye Attention
   ↓
Adaptive Fusion
   ↓
Multi-Label Classification
```

### Diseases

AMD · Cataract · Diabetic Retinopathy · Glaucoma · Hypertension · Myopia · Normal · Other

### Tech Stack

**Python · PyTorch · ConvNeXt-Tiny · Transformers · XGBoost · Google Colab**

### Status

🚧 **Research in progress** — quality assessment, feature extraction, and disease prototype memory have been implemented. Remaining components are currently being integrated.
