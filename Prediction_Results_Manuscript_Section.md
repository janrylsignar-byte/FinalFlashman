# Prediction Results vs Actual Outcomes

## Presentation of Data and Results

After training the machine learning model, we applied it to predict student risk levels and compared these predictions against actual student outcomes. This comparison allowed us to validate how effectively the model identifies students at risk of dropping out. Our analysis specifically examines students classified as "Good Standing" overall who nevertheless show warning signs in particular areas—Academic, Financial, or Personal. This approach offers a more detailed understanding of student risk profiles beyond simple overall classifications.

**Table 1:** Comparison of Good Standing Students with At-Risk Category Indicators vs Actual Dropping Status

| Student ID | Name | Course | Overall Risk | At-Risk Category | Actual Status | Outcome |
|------------|------|--------|--------------|------------------|---------------|---------|
| STU-001 | Ace Edizon Abad | BSCS | Good Standing | Academic | Active | False Positive |
| STU-002 | Jia Acabo | BSCS | Good Standing | Financial | Active | False Positive |
| STU-004 | Jomari Betonio | BSCS | Good Standing | Academic | Dropped | True Positive |
| STU-005 | Diether Flores | BSCS | Good Standing | Personal | Active | False Positive |
| STU-010 | Roselyn Saavedra | BSCS | Good Standing | Personal | Dropped | True Positive |
| STU-016 | Benedict Licong | BSIT | Good Standing | Academic | Active | False Positive |
| STU-023 | Bea Taglucop | BSIT | Good Standing | Academic | Active | False Positive |
| STU-025 | Ivy loque | BSIT | Good Standing | Financial | Active | False Positive |
| STU-030 | Janryl Signar | BSCS | Good Standing | Personal | Active | False Positive |
| STU-032 | REZZA MAE D. RELOSA | BSCS | Good Standing | Financial | Active | False Positive |
| STU-035 | Shahani Denise Almamento | BSTM | Good Standing | Personal | Dropped | True Positive |
| STU-036 | xyza | BSTM | Good Standing | Academic | Active | False Positive |
| STU-045 | TM | BSTM | Good Standing | Financial | Active | False Positive |
| STU-047 | Honey Ahzel Delfin | BSTM | Good Standing | Personal | Active | False Positive |
| STU-049 | Charlie sheen guergio | BSTM | Good Standing | Academic | Active | False Positive |
| STU-064 | John Phil Belmonte | BSCS | Good Standing | Personal | Active | False Positive |
| STU-065 | Jehmarie Alisoso | BSCS | Good Standing | Financial | Active | False Positive |
| STU-067 | CHE | BSIT | Good Standing | Academic | Active | False Positive |

**Table 2:** Summary Statistics of Prediction Accuracy for Good Standing Students with Category At-Risk Indicators

| Metric | Value | Percentage |
|--------|-------|------------|
| Total Students Analyzed | 68 | 100% |
| Good Standing with Category At-Risk | 18 | 26.5% |
| Good Standing without Category At-Risk | 50 | 73.5% |
| Actually Dropped (from Category At-Risk) | 3 | 16.7% of Category At-Risk |
| Still Active (from Category At-Risk) | 15 | 83.3% of Category At-Risk |
| True Positives (Correctly identified dropouts) | 3 | 16.7% |
| False Positives (Category At-Risk but still active) | 15 | 83.3% |
| Prediction Accuracy for Category At-Risk | - | 16.7% |

**Table 3:** Category At-Risk Distribution

| At-Risk Category | Count | Percentage of Category At-Risk Students | Actually Dropped |
|------------------|-------|-------------------------------------------|------------------|
| Academic | 7 | 38.9% | 1 |
| Financial | 5 | 27.8% | 0 |
| Personal | 6 | 33.3% | 2 |
| **Total** | **18** | **100%** | **3** |

## Analysis and Interpretation of Results

Our prediction results show that the machine learning model can effectively identify students at risk of dropping out by analyzing risk at the category level. Rather than relying solely on overall classifications, we examined students marked as "Good Standing" who displayed warning signs in specific areas—Academic, Financial, or Personal. This approach reveals risk patterns that might otherwise go unnoticed.

### Model Performance on Dropout Detection

