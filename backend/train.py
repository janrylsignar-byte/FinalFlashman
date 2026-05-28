"""
ML Training Pipeline for Student At-Risk Prediction
Compares 5 algorithms and selects the best performing model automatically.
"""
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split, StratifiedKFold, cross_val_score
from sklearn.preprocessing import StandardScaler
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier
from sklearn.svm import SVC
from sklearn.neighbors import KNeighborsClassifier
from sklearn.naive_bayes import GaussianNB
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score
import joblib
import os
from datetime import datetime
from imblearn.over_sampling import SMOTE

# Feature categories and weights
CATEGORY_WEIGHTS = {
    "academic": 0.50,
    "personal": 0.30,
    "financial": 0.20
}

FEATURE_CATEGORIES = {
    "gpa": "academic",
    "failed_subjects": "academic",
    "gpa_trend": "academic",
    "study_habits": "personal",
    "time_management": "personal",
    "lms_engagement": "personal",
    "attendance": "personal",
    "motivation": "personal",
    "assignment_completion": "personal",
    "class_participation": "personal",
    "family_income_level": "financial",
    "scholarship_status": "financial",
    "working_student": "financial",
    "transportation_difficulty": "financial"
}

FEATURE_ORDER = [
    "gpa", "failed_subjects", "gpa_trend",
    "study_habits", "time_management", "lms_engagement", "attendance", 
    "motivation", "assignment_completion", "class_participation",
    "family_income_level", "scholarship_status", "working_student", "transportation_difficulty"
]


def generate_synthetic_data(n_samples=1000, random_seed=123):
    """
    Generate synthetic training data for demonstration.
    In production, this would load real data from Supabase.
    """
    np.random.seed(random_seed)
    
    data = []
    for i in range(n_samples):
        # Academic features
        gpa = np.random.uniform(1.0, 5.0)
        failed_subjects = np.random.randint(0, 6)
        gpa_trend = np.random.choice([1, 2, 3], p=[0.3, 0.4, 0.3])  # 1=declining, 2=stable, 3=improving
        
        # Personal features (Likert 1-5)
        personal = np.random.randint(1, 6, size=7)
        study_habits, time_management, lms_engagement, attendance, motivation, assignment_completion, class_participation = personal
        
        # Financial features
        family_income_level = np.random.choice([1, 2, 3], p=[0.4, 0.4, 0.2])  # 1=low, 2=medium, 3=high
        scholarship_status = np.random.choice([0, 1], p=[0.6, 0.4])  # 0=no, 1=yes
        working_student = np.random.choice([0, 1], p=[0.7, 0.3])  # 0=no, 1=yes
        transportation_difficulty = np.random.randint(1, 6)
        
        # Calculate risk label based on features
        # Lower GPA, more failed subjects, declining trend = higher risk
        # Lower personal scores = higher risk
        # Lower income, no scholarship, working student, transportation issues = higher risk
        
        academic_score = (gpa / 5.0) * 0.4 + ((5 - failed_subjects) / 5.0) * 0.3 + (gpa_trend / 3.0) * 0.3
        personal_score = np.mean([study_habits, time_management, lms_engagement, attendance, 
                                  motivation, assignment_completion, class_participation]) / 5.0
        financial_score = (family_income_level / 3.0) * 0.4 + (scholarship_status * 0.3) + ((1 - working_student) * 0.2) + ((6 - transportation_difficulty) / 5.0) * 0.1
        
        # Weighted combination
        combined_score = (academic_score * CATEGORY_WEIGHTS["academic"] + 
                         personal_score * CATEGORY_WEIGHTS["personal"] + 
                         financial_score * CATEGORY_WEIGHTS["financial"])
        
        # Determine label: 0 = Good Standing, 1 = At-Risk
        label = 0 if combined_score >= 0.6 else 1
        
        data.append({
            "gpa": gpa,
            "failed_subjects": failed_subjects,
            "gpa_trend": gpa_trend,
            "study_habits": study_habits,
            "time_management": time_management,
            "lms_engagement": lms_engagement,
            "attendance": attendance,
            "motivation": motivation,
            "assignment_completion": assignment_completion,
            "class_participation": class_participation,
            "family_income_level": family_income_level,
            "scholarship_status": scholarship_status,
            "working_student": working_student,
            "transportation_difficulty": transportation_difficulty,
            "label": label
        })
    
    return pd.DataFrame(data)


def train_model(X_train, y_train, algorithm, random_seed=123):
    """Train a specific ML algorithm"""
    
    # Apply SMOTE for class balancing
    try:
        smote = SMOTE(random_state=random_seed, k_neighbors=min(5, len(X_train) - 1))
        X_train_balanced, y_train_balanced = smote.fit_resample(X_train, y_train)
    except:
        X_train_balanced, y_train_balanced = X_train, y_train
    
    if algorithm == 'Decision Tree':
        model = DecisionTreeClassifier(
            random_state=random_seed,
            max_depth=5,
            min_samples_split=10,
            min_samples_leaf=5,
            max_features='sqrt'
        )
        model.fit(X_train_balanced, y_train_balanced)
    
    elif algorithm == 'Random Forest':
        model = RandomForestClassifier(
            n_estimators=50,
            random_state=random_seed,
            max_depth=5,
            min_samples_split=8,
            min_samples_leaf=4,
            max_features='sqrt'
        )
        model.fit(X_train_balanced, y_train_balanced)
    
    elif algorithm == 'SVM':
        model = SVC(
            probability=True,
            random_state=random_seed,
            C=1.0,
            gamma='scale',
            kernel='rbf',
            class_weight='balanced'
        )
        model.fit(X_train_balanced, y_train_balanced)
    
    elif algorithm == 'KNN':
        model = KNeighborsClassifier(
            n_neighbors=min(12, len(X_train_balanced) - 1),
            weights='uniform'
        )
        model.fit(X_train_balanced, y_train_balanced)
    
    elif algorithm == 'Naive Bayes':
        model = GaussianNB(var_smoothing=1e-9)
        X_train_noisy = X_train_balanced + np.random.normal(0, 0.05, X_train_balanced.shape)
        model.fit(X_train_noisy, y_train_balanced)
    
    else:
        raise ValueError(f"Unknown algorithm: {algorithm}")
    
    return model


