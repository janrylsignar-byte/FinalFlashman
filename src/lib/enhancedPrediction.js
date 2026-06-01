// Enhanced prediction logic with categorized risk analysis
// Categories: Financial, Personal, Academic

export function analyzeFinancialRisk(student) {
  const familyIncome = student.family_income || 0;
  const hasScholarship = student.scholarship === 'yes';
  const scholarshipAmount = student.scholarship_amount || 0;

  const isAtRisk = familyIncome < 25000 && !hasScholarship;
  const riskScore = isAtRisk ? 1 : 0;

  return {
    category: 'Financial',
    isAtRisk,
    riskScore,
    factors: {
      familyIncome,
      hasScholarship,
      scholarshipAmount,
    },
    explanation: isAtRisk
      ? `Student is at financial risk with family income of ₱${familyIncome.toLocaleString()} below the ₱20,000 threshold. No scholarship support detected.`
      : `Student has adequate financial support (₱${familyIncome.toLocaleString()})${hasScholarship ? ' with scholarship assistance' : ''}.`,
  };
}

export function analyzePersonalRisk(student) {
  // Personal survey questions (Likert scale 1-5, where 5 is best)
  // 15 personal variables + 8 learning resources/facilities = 23 total
  const personalVariables = [
    // Personal (15)
    student.like_course || 3,
    student.interested_in_subjects || 3,
    student.course_motivates || 3,
    student.satisfied_with_performance || 3,
    student.previous_grades_affect || 3,
    student.try_improve_grades || 3,
    student.study_regularly || 3,
    student.submit_on_time || 3,
    student.manage_time_well || 3,
    student.instructors_explain_clearly || 3,
    student.approach_instructors || 3,
    student.instructors_encourage || 3,
    student.classmates_influence_positively || 3,
    student.work_well_with_classmates || 3,
    student.friends_motivate || 3,
    // Learning Resources and Facilities (8)
    student.classrooms_comfortable || 3,
    student.facilities_help_focus || 3,
    student.environment_motivates_attendance || 3,
    student.computer_labs_support_studies || 3,
    student.facilities_affect_participation || 3,
    student.furniture_adequate || 3,
    student.classrooms_need_improvements || 3,
    student.learning_equipment_helps_performance || 3,
  ];

  const overallAvg = personalVariables.reduce((a, b) => a + b, 0) / personalVariables.length;

  // Scale: 5 = strongly agree (good), 1 = strongly disagree (bad)
  // Below 3 = disagree (bad/at-risk), 3 or above = agree (good)
  const isAtRisk = overallAvg < 3;
  const riskScore = isAtRisk ? 1 : 0;

  // Generate strengths and weaknesses based on individual variable values
  const strengths = [];
  const weaknesses = [];
  const variableNames = [
    'like_course', 'interested_in_subjects', 'course_motivates', 'satisfied_with_performance',
    'previous_grades_affect', 'try_improve_grades', 'study_regularly', 'submit_on_time',
    'manage_time_well', 'instructors_explain_clearly', 'approach_instructors', 'instructors_encourage',
    'classmates_influence_positively', 'work_well_with_classmates', 'friends_motivate',
    'classrooms_comfortable', 'facilities_help_focus', 'environment_motivates_attendance',
    'computer_labs_support_studies', 'facilities_affect_participation', 'furniture_adequate',
    'classrooms_need_improvements', 'learning_equipment_helps_performance'
  ];

  personalVariables.forEach((value, index) => {
    if (value >= 4) {
      strengths.push({ name: variableNames[index], avg: value });
    } else if (value <= 2) {
      weaknesses.push({ name: variableNames[index], avg: value });
    }
  });

  return {
    category: 'Personal',
    isAtRisk,
    riskScore,
    factors: {
      overallAvg,
      personalValues: personalVariables,
    },
    strengths,
    weaknesses,
    explanation: isAtRisk
      ? `Student shows overall personal risk (average: ${overallAvg.toFixed(1)}/5). Weak areas: ${weaknesses.map(w => w.name).join(', ')}.`
      : `Student shows good personal standing (average: ${overallAvg.toFixed(1)}/5).${weaknesses.length > 0 ? ` Areas for improvement: ${weaknesses.map(w => w.name).join(', ')}.` : ''}`,
  };
}

