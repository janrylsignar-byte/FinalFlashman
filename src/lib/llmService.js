// LLM Service for generating XAI explanations and recommendations
// This service uses Google Gemini API
// Temporarily disabled to use rule-based fallback due to API issues

const GEMINI_API_KEY = ''; // Set to empty to use rule-based fallback
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

export async function generateExplanationAndRecommendations(riskAnalysis, student, userRole = 'student') {
  if (!GEMINI_API_KEY) {
    // Fallback to rule-based explanations if no API key
    return generateRuleBasedExplanation(riskAnalysis, student, userRole);
  }

  try {
    const prompt = buildPrompt(riskAnalysis, student, userRole);

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `You are an academic advisor AI assistant. Provide clear, actionable, and empathetic explanations and recommendations for students at risk. Focus on decision support, not absolute solutions. Keep responses concise and practical.\n\n${prompt}`
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 500,
        }
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.candidates[0].content.parts[0].text;

    return parseLLMResponse(content);
  } catch (error) {
    console.error('LLM service error:', error);
    // Fallback to rule-based explanations
    return generateRuleBasedExplanation(riskAnalysis, student, userRole);
  }
}

function buildPrompt(riskAnalysis, student, userRole = 'student') {
  const { financial, personal, academic, overallResult, riskPercentage } = riskAnalysis;

  let prompt = `Student Risk Analysis for ${student.student_name || student.full_name || student.name || student.student_id}:\n\n`;
  prompt += `Overall Status: ${overallResult} (${riskPercentage.toFixed(0)}% risk)\n\n`;

  prompt += `FINANCIAL RISK:\n`;
  prompt += financial.isAtRisk
    ? `- Family income: ₱${financial.factors.familyIncome.toLocaleString()} (below ₱20,000 threshold)\n`
    : `- Family income: ₱${financial.factors.familyIncome.toLocaleString()} (adequate)\n`;
  prompt += `- Scholarship: ${financial.factors.hasScholarship ? 'Yes' : 'No'}\n\n`;

  prompt += `PERSONAL RISK (Survey responses 1-5 scale):\n`;
  prompt += `- Scale: 1 = strongly agree (good), 5 = strongly disagree (bad)\n`;
  prompt += `- Overall average: ${personal.overallAvg.toFixed(1)}/5\n`;
  if (personal.weaknesses.length > 0) {
    prompt += `Weak areas (3.0 and above - disagree):\n`;
    personal.weaknesses.forEach(w => {
      prompt += `  - ${w.name}: ${w.avg.toFixed(1)}/5\n`;
    });
  }
  if (personal.strengths.length > 0) {
    prompt += `Strong areas (below 3.0 - agree):\n`;
    personal.strengths.forEach(s => {
      prompt += `  - ${s.name}: ${s.avg.toFixed(1)}/5\n`;
    });
  }
  prompt += `\n`;

  prompt += `ACADEMIC RISK:\n`;
  prompt += `- Average GPA: ${academic.factors.avgGpa?.toFixed(2) || 'N/A'} (threshold: 2.5)\n`;
  prompt += `- Failing subjects: ${academic.factors.failingSubjects}/${academic.factors.totalSubjects}\n\n`;

  prompt += `Please provide:\n`;
  prompt += `1. A clear explanation of why this student is at risk (or areas of concern if good standing)\n`;
  prompt += `2. 3-5 specific, actionable recommendations to address the identified issues\n`;
  if (userRole === 'admin' || userRole === 'dean') {
    prompt += `3. Recommendations should focus on administrative actions the ${userRole} should take to support the student\n`;
  } else {
    prompt += `3. Recommendations should focus on actions the student can take to improve their situation\n`;
  }
  prompt += `4. Keep recommendations practical and focused on decision support\n\n`;

  return prompt;
}

function parseLLMResponse(content) {
  // Simple parsing - in production, you might want more sophisticated parsing
  const lines = content.split('\n').filter(line => line.trim());
  
  let explanation = '';
  let recommendations = [];
  let currentSection = 'explanation';
  
  lines.forEach(line => {
    if (line.toLowerCase().includes('recommendation') || line.toLowerCase().includes('suggestion')) {
      currentSection = 'recommendations';
    } else if (line.match(/^\d+\./) || line.startsWith('-')) {
      if (currentSection === 'recommendations') {
        recommendations.push(line.replace(/^\d+\.?\s*/, '').replace(/^-\s*/, '').trim());
      } else {
        explanation += line + ' ';
      }
    } else {
      if (currentSection === 'explanation') {
        explanation += line + ' ';
      }
    }
  });
  
  return {
    explanation: explanation.trim(),
    recommendations: recommendations.length > 0 ? recommendations : [
      'Meet with academic advisor to discuss concerns',
      'Utilize campus resources (tutoring, counseling, financial aid)',
      'Develop a structured study schedule',
      'Connect with peer support groups',
      'Set achievable short-term academic goals'
    ]
  };
}

