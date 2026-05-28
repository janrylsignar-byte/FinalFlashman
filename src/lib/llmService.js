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

  // Generate recommendations based on user role and highest contributing category
  const recommendations = [];
  const contributions = categoryContributions || { academic: 0, personal: 0, financial: 0 };

  // Find the highest contributing category
  const highestCategory = Object.entries(contributions).sort((a, b) => b[1] - a[1])[0][0];

  if (userRole === 'admin' || userRole === 'dean') {
    // Admin/Dean recommendations (administrative actions)
    if (highestCategory === 'personal' && contributions.personal > 0) {
      recommendations.push('Schedule a meeting with the student to discuss personal challenges');
      recommendations.push('Refer student to campus counseling services');
      recommendations.push('Assign a peer mentor for academic and personal support');
      recommendations.push('Monitor student attendance and engagement');
      recommendations.push('Coordinate with academic advisor for regular check-ins');
    } else if (highestCategory === 'financial' && contributions.financial > 0) {
      recommendations.push('Connect student with financial aid office for assistance');
      recommendations.push('Review available scholarship programs and facilitate application');
      recommendations.push('Explore on-campus work-study opportunities');
      recommendations.push('Coordinate with student affairs for emergency financial support');
      recommendations.push('Schedule financial literacy workshop attendance');
    } else if (highestCategory === 'academic' && contributions.academic > 0) {
      recommendations.push('Assign peer tutor for struggling subjects');
      recommendations.push('Schedule mandatory academic advising session');
      recommendations.push('Coordinate with instructors for academic intervention');
      recommendations.push('Review and adjust course load if necessary');
      recommendations.push('Monitor academic progress weekly');
    } else {
      // Default admin recommendations
      recommendations.push('Schedule meeting with student to discuss concerns');
      recommendations.push('Coordinate with academic advisor for support plan');
      recommendations.push('Monitor student progress and engagement');
      recommendations.push('Connect with appropriate campus resources');
      recommendations.push('Document intervention plan and follow-up schedule');
    }
  } else {
    // Student recommendations (personal actions)
    if (highestCategory === 'personal' && contributions.personal > 0) {
      recommendations.push('Improve study habits through structured scheduling');
      recommendations.push('Attend time management training workshops');
      recommendations.push('Join peer study groups for accountability');
      recommendations.push('Schedule counseling session for personal support');
      recommendations.push('Set up regular check-ins with academic advisor');
    } else if (highestCategory === 'financial' && contributions.financial > 0) {
      recommendations.push('Apply for scholarship assistance programs');
      recommendations.push('Explore financial aid options with the financial aid office');
      recommendations.push('Consider on-campus student job opportunities');
      recommendations.push('Consult with financial aid office for budget planning');
      recommendations.push('Research emergency grant programs if needed');
    } else if (highestCategory === 'academic' && contributions.academic > 0) {
      recommendations.push('Enroll in tutoring support for struggling subjects');
      recommendations.push('Schedule academic advising session');
      recommendations.push('Develop a structured study plan with regular milestones');
      recommendations.push('Consider joining peer study groups');
      recommendations.push('Meet with instructors during office hours');
    } else {
      // Default student recommendations
      recommendations.push('Meet with academic advisor to discuss concerns');
      recommendations.push('Utilize campus resources (tutoring, counseling, financial aid)');
      recommendations.push('Develop a structured study schedule');
      recommendations.push('Connect with peer support groups');
      recommendations.push('Set achievable short-term academic goals');
    }
  }

  return {
    explanation,
    recommendations: recommendations.slice(0, 5)
  };
}