export function analyzeAcademicRisk(student, studentGrades = []) {
  // Calculate GPA from individual semester columns
  const gpaValues = [
    student.gpa_y1s1,
    student.gpa_y1s2,
    student.gpa_y2s1,
    student.gpa_y2s2,
    student.gpa_y3s1,
  ].filter(gpa => gpa && gpa > 0);

  const avgGpa = gpaValues.length > 0
    ? gpaValues.reduce((a, b) => a + b, 0) / gpaValues.length
    : null;

  // Also check from gpa_history if available
  const gpaHistory = student.gpa_history || [];
  const historyGpa = gpaHistory.length > 0
    ? gpaHistory.reduce((sum, h) => sum + (h.gpa || 0), 0) / gpaHistory.length
    : null;

  const finalGpa = avgGpa || historyGpa;

  // Philippine grading scale: 1.0 = highest, 3.0 = passing, 5.0 = failed
  // Check if any individual GPA is >= 2.50
  const hasGpaAtRisk = gpaValues.some(gpa => gpa >= 2.5);
  const isAtRisk = hasGpaAtRisk || (finalGpa !== null && finalGpa >= 2.5);
  const riskScore = isAtRisk ? 1 : 0;

  // Check for failing subjects (grade > 3.0)
  const failingSubjects = studentGrades.filter(g => g.grade > 3.0);
  const hasFailingSubjects = failingSubjects.length > 0;

  // Count number of GPA inputs
  const gpaInputCount = gpaValues.length;

  return {
    category: 'Academic',
    isAtRisk: isAtRisk || hasFailingSubjects,
    riskScore: (isAtRisk ? 1 : 0) + (hasFailingSubjects ? 1 : 0),
    factors: {
      avgGpa: finalGpa,
      gpaValues,
      gpaInputCount,
      failingSubjects: failingSubjects.length,
      totalSubjects: studentGrades.length,
    },
    explanation: isAtRisk
      ? `Student is at academic risk with GPA of ${finalGpa?.toFixed(2)} (threshold: 2.5).${hasFailingSubjects ? ` Has ${failingSubjects.length} failing subject(s).` : ''}`
      : `Student has good academic standing with GPA of ${finalGpa?.toFixed(2) || 'N/A'}.${hasFailingSubjects ? ` However, has ${failingSubjects.length} failing subject(s) requiring attention.` : ''}`,
  };
}

export function calculateOverallRisk(financial, personal, academic) {
  const totalRiskScore = financial.riskScore + personal.riskScore + academic.riskScore;
  const maxRiskScore = 4; // Financial (1) + Personal (1) + Academic (2)

  const riskPercentage = (totalRiskScore / maxRiskScore) * 100;

  let overallResult;
  if (riskPercentage >= 60) {
    overallResult = 'At-Risk';
  } else if (riskPercentage >= 30) {
    overallResult = 'At-Risk';
  } else {
    overallResult = 'Good Standing';
  }

  // Calculate category contributions based on actual student data
  // Category weights are applied internally, but final percentages are based on actual risk indicators
  const CATEGORY_WEIGHTS = {
    academic: 0.50,
    personal: 0.30,
    financial: 0.20
  };

  // Calculate raw risk contribution for each category based on actual risk scores
  // If a category has no risk (riskScore = 0), it contributes 0% to the At-Risk classification
  const rawFinancialContribution = financial.riskScore * CATEGORY_WEIGHTS.financial;

  // New personal contribution logic based on average of all 23 variables
  let rawPersonalContribution = 0;
  const overallAvg = personal.factors?.overallAvg;

  if (personal.riskScore > 0 && overallAvg !== null) {
    if (overallAvg < 3) {
      // Average below 3: full 30% contribution
      rawPersonalContribution = 0.30;
    } else if (overallAvg >= 3 && overallAvg <= 5) {
      // Average 3-5: scale down proportionally
      // Scale: 3.0 = 30%, 5.0 = 0%
      const avgRatio = (5 - overallAvg) / 2; // Normalized from 3-5 to 1-0
      rawPersonalContribution = 0.30 * avgRatio;
    }
  } else {
    // No personal risk or no data: use original weight
    rawPersonalContribution = personal.riskScore * CATEGORY_WEIGHTS.personal;
  }

  // New academic contribution logic based on individual GPA values
  let rawAcademicContribution = 0;
  const gpaValues = academic.factors?.gpaValues || [];
  const gpaInputCount = academic.factors?.gpaInputCount || 1;

  if (academic.riskScore > 0 && gpaValues.length > 0) {
    // Calculate contribution for each GPA input
    // Base percentage per input = 50% / number of inputs
    const basePercentagePerInput = 0.50 / gpaInputCount;

    gpaValues.forEach(gpa => {
      if (gpa >= 2.50) {
        // GPA 2.50 - 3.00: full base percentage
        rawAcademicContribution += basePercentagePerInput;
      } else if (gpa >= 1.0) {
        // GPA below 2.50: lower percentage proportional to GPA
        // Scale: 1.0 = 0%, 2.50 = 100% of base percentage
        const gpaRatio = (gpa - 1.0) / 1.5; // Normalized from 1.0-2.50 to 0-1
        rawAcademicContribution += basePercentagePerInput * gpaRatio;
      }
    });
  } else {
    // No academic risk or no GPA data: use original weight
    rawAcademicContribution = academic.riskScore * CATEGORY_WEIGHTS.academic;
  }

  const totalRawContribution = rawAcademicContribution + rawPersonalContribution + rawFinancialContribution;

  // Convert to percentages - only categories with actual risk contribute
  let categoryContributions = {
    academic: 0,
    personal: 0,
    financial: 0
  };

  if (totalRawContribution > 0) {
    categoryContributions = {
      academic: (rawAcademicContribution / totalRawContribution) * 100,
      personal: (rawPersonalContribution / totalRawContribution) * 100,
      financial: (rawFinancialContribution / totalRawContribution) * 100
    };
  }

  // For Good Standing students, set all contributions to 0 since no category contributed to risk
  if (overallResult === 'Good Standing') {
    categoryContributions = {
      academic: 0,
      personal: 0,
      financial: 0
    };
  }

  return {
    overallResult,
    riskPercentage,
    totalRiskScore,
    maxRiskScore,
    categories: { financial, personal, academic },
    categoryContributions
  };
}