function generateRuleBasedExplanation(riskAnalysis, student, userRole = 'student') {
  const { financial, personal, academic, overallResult, categoryContributions } = riskAnalysis;

  let explanation = '';

  if (overallResult === 'Good Standing') {
    explanation = `${student.student_name || student.full_name || student.name || student.student_id} is classified as Good Standing. The student shows positive indicators across all categories with no significant risk factors contributing to academic concerns.`;
  } else {
    // Generate explanation based on category contribution percentages
    const contributions = categoryContributions || { academic: 0, personal: 0, financial: 0 };

    // Sort categories by contribution percentage
    const sortedCategories = [
      { name: 'Academic', percent: contributions.academic },
      { name: 'Personal', percent: contributions.personal },
      { name: 'Financial', percent: contributions.financial }
    ].sort((a, b) => b.percent - a.percent);

    const topCategory = sortedCategories[0];
    const secondCategory = sortedCategories[1];
    const thirdCategory = sortedCategories[2];

    // Build explanation based on contributions
    if (topCategory.percent > 0) {
      explanation = `The student is classified as At-Risk primarily due to ${topCategory.name} factors (${topCategory.percent.toFixed(1)}%)`;

      if (secondCategory.percent > 0) {
        explanation += `, followed by ${secondCategory.name} factors (${secondCategory.percent.toFixed(1)}%)`;
      }

      if (thirdCategory.percent > 0) {
        explanation += `, and ${thirdCategory.name} factors (${thirdCategory.percent.toFixed(1)}%)`;
      } else {
        explanation += `. ${thirdCategory.name} factors did not contribute to the risk classification`;
      }

      explanation += '.';
    } else {
      explanation = `${student.student_name || student.full_name || student.name || student.student_id} is classified as At-Risk based on overall risk assessment.`;
    }
  }

  // Generate recommendations based on specific weaknesses
  const recommendations = [];
  const weaknesses = personal.weaknesses || [];
  const strengths = personal.strengths || [];

  // Mapping of weakness names to specific recommendations
  const weaknessRecommendations = {
    // Course Experience
    'like_course': ['Re-evaluate course alignment with career goals', 'Explore course options that better match interests', 'Discuss course concerns with academic advisor'],
    'interested_in_subjects': ['Find ways to connect subjects to personal interests', 'Explore real-world applications of course material', 'Join subject-related clubs or organizations'],
    'course_motivates': ['Set personal goals related to course outcomes', 'Connect with motivated peers for inspiration', 'Seek mentorship from upperclassmen in the field'],
    'satisfied_with_performance': ['Set achievable performance goals', 'Track progress regularly to build confidence', 'Celebrate small improvements'],
    // Academic Performance
    'previous_grades_affect': ['Focus on current performance rather than past grades', 'Develop growth mindset for academic improvement', 'Use past performance as learning opportunity'],
    'try_improve_grades': ['Create specific grade improvement plan', 'Utilize tutoring and academic support services', 'Meet with instructors for feedback'],
    // Learning Behavior
    'study_regularly': ['Establish consistent daily study schedule', 'Use study planner or calendar app', 'Create dedicated study space free from distractions'],
    'submit_on_time': ['Use assignment tracking system', 'Set personal deadlines before actual due dates', 'Break large assignments into smaller tasks'],
    'manage_time_well': ['Learn time management techniques (Pomodoro, time blocking)', 'Use digital tools for scheduling and reminders', 'Prioritize tasks based on importance and urgency'],
    // Instructor Interaction
    'instructors_explain_clearly': ['Ask clarifying questions during class', 'Visit instructors during office hours', 'Form study groups to discuss unclear topics'],
    'approach_instructors': ['Practice communication skills', 'Start with small questions to build confidence', 'Prepare questions before approaching instructors'],
    'instructors_encourage': ['Seek encouragement from peers and mentors', 'Build internal motivation and self-encouragement', 'Join supportive study groups'],
    // Peer Influence
    'classmates_influence_positively': ['Seek out motivated and positive peers', 'Join academic clubs and organizations', 'Participate in group study sessions'],
    'work_well_with_classmates': ['Develop teamwork and collaboration skills', 'Practice active listening in group settings', 'Take initiative in group projects'],
    'friends_motivate': ['Build relationships with academically motivated friends', 'Share goals with supportive peers', 'Create accountability partnerships'],
    // Learning Resources and Facilities
    'classrooms_comfortable': ['Report classroom comfort issues to administration', 'Use alternative study spaces when needed', 'Bring personal comfort items (cushions, etc.)'],
    'facilities_help_focus': ['Find quiet study areas on campus', 'Use noise-canceling headphones', 'Schedule study during less crowded times'],
    'environment_motivates_attendance': ['Focus on academic goals rather than environment', 'Create personal motivation system', 'Engage actively in class regardless of environment'],
    'computer_labs_support_studies': ['Utilize computer labs during available hours', 'Bring personal laptop if possible', 'Plan lab usage in advance'],
    'facilities_affect_participation': ['Speak up about facility concerns', 'Find alternative spaces for group work', 'Use online collaboration tools when facilities are limiting'],
    'furniture_adequate': ['Report furniture issues to facilities management', 'Use ergonomic study aids', 'Take regular breaks to avoid discomfort'],
    'classrooms_need_improvements': ['Provide constructive feedback to administration', 'Focus on learning despite facility limitations', 'Advocate for necessary improvements'],
    'learning_equipment_helps_performance': ['Request access to necessary equipment', 'Use library resources for equipment needs', 'Form equipment-sharing groups with classmates'],
  };

  // Financial recommendations (if financially at-risk)
  if (financial.isAtRisk) {
    if (userRole === 'admin' || userRole === 'dean') {
      recommendations.push('Prioritize financial support: Connect student with TES (Tertiary Education Subsidy) scholarship programs');
      recommendations.push('Assist with LGU (Local Government Unit) scholarship applications');
    } else {
      recommendations.push('Prioritize financial support: Apply for TES (Tertiary Education Subsidy) scholarship programs');
      recommendations.push('Apply for LGU (Local Government Unit) scholarship assistance');
    }
  }

  // Academic recommendations (if academically at-risk)
  if (academic.isAtRisk) {
    if (userRole === 'admin' || userRole === 'dean') {
      recommendations.push('Assign peer tutor for struggling subjects');
      recommendations.push('Schedule mandatory academic advising session');
    } else {
      recommendations.push('Enroll in tutoring support for struggling subjects');
      recommendations.push('Schedule academic advising session');
    }
  }

  // Generate recommendations based on specific weaknesses
  if (weaknesses.length > 0) {
    // Get recommendations for each weakness
    weaknesses.forEach(weakness => {
      const specificRecs = weaknessRecommendations[weakness.name] || [];
      specificRecs.slice(0, 1).forEach(rec => {
        if (!recommendations.includes(rec)) {
          recommendations.push(rec);
        }
      });
    });
  }

  // If no weaknesses (Good Standing), provide maintenance recommendations
  if (weaknesses.length === 0 && overallResult === 'Good Standing') {
    if (userRole === 'admin' || userRole === 'dean') {
      recommendations.push('Continue monitoring student progress and engagement');
      recommendations.push('Encourage student to maintain current study habits');
      recommendations.push('Recognize and reinforce positive behaviors');
      recommendations.push('Provide opportunities for leadership roles');
      recommendations.push('Connect student with advanced academic opportunities');
    } else {
      recommendations.push('Continue current effective study habits');
      recommendations.push('Set new academic goals to maintain momentum');
      recommendations.push('Consider peer tutoring or mentoring opportunities');
      recommendations.push('Explore advanced courses or enrichment activities');
      recommendations.push('Maintain work-life balance for sustained success');
    }
  }

  // Fill remaining recommendations with general ones if needed
  if (recommendations.length < 5) {
    if (userRole === 'admin' || userRole === 'dean') {
      if (!recommendations.includes('Monitor student progress regularly')) {
        recommendations.push('Monitor student progress regularly');
      }
      if (!recommendations.includes('Coordinate with academic advisor for support')) {
        recommendations.push('Coordinate with academic advisor for support');
      }
    } else {
      if (!recommendations.includes('Utilize campus resources for continued success')) {
        recommendations.push('Utilize campus resources for continued success');
      }
      if (!recommendations.includes('Maintain regular communication with advisors')) {
        recommendations.push('Maintain regular communication with advisors');
      }
    }
  }

  return {
    explanation,
    recommendations: recommendations.slice(0, 5)
  };
}
