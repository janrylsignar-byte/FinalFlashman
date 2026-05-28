# Algorithm Performance Test Results Template

## Table 1: Algorithm Performance Comparison

| Algorithm | Accuracy | Precision | Recall | F1-Score | AUC |
|-----------|----------|-----------|--------|----------|-----|
| Random Forest | 0.85 | 0.87 | 0.83 | 0.85 | 0.91 |
| Support Vector Machine | 0.88 | 0.89 | 0.87 | 0.88 | 0.93 |
| K-Nearest Neighbors | 0.82 | 0.84 | 0.80 | 0.82 | 0.89 |
| Decision Tree | 0.90 | 0.91 | 0.89 | 0.90 | 0.95 |
| Naive Bayes | 0.86 | 0.88 | 0.84 | 0.86 | 0.92 |

**Table 1 Description:** This table presents the comparative performance of five machine learning algorithms evaluated on the student risk prediction dataset. Each algorithm was trained using 5-fold cross-validation, and the reported values represent the mean performance across all folds. The metrics include accuracy (overall correctness), precision (ability to correctly identify at-risk students), recall (ability to identify all at-risk students), F1-score (harmonic mean of precision and recall), and AUC (area under the ROC curve).

---

## Metric Descriptions

### Accuracy
- **Definition:** The proportion of correct predictions (both true positives and true negatives) among the total number of cases examined.
- **Formula:** Accuracy = (TP + TN) / (TP + TN + FP + FN)
- **Interpretation:** Higher accuracy indicates better overall classification performance. However, accuracy can be misleading in imbalanced datasets.

### Precision
- **Definition:** The proportion of positive predictions that are actually correct (true positives).
- **Formula:** Precision = TP / (TP + FP)
- **Interpretation:** Higher precision means fewer false positives. Important when the cost of false alarms is high.

### Recall (Sensitivity)
- **Definition:** The proportion of actual positive cases that are correctly identified.
- **Formula:** Recall = TP / (TP + FN)
- **Interpretation:** Higher recall means fewer false negatives. Critical when missing at-risk students is costly.

### F1-Score
- **Definition:** The harmonic mean of precision and recall, providing a single metric that balances both concerns.
- **Formula:** F1 = 2 × (Precision × Recall) / (Precision + Recall)
- **Interpretation:** Useful when you need a balance between precision and recall, especially with imbalanced classes.

### AUC (Area Under the ROC Curve)
- **Definition:** The area under the Receiver Operating Characteristic curve, which plots true positive rate against false positive rate at various threshold settings.
- **Interpretation:** AUC ranges from 0 to 1, where 0.5 represents random guessing and 1.0 represents perfect classification. Values above 0.8 indicate good discrimination ability.


---

## Table 2: Detailed Performance by Risk Category

| Algorithm | Good Standing Precision | Good Standing Recall | At-Risk Precision | At-Risk Recall | Overall F1-Score |
|-----------|------------------------|---------------------|-------------------|----------------|------------------|
| Random Forest | 0.92 | 0.88 | 0.82 | 0.83 | 0.85 |
| Support Vector Machine | 0.94 | 0.90 | 0.85 | 0.87 | 0.88 |
| K-Nearest Neighbors | 0.89 | 0.85 | 0.78 | 0.80 | 0.82 |
| Decision Tree | 0.95 | 0.92 | 0.88 | 0.89 | 0.90 |
| Naive Bayes | 0.93 | 0.89 | 0.84 | 0.85 | 0.86 |

**Table 2 Description:** This table provides a detailed breakdown of algorithm performance by risk category (Good Standing vs. At-Risk). The per-class precision and recall metrics reveal how well each algorithm performs on each class independently, which is particularly important for imbalanced datasets where overall accuracy may not reflect true performance on the minority class (At-Risk students).



## Table 3: Cross-Validation Results

| Algorithm | Fold 1 | Fold 2 | Fold 3 | Fold 4 | Fold 5 | Mean ± Std Dev |
|-----------|--------|--------|--------|--------|--------|----------------|
| Random Forest | 0.84 | 0.86 | 0.85 | 0.83 | 0.87 | 0.85 ± 0.015 |
| Support Vector Machine | 0.87 | 0.89 | 0.88 | 0.86 | 0.90 | 0.88 ± 0.015 |
| K-Nearest Neighbors | 0.81 | 0.83 | 0.82 | 0.80 | 0.84 | 0.82 ± 0.015 |
| Decision Tree | 0.89 | 0.91 | 0.90 | 0.88 | 0.92 | 0.90 ± 0.015 |
| Naive Bayes | 0.85 | 0.87 | 0.86 | 0.84 | 0.88 | 0.86 ± 0.015 |

**Table 3 Description:** This table shows the accuracy of each algorithm across 5-fold cross-validation. The mean and standard deviation provide insight into both the average performance and the consistency of the algorithm across different data splits. Lower standard deviation indicates more stable performance.

---

## Table 4: Feature Importance Analysis

| Feature | Importance Score | Description |
|---------|------------------|-------------|
| GPA | 0.25 | Student's grade point average, a strong indicator of academic performance |
| Failed Subjects | 0.15 | Number of failed subjects, indicates academic struggles |
| GPA Trend | 0.10 | Trend in GPA over time (improving, stable, declining) |
| Study Habits | 0.09 | Self-reported study habits on Likert scale (1-5) |
| Time Management | 0.08 | Self-reported time management skills on Likert scale (1-5) |
| LMS Engagement | 0.07 | Level of engagement with learning management system |
| Attendance | 0.07 | Class attendance rate on Likert scale (1-5) |
| Motivation | 0.06 | Student motivation level on Likert scale (1-5) |
| Assignment Completion | 0.05 | Rate of assignment completion on Likert scale (1-5) |
| Class Participation | 0.04 | Level of participation in class on Likert scale (1-5) |
| Family Income Level | 0.04 | Family income level (low, medium, high) |
| Scholarship Status | 0.03 | Whether student has scholarship (yes/no) |
| Working Student | 0.02 | Whether student is working while studying (yes/no) |
| Transportation Difficulty | 0.01 | Transportation difficulty level on Likert scale (1-5) |

**Table 4 Description:** This table presents the feature importance scores derived from the best-performing algorithm (Decision Tree). The importance scores indicate how much each feature contributes to the prediction, with higher scores indicating greater influence. These insights help educators understand which factors are most predictive of student risk in the KOSA system.

---

## Usage Instructions

1. **Replace placeholder data** with your actual algorithm performance results
2. **Adjust the number of algorithms** in the comparison as needed
3. **Modify metric descriptions** if your study uses different or additional metrics
4. **Update table descriptions** to reflect your specific experimental setup
5. **Add or remove tables** based on your manuscript requirements
6. **Ensure consistent formatting** with your journal or conference guidelines
7. **Include appropriate citations** if referencing standard metrics or methodologies

---

## Additional Notes

- **Sample Size:** Specify the number of students in your dataset
- **Cross-Validation:** Mention the type of cross-validation used (k-fold, stratified, etc.)
- **Hyperparameter Tuning:** Describe if and how hyperparameters were optimized
- **Computational Environment:** Specify hardware/software specifications if relevant
- **Statistical Tests:** Indicate which statistical tests were used for significance testing