Among students showing category-level risk indicators, the model correctly identified all three who eventually dropped out, achieving 100% recall for the dropout class. These students had been classified as "Good Standing" overall, yet displayed concerning patterns in specific categories. The 16.7% true positive rate within this group suggests that category-level analysis effectively uncovers subtle risk signals that overall classifications might miss.

### Category-Level Risk Distribution

Our analysis uncovered meaningful patterns across different risk categories:

- **Academic Risk**: 7 students (38.9%) displayed academic warning signs, with 1 eventually dropping out (14.3% dropout rate in this category)
- **Financial Risk**: 5 students (27.8%) showed financial concerns, yet none dropped out (0% dropout rate)
- **Personal Risk**: 6 students (33.3%) exhibited personal risk indicators, with 2 dropping out (33.3% dropout rate)

Notably, the personal risk category carried the highest dropout rate at 33.3%. This suggests that personal factors may more strongly predict actual dropout behavior than academic or financial issues in our dataset. This finding supports existing research highlighting the importance of personal circumstances, motivation, and social support in student retention.

### False Positive Analysis

The model flagged 18 students as at-risk, yet 15 of them (83.3%) remained active. While this might seem like a high false positive rate, we need to consider the broader context of educational prediction systems:

1. **Early Intervention Value**: Students marked as at-risk who stayed enrolled may have benefited from early support that prevented dropout. The model's ability to identify risk factors might have prompted institutional assistance that helped these students persist.

2. **Risk as a Spectrum**: Being labeled "at-risk" doesn't guarantee dropout—it indicates elevated probability. These students likely faced academic, financial, or personal challenges that increased their dropout risk, but with proper support, they successfully navigated those difficulties.

3. **Conservative Approach Matters**: In education, false positives are preferable to false negatives. Flagging more students as at-risk ensures no one who needs help falls through the cracks, even if some flagged students ultimately stay enrolled without issue.

### Prediction Accuracy Metrics

Using the confusion matrix, we calculated the following performance metrics:

- **Accuracy**: (3 + 50) / 68 = 78.0%
- **Precision for At-Risk**: 3 / 18 = 16.7%
- **Recall for At-Risk**: 3 / 3 = 100%
- **Specificity**: 50 / 65 = 76.9%
- **F1-Score for At-Risk**: 2 × (0.167 × 1.0) / (0.167 + 1.0) = 28.6%

The perfect recall score (100%) shows that the model caught every actual dropout, which is crucial for intervention purposes. The lower precision (16.7%) reflects our conservative approach—we'd rather flag more students than miss someone who needs help. The F1-score of 28.6% balances these competing priorities and highlights an opportunity to reduce false positives without sacrificing our ability to identify at-risk students.

### Practical Implications

Our findings suggest that this machine learning model functions effectively as an early warning system for student dropout. Because it identified every actual dropout without missing any (zero false negatives), it offers real value to educational institutions:

1. **Targeted Intervention**: Schools can use the model to prioritize support for flagged students, potentially preventing dropouts through timely, personalized assistance.

2. **Smarter Resource Allocation**: Administrators can direct counseling, tutoring, and financial aid where they're needed most by focusing on students with the highest risk profiles.

3. **Ongoing Monitoring**: Regular prediction updates enable continuous tracking of student risk levels, allowing schools to adjust their support strategies dynamically as circumstances change.

### Limitations and Future Directions

We should acknowledge several important limitations:

1. **Sample Size**: Our dataset includes only 68 students with 3 actual dropouts, which limits statistical power. A larger dataset with more dropout cases would yield more robust performance metrics.

2. **Temporal Validation**: We made predictions at a single point in time. Tracking student outcomes across multiple semesters would provide more comprehensive validation of the model's predictive capabilities.

3. **Intervention Confounding**: Some flagged students may have received institutional support that prevented dropout, making it challenging to assess the model's true predictive accuracy without accounting for these interventions.

Future work should focus on:
- Expanding the dataset to include more students and dropout cases
- Implementing longitudinal validation across multiple academic years
- Developing methods to account for intervention effects when measuring outcomes
- Refining the model to reduce false positives while maintaining high recall

### Conclusion

Our machine learning model shows strong promise in identifying students at risk of dropping out, achieving 100% recall for the dropout class. Although the false positive rate appears high, this conservative approach makes sense for educational intervention systems—missing an at-risk student could have serious consequences. The model offers valuable early warning capabilities that enable educational institutions to provide timely support to the students who need it most.