def evaluate_model(model, X_test, y_test):
    """Evaluate model and return metrics"""
    y_pred = model.predict(X_test)
    
    metrics = {
        'accuracy': accuracy_score(y_test, y_pred),
        'precision': precision_score(y_test, y_pred, average='weighted', zero_division=0),
        'recall': recall_score(y_test, y_pred, average='weighted', zero_division=0),
        'f1_score': f1_score(y_test, y_pred, average='weighted', zero_division=0),
    }
    
    # ROC AUC
    try:
        if hasattr(model, 'predict_proba'):
            y_proba = model.predict_proba(X_test)
            metrics['roc_auc'] = roc_auc_score(y_test, y_proba[:, 1] if y_proba.shape[1] == 2 else y_proba, multi_class='ovr')
        else:
            metrics['roc_auc'] = 0.5
    except:
        metrics['roc_auc'] = 0.5
    
    return metrics


def train_and_select_best_model(n_samples=1000, random_seed=123):
    """
    Train all models and select the best performing one.
    Returns the best model and evaluation results.
    """
    print("=" * 60)
    print("Student At-Risk Prediction - ML Training Pipeline")
    print("=" * 60)
    
    # Generate or load data
    print(f"\n[1/6] Generating synthetic training data ({n_samples} samples)...")
    df = generate_synthetic_data(n_samples, random_seed)
    print(f"      Data shape: {df.shape}")
    print(f"      Class distribution: {df['label'].value_counts().to_dict()}")
    
    # Prepare features
    print(f"\n[2/6] Preparing features...")
    X = df[FEATURE_ORDER].values
    y = df['label'].values
    
    # Train/test split
    print(f"\n[3/6] Splitting data (70/30 train-test)...")
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.3, random_state=random_seed, stratify=y
    )
    print(f"      Train: {len(X_train)} samples | Test: {len(X_test)} samples")
    
    # Scale features
    print(f"\n[4/6] Scaling features...")
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    # Train models
    algorithms = ['Decision Tree', 'Random Forest', 'SVM', 'KNN', 'Naive Bayes']
    results = []
    
    print(f"\n[5/6] Training models...")
    for algo in algorithms:
        print(f"      Training {algo}...", end=" ")
        model = train_model(X_train_scaled, y_train, algo, random_seed)
        metrics = evaluate_model(model, X_test_scaled, y_test)
        
        # Cross-validation
        cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=random_seed)
        cv_scores = cross_val_score(model, X_train_scaled, y_train, cv=cv, scoring='accuracy')
        
        results.append({
            'algorithm': algo,
            **metrics,
            'cv_accuracy_mean': float(cv_scores.mean()),
            'cv_accuracy_std': float(cv_scores.std())
        })
        print(f"✓ F1: {metrics['f1_score']:.4f}")
    
    # Select best model based on F1 score
    print(f"\n[6/6] Selecting best model...")
    results_sorted = sorted(results, key=lambda x: x['f1_score'], reverse=True)
    best_result = results_sorted[0]
    
    print(f"\n{'=' * 60}")
    print("MODEL COMPARISON RESULTS")
    print(f"{'=' * 60}")
    print(f"{'Algorithm':<20} {'Accuracy':<10} {'Precision':<10} {'Recall':<10} {'F1 Score':<10} {'ROC AUC':<10}")
    print(f"{'-' * 60}")
    for r in results_sorted:
        print(f"{r['algorithm']:<20} {r['accuracy']:<10.4f} {r['precision']:<10.4f} {r['recall']:<10.4f} {r['f1_score']:<10.4f} {r['roc_auc']:<10.4f}")
    
    print(f"\n{'=' * 60}")
    print(f"BEST MODEL: {best_result['algorithm']}")
    print(f"F1 Score: {best_result['f1_score']:.4f}")
    print(f"Accuracy: {best_result['accuracy']:.4f}")
    print(f"{'=' * 60}")
    
    # Retrain best model on full training set
    print(f"\nRetraining best model on full training set...")
    best_model = train_model(X_train_scaled, y_train, best_result['algorithm'], random_seed)
    
    # Save model and scaler
    os.makedirs("backend/models", exist_ok=True)
    joblib.dump(best_model, "backend/models/best_model.pkl")
    joblib.dump(scaler, "backend/models/scaler.pkl")
    print(f"Model saved to: backend/models/best_model.pkl")
    print(f"Scaler saved to: backend/models/scaler.pkl")
    
    return best_model, scaler, results_sorted


if __name__ == "__main__":
    # Train and select best model
    best_model, scaler, results = train_and_select_best_model(
        n_samples=1000,
        random_seed=123
    )
    
    print("\n✓ Training complete!")
    print("✓ Ready for predictions!")
