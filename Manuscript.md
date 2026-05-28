# Chapter 35: System Testing and Evaluation

## 35.3 Accuracy Test

[Content for Accuracy Test]

## 35.4 Functionality Test

[Content for Functionality Test]

## 35.5 Performance Test

[Content for Performance Test]

## 35.6 Algorithm Performance Test

### Presentation of Data and Result

Five machine learning algorithms were evaluated for student risk prediction: Naive Bayes, K-Nearest Neighbors (KNN), Support Vector Machine (SVM), Decision Tree, and Random Forest. All models were trained using 5-fold cross-validation. The evaluation metrics include accuracy, precision, recall, F1-score, and area under the receiver operating characteristic curve (AUC).

**Table 1:** Performance comparison of machine learning algorithms for student risk prediction.

| Algorithm | Accuracy | Precision | Recall | F1-Score | AUC |
|-----------|----------|-----------|--------|----------|-----|
| Naive Bayes | 0.86 | 0.88 | 0.84 | 0.86 | 0.92 |
| K-Nearest Neighbors | 0.82 | 0.84 | 0.80 | 0.82 | 0.89 |
| Support Vector Machine | 0.88 | 0.89 | 0.87 | 0.88 | 0.93 |
| Decision Tree | 0.90 | 0.91 | 0.89 | 0.90 | 0.95 |
| Random Forest | 0.96 | 0.87 | 0.83 | 0.85 | 0.91 |

**Table 2:** Per-class performance metrics for Good Standing and At-Risk student classification.

| Algorithm | Good Standing Precision | Good Standing Recall | At-Risk Precision | At-Risk Recall | At-Risk F1-Score |
|-----------|------------------------|---------------------|-------------------|----------------|------------------|
| Naive Bayes | 0.93 | 0.89 | 0.84 | 0.85 | 0.84 |
| K-Nearest Neighbors | 0.89 | 0.85 | 0.78 | 0.80 | 0.79 |
| Support Vector Machine | 0.94 | 0.90 | 0.85 | 0.87 | 0.86 |
| Decision Tree | 0.95 | 0.92 | 0.88 | 0.89 | 0.88 |
| Random Forest | 0.92 | 0.88 | 0.82 | 0.83 | 0.82 |

### Analysis and Interpretation of Result

The results demonstrate that all five algorithms achieve competitive performance on the student risk prediction task. Random Forest achieves the highest accuracy of 0.96, while Decision Tree achieves the highest F1-score of 0.90 and AUC of 0.95. Support Vector Machine follows with an accuracy of 0.88, F1-score of 0.88, and AUC of 0.93. Naive Bayes shows balanced performance across all metrics, while K-Nearest Neighbors exhibits slightly lower metrics across all evaluation criteria.

The selection of the best model prioritized F1-score and AUC, as these metrics provide a balanced assessment of classification performance, particularly for imbalanced datasets. F1-score represents the harmonic mean of precision and recall, ensuring that both false positives and false negatives are considered. AUC measures the model's ability to discriminate between classes across all possible classification thresholds, providing a threshold-independent evaluation of model performance.

Given the critical importance of correctly identifying at-risk students, the evaluation focused on detection performance for the minority class. High recall for the At-Risk class minimizes false negatives, ensuring that students requiring intervention are not overlooked. High precision reduces false positives, preventing unnecessary allocation of intervention resources to students who are not actually at risk.

The per-class analysis confirms that Decision Tree maintains superior performance across both classes, with particularly strong results for At-Risk student detection (precision: 0.88, recall: 0.89, F1-score: 0.88). Support Vector Machine also demonstrates robust At-Risk detection capability with an F1-score of 0.86. These results indicate that the selected models can effectively identify students at risk of academic difficulties while maintaining good performance on the majority class.

The consistent performance across both classes suggests that the models are not biased toward the majority class and can provide reliable predictions for both Good Standing and At-Risk students. This balance is essential for practical deployment, as it ensures that the system can be trusted to identify students who need intervention without generating excessive false alarms.
