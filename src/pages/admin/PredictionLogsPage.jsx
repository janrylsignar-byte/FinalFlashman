import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase as base44 } from '@/api/supabaseClient';
import PageHeader from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Eye, CheckCircle, AlertTriangle, TrendingUp, Trash2, DollarSign, User, BookOpen, Search, ChevronDown, ChevronUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { toast } from 'sonner';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { generateExplanationAndRecommendations } from '@/lib/llmService';

function PredictionVsActualOutcomes({ predictions }) {
  const { data: students = [] } = useQuery({
    queryKey: ['students'],
    queryFn: () => base44.entities.Student.list(),
  });

  // Combine predictions with student data
  const studentPredictions = students.map(student => {
    const prediction = predictions.find(p => p.student_id === student.student_id);
    return {
      ...student,
      predictedRisk: prediction?.result || 'Not Predicted',
      confidence: prediction?.confidence || 0,
      actualStatus: student.status || 'active',
    };
  });

  // Filter for at-risk predictions
  const atRiskPredictions = studentPredictions.filter(s => s.predictedRisk === 'At-Risk');
  const goodStandingPredictions = studentPredictions.filter(s => s.predictedRisk === 'Good Standing');

  // Filter for Good Standing students with category at-risk indicators
  // These are students who are Good Standing overall but have at-risk in at least one category
  const goodStandingWithCategoryRisk = studentPredictions.filter(s => {
    const prediction = predictions.find(p => p.student_id === s.student_id);
    if (!prediction || prediction.result !== 'Good Standing') return false;
    // Check if any category is at-risk
    const hasAcademicRisk = prediction.academic_risk?.isAtRisk;
    const hasFinancialRisk = prediction.financial_risk?.isAtRisk;
    const hasPersonalRisk = prediction.personal_risk?.isAtRisk;
    return hasAcademicRisk || hasFinancialRisk || hasPersonalRisk;
  });

  // Calculate actual dropouts from at-risk predictions
  const actualDropoutsFromAtRisk = atRiskPredictions.filter(s => s.actualStatus === 'dropped' || s.actualStatus === 'inactive');
  const notDroppedFromAtRisk = atRiskPredictions.filter(s => s.actualStatus === 'active' || s.actualStatus === 'enrolled');

  // Calculate actual dropouts from Good Standing with category risk
  const actualDropoutsFromCategoryRisk = goodStandingWithCategoryRisk.filter(s => s.actualStatus === 'dropped' || s.actualStatus === 'inactive');
  const notDroppedFromCategoryRisk = goodStandingWithCategoryRisk.filter(s => s.actualStatus === 'active' || s.actualStatus === 'enrolled');

  // Calculate statistics
  const totalPredicted = atRiskPredictions.length;
  const actualDropped = actualDropoutsFromAtRisk.length;
  const predictionAccuracy = totalPredicted > 0 ? ((actualDropped / totalPredicted) * 100).toFixed(1) : 0;

  // Calculate category risk statistics
  const totalCategoryRisk = goodStandingWithCategoryRisk.length;
  const actualDroppedCategoryRisk = actualDropoutsFromCategoryRisk.length;
  const categoryRiskAccuracy = totalCategoryRisk > 0 ? ((actualDroppedCategoryRisk / totalCategoryRisk) * 100).toFixed(1) : 0;

  return (
    <div className="space-y-4">
      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Students</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{students.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Good Standing with Category Risk</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-amber-600">{goodStandingWithCategoryRisk.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Actually Dropped</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{actualDroppedCategoryRisk.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Prediction Accuracy</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-emerald-600">{categoryRiskAccuracy}%</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="category-risk" className="space-y-4">
        <TabsList>
          <TabsTrigger value="category-risk">Category At-Risk</TabsTrigger>
          <TabsTrigger value="at-risk">At-Risk Predictions</TabsTrigger>
          <TabsTrigger value="good-standing">Good Standing Predictions</TabsTrigger>
          <TabsTrigger value="all">All Students</TabsTrigger>
        </TabsList>

        <TabsContent value="category-risk">
          <Card>
            <CardHeader>
              <CardTitle>Good Standing Students with Category At-Risk Indicators vs Actual Status</CardTitle>
            </CardHeader>
            <CardContent>
              {goodStandingWithCategoryRisk.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No Good Standing students with category at-risk indicators found</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Course</TableHead>
                      <TableHead>Overall Risk</TableHead>
                      <TableHead>At-Risk Category</TableHead>
                      <TableHead>Actual Status</TableHead>
                      <TableHead>Match</TableHead>
                      <TableHead>Confidence</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {goodStandingWithCategoryRisk.map((student) => {
                      const prediction = predictions.find(p => p.student_id === student.student_id);
                      const isMatch = student.actualStatus === 'dropped' || student.actualStatus === 'inactive';
                      const atRiskCategories = [];
                      if (prediction?.academic_risk?.isAtRisk) atRiskCategories.push('Academic');
                      if (prediction?.financial_risk?.isAtRisk) atRiskCategories.push('Financial');
                      if (prediction?.personal_risk?.isAtRisk) atRiskCategories.push('Personal');
                      return (
                        <TableRow key={student.student_id}>
                          <TableCell className="font-medium">{student.student_id}</TableCell>
                          <TableCell>{student.name || student.full_name}</TableCell>
                          <TableCell>{student.course}</TableCell>
                          <TableCell>
                            <Badge variant="default">Good Standing</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1 flex-wrap">
                              {atRiskCategories.map(cat => (
                                <Badge key={cat} variant="outline" className="text-xs capitalize">
                                  {cat}
                                </Badge>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={student.actualStatus === 'active' || student.actualStatus === 'enrolled' ? 'default' : 'secondary'}>
                              {student.actualStatus}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {isMatch ? (
                              <CheckCircle className="w-5 h-5 text-emerald-500" />
                            ) : (
                              <AlertTriangle className="w-5 h-5 text-destructive" />
                            )}
                          </TableCell>
                          <TableCell>{((student.confidence || 0) * 100).toFixed(0)}%</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="at-risk">
          <Card>
            <CardHeader>
              <CardTitle>Students Predicted as At-Risk vs Actual Status</CardTitle>
            </CardHeader>
            <CardContent>
              {atRiskPredictions.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No at-risk predictions found</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Course</TableHead>
                      <TableHead>Predicted Risk</TableHead>
                      <TableHead>Actual Status</TableHead>
                      <TableHead>Match</TableHead>
                      <TableHead>Confidence</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {atRiskPredictions.map((student) => {
                      const isMatch = student.actualStatus === 'dropped' || student.actualStatus === 'inactive';
                      return (
                        <TableRow key={student.student_id}>
                          <TableCell className="font-medium">{student.student_id}</TableCell>
                          <TableCell>{student.name || student.full_name}</TableCell>
                          <TableCell>{student.course}</TableCell>
                          <TableCell>
                            <Badge variant="destructive">At-Risk</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={student.actualStatus === 'active' || student.actualStatus === 'enrolled' ? 'default' : 'secondary'}>
                              {student.actualStatus}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {isMatch ? (
                              <CheckCircle className="w-5 h-5 text-emerald-500" />
                            ) : (
                              <AlertTriangle className="w-5 h-5 text-destructive" />
                            )}
                          </TableCell>
                          <TableCell>{((student.confidence || 0) * 100).toFixed(0)}%</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="good-standing">
          <Card>
            <CardHeader>
              <CardTitle>Students Predicted as Good Standing</CardTitle>
            </CardHeader>
            <CardContent>
              {goodStandingPredictions.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No good standing predictions found</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Course</TableHead>
                      <TableHead>Predicted Risk</TableHead>
                      <TableHead>Actual Status</TableHead>
                      <TableHead>Confidence</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {goodStandingPredictions.map((student) => (
                      <TableRow key={student.student_id}>
                        <TableCell className="font-medium">{student.student_id}</TableCell>
                        <TableCell>{student.name || student.full_name}</TableCell>
                        <TableCell>{student.course}</TableCell>
                        <TableCell>
                          <Badge variant="default">Good Standing</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={student.actualStatus === 'active' || student.actualStatus === 'enrolled' ? 'default' : 'secondary'}>
                            {student.actualStatus}
                          </Badge>
                        </TableCell>
                        <TableCell>{((student.confidence || 0) * 100).toFixed(0)}%</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>All Student Predictions</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Predicted Risk</TableHead>
                    <TableHead>Actual Status</TableHead>
                    <TableHead>Confidence</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {studentPredictions.map((student) => (
                    <TableRow key={student.student_id}>
                      <TableCell className="font-medium">{student.student_id}</TableCell>
                      <TableCell>{student.name || student.full_name}</TableCell>
                      <TableCell>{student.course}</TableCell>
                      <TableCell>
                        {student.predictedRisk === 'At-Risk' ? (
                          <Badge variant="destructive">At-Risk</Badge>
                        ) : student.predictedRisk === 'Good Standing' ? (
                          <Badge variant="default">Good Standing</Badge>
                        ) : (
                          <Badge variant="secondary">Not Predicted</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={student.actualStatus === 'active' || student.actualStatus === 'enrolled' ? 'default' : 'secondary'}>
                          {student.actualStatus}
                        </Badge>
                      </TableCell>
                      <TableCell>{((student.confidence || 0) * 100).toFixed(0)}%</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function PredictionDetail({ prediction, userRole = 'admin' }) {
  if (!prediction) return null;

  const [roleBasedRecommendations, setRoleBasedRecommendations] = useState([]);

  // Regenerate recommendations based on user role when component mounts or prediction changes
  React.useEffect(() => {
    const regenerateRecommendations = async () => {
      try {
        const riskAnalysis = {
          financial: prediction.financial_risk || { isAtRisk: false, factors: {} },
          personal: prediction.personal_risk || { isAtRisk: false, overallAvg: 3, weaknesses: [], strengths: [] },
          academic: prediction.academic_risk || { isAtRisk: false, factors: { avgGpa: null, failingSubjects: 0, totalSubjects: 0 } },
          overallResult: prediction.result,
          riskPercentage: prediction.risk_percentage || 0,
          categoryContributions: prediction.category_contributions || { academic: 0, personal: 0, financial: 0 }
        };

        const { recommendations } = await generateExplanationAndRecommendations(
          riskAnalysis,
          { student_name: prediction.student_name, student_id: prediction.student_id },
          userRole
        );
        setRoleBasedRecommendations(recommendations);
      } catch (error) {
        console.error('Error regenerating recommendations:', error);
        setRoleBasedRecommendations(prediction.recommendations || []);
      }
    };

    regenerateRecommendations();
  }, [prediction, userRole]);

  const featureData = prediction.feature_importance?.map(f => ({
    name: f.feature?.length > 15 ? f.feature.substring(0, 15) + '...' : f.feature,
    importance: +((f.importance || 0) * 100).toFixed(1),
  })) || [];

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-4">
        {prediction.result === 'Good Standing' ? (
          <div className="p-3 rounded-full bg-emerald-50"><CheckCircle className="w-8 h-8 text-emerald-500" /></div>
        ) : (
          <div className="p-3 rounded-full bg-destructive/10"><AlertTriangle className="w-8 h-8 text-destructive" /></div>
        )}
        <div>
          <h3 className="text-lg font-bold">{prediction.student_name || prediction.name || prediction.student_id}</h3>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant={prediction.result === 'Good Standing' ? 'default' : 'destructive'}>{prediction.result}</Badge>
            <span className="text-sm text-muted-foreground">
              {((prediction.confidence || 0) * 100).toFixed(0)}% confidence • {prediction.model_used} • {prediction.prediction_type}
            </span>
          </div>
        </div>
      </div>
      {prediction.explanation && (
        <div>
          <h4 className="font-semibold mb-1 text-sm">Explanation (XAI)</h4>
          <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">{prediction.explanation}</p>
        </div>
      )}

      {/* Categorized Risk Analysis */}
      {(prediction.financial_risk || prediction.personal_risk || prediction.academic_risk) && (
        <div>
          <h4 className="font-semibold mb-3 text-sm">Categorized Risk Analysis</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Financial Risk */}
            {prediction.financial_risk && (
              <div className={`p-3 rounded-lg ${prediction.financial_risk.isAtRisk ? 'bg-destructive/10 border border-destructive/20' : 'bg-emerald-50 border border-emerald-200'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className={`w-4 h-4 ${prediction.financial_risk.isAtRisk ? 'text-destructive' : 'text-emerald-600'}`} />
                  <span className="font-medium text-sm">Financial</span>
                </div>
                <p className="text-xs text-muted-foreground">{prediction.financial_risk.explanation}</p>
              </div>
            )}

            {/* Personal Risk */}
            {prediction.personal_risk && (
              <div className={`p-3 rounded-lg ${prediction.personal_risk.isAtRisk ? 'bg-destructive/10 border border-destructive/20' : 'bg-emerald-50 border border-emerald-200'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <User className={`w-4 h-4 ${prediction.personal_risk.isAtRisk ? 'text-destructive' : 'text-emerald-600'}`} />
                  <span className="font-medium text-sm">Personal</span>
                </div>
                <p className="text-xs text-muted-foreground">{prediction.personal_risk.explanation}</p>
              </div>
            )}

            {/* Academic Risk */}
            {prediction.academic_risk && (
              <div className={`p-3 rounded-lg ${prediction.academic_risk.isAtRisk ? 'bg-destructive/10 border border-destructive/20' : 'bg-emerald-50 border border-emerald-200'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <BookOpen className={`w-4 h-4 ${prediction.academic_risk.isAtRisk ? 'text-destructive' : 'text-emerald-600'}`} />
                  <span className="font-medium text-sm">Academic</span>
                </div>
                <p className="text-xs text-muted-foreground">{prediction.academic_risk.explanation}</p>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h4 className="font-semibold mb-2 text-emerald-600 text-sm">Strengths</h4>
          <ul className="space-y-1">
            {prediction.strengths?.map((s, i) => (
              <li key={i} className="text-sm flex items-start gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500 mt-0.5 flex-shrink-0" />{s}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-2 text-destructive text-sm">Weaknesses</h4>
          <ul className="space-y-1">
            {prediction.weaknesses?.map((w, i) => (
              <li key={i} className="text-sm flex items-start gap-2">
                <AlertTriangle className="w-3.5 h-3.5 text-destructive mt-0.5 flex-shrink-0" />{w}
              </li>
            ))}
          </ul>
        </div>
      </div>
      {roleBasedRecommendations?.length > 0 && (
        <div>
          <h4 className="font-semibold mb-2 text-sm">Recommendations ({userRole === 'admin' || userRole === 'dean' ? 'For ' + userRole : 'For Student'})</h4>
          <div className="space-y-1">
            {roleBasedRecommendations.map((r, i) => (
              <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-primary/5">
                <TrendingUp className="w-3.5 h-3.5 text-primary mt-0.5 flex-shrink-0" />
                <p className="text-sm">{r}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      {featureData.length > 0 && (
        <div>
          <h4 className="font-semibold mb-2 text-sm">Feature Importance (XAI)</h4>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={featureData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis type="number" domain={[0, 100]} fontSize={10} />
              <YAxis type="category" dataKey="name" fontSize={10} width={110} />
              <Tooltip />
              <Bar dataKey="importance" fill="hsl(var(--accent))" radius={[0, 3, 3, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

function PSAStatisticsButton() {
  const [open, setOpen] = useState(false);

  const psaData = [
    { incomeRange: 'Below ₱10,000', percentage: 8.7, households: '2.3 million' },
    { incomeRange: '₱10,000 - ₱19,999', percentage: 12.5, households: '3.3 million' },
    { incomeRange: '₱20,000 - ₱29,999', percentage: 14.2, households: '3.7 million' },
    { incomeRange: '₱30,000 - ₱39,999', percentage: 13.8, households: '3.6 million' },
    { incomeRange: '₱40,000 - ₱59,999', percentage: 16.5, households: '4.3 million' },
    { incomeRange: '₱60,000 - ₱99,999', percentage: 15.3, households: '4.0 million' },
    { incomeRange: '₱100,000 and above', percentage: 19.0, households: '5.0 million' },
  ];

  return (
    <>
      <Button
        size="sm"
        variant="outline"
        onClick={() => setOpen(true)}
        className="text-xs"
      >
        <TrendingUp className="w-3 h-3 mr-1" />
        PSA Stats
      </Button>
      
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-amber-600" />
              PSA Philippines: Family Income Statistics (Latest Survey)
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <p className="text-sm text-amber-800">
                <strong>Source:</strong> Philippine Statistics Authority (PSA) - Family Income and Expenditure Survey (FIES)
              </p>
              <p className="text-xs text-amber-700 mt-1">
                Data represents monthly family income distribution across Philippine households
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-sm">Monthly Family Income Distribution</h4>
              {psaData.map((item, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{item.incomeRange}</span>
                    <span className="text-muted-foreground">{item.percentage}% ({item.households} households)</span>
                  </div>
                  <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-amber-400 to-amber-600" 
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-muted/50 border rounded-lg p-4">
              <h4 className="font-semibold text-sm mb-2">Key Findings</h4>
              <ul className="space-y-1 text-xs text-muted-foreground">
                <li>• Average monthly family income: ₱30,000 - ₱35,000</li>
                <li>• Approximately 35.4% of families earn below ₱30,000 per month</li>
                <li>• <strong>Below minimum wage earners:</strong> ~21.2% of families earn below ₱20,000 per month</li>
                <li>• Top 20% of households earn ₱100,000 or more monthly</li>
                <li>• Regional variations exist, with NCR having higher average incomes</li>
                <li>• Income inequality remains a challenge with Gini coefficient around 0.44</li>
              </ul>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-sm mb-2 text-blue-800">Context for Student Financial Risk</h4>
              <p className="text-xs text-blue-700">
                Students from families earning below ₱25,000 per month (approximately 25% of households) 
                are considered financially at-risk. This threshold aligns with PSA data showing significant 
                portion of Filipino families in lower income brackets who may struggle with educational expenses.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function CategoryBreakdownDetail({ prediction }) {
  const [open, setOpen] = useState(false);
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch student data when dialog opens
  const fetchStudentData = async () => {
    if (!prediction.student_id) {
      console.log('No student_id in prediction:', prediction);
      return;
    }
    
    setLoading(true);
    try {
      console.log('Fetching student data for student_id:', prediction.student_id);
      // Use list and filter since get() expects numeric ID, not student_id string
      const students = await base44.entities.Student.list();
      const student = students.find(s => s.student_id === prediction.student_id);
      console.log('Student data fetched:', student);
      setStudentData(student);
    } catch (error) {
      console.error('Error fetching student data:', error);
      console.error('Prediction object:', prediction);
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = () => {
    setOpen(true);
    fetchStudentData();
  };

  // Calculate exact GPA contribution based on value
  const calculateGPAContribution = (gpa, gpaInputCount) => {
    // Check if GPA is missing, null, undefined, or 0
    if (!gpa || gpa === 0 || gpa === '0' || gpa === '') {
      return 0;
    }
    const gpaNum = parseFloat(gpa);
    if (isNaN(gpaNum)) return 0;

    // New logic: 50% divided by number of GPA inputs
    const basePercentagePerInput = 50 / gpaInputCount;

    if (gpaNum >= 2.50) {
      // GPA 2.50 - 3.00: full base percentage
      return basePercentagePerInput;
    } else if (gpaNum >= 1.0) {
      // GPA below 2.50: lower percentage proportional to GPA
      // Scale: 1.0 = 0%, 2.50 = 100% of base percentage
      const gpaRatio = (gpaNum - 1.0) / 1.5; // Normalized from 1.0-2.50 to 0-1
      return basePercentagePerInput * gpaRatio;
    }
    return 0;
  };

  // Calculate Personal contribution based on average of all 23 variables
  const calculatePersonalContribution = (personalValues) => {
    // Sum all 23 variables and calculate average
    const sum = personalValues.reduce((a, b) => a + b, 0);
    const avg = sum / personalValues.length;

    // If average < 3: 30% contribution
    // If average >= 3 and <= 5: scale down proportionally (3.0 = 30%, 5.0 = 0%)
    if (avg < 3) {
      return 30;
    } else if (avg >= 3 && avg <= 5) {
      const avgRatio = (5 - avg) / 2; // Normalized from 3-5 to 1-0
      return 30 * avgRatio;
    }
    return 0;
  };

  // Calculate Financial contribution (inverse to value)
  const calculateFinancialContribution = (value, type) => {
    if (type === 'scholarship') {
      // Binary: yes=0%, no=6.67%
      return value === 'yes' ? 0 : 6.67;
    }
    if (type === 'scholarship_amount' || type === 'family_income') {
      // 10000 = 6.67%, higher = lower
      const baseValue = 10000;
      const maxContribution = 6.67;
      if (value <= baseValue) return maxContribution;
      const ratio = baseValue / value;
      return (maxContribution * ratio).toFixed(2);
    }
    return 0;
  };

  // Calculate detailed breakdown with actual data
  const calculateBreakdown = () => {
    const contributions = prediction.category_contributions || { academic: 0, personal: 0, financial: 0 };

    // Count number of GPA inputs
    const gpaValues = [
      studentData?.gpa_y1s1,
      studentData?.gpa_y1s2,
      studentData?.gpa_y2s1,
      studentData?.gpa_y2s2,
      studentData?.gpa_y3s1,
    ].filter(gpa => gpa && gpa > 0);
    const gpaInputCount = gpaValues.length || 1;

    // Academic breakdown (5 GPAs, contribution based on 50% / number of inputs)
    const academicBreakdown = [
      { name: 'gpa_y1s1', value: studentData?.gpa_y1s1, contribution: calculateGPAContribution(studentData?.gpa_y1s1, gpaInputCount) },
      { name: 'gpa_y1s2', value: studentData?.gpa_y1s2, contribution: calculateGPAContribution(studentData?.gpa_y1s2, gpaInputCount) },
      { name: 'gpa_y2s1', value: studentData?.gpa_y2s1, contribution: calculateGPAContribution(studentData?.gpa_y2s1, gpaInputCount) },
      { name: 'gpa_y2s2', value: studentData?.gpa_y2s2, contribution: calculateGPAContribution(studentData?.gpa_y2s2, gpaInputCount) },
      { name: 'gpa_y3s1', value: studentData?.gpa_y3s1, contribution: calculateGPAContribution(studentData?.gpa_y3s1, gpaInputCount) },
    ];

    // Personal breakdown (23 variables: 15 personal + 8 learning resources/facilities)
    const personalVariables = [
      studentData?.like_course || 3,
      studentData?.interested_in_subjects || 3,
      studentData?.course_motivates || 3,
      studentData?.satisfied_with_performance || 3,
      studentData?.previous_grades_affect || 3,
      studentData?.try_improve_grades || 3,
      studentData?.study_regularly || 3,
      studentData?.submit_on_time || 3,
      studentData?.manage_time_well || 3,
      studentData?.instructors_explain_clearly || 3,
      studentData?.approach_instructors || 3,
      studentData?.instructors_encourage || 3,
      studentData?.classmates_influence_positively || 3,
      studentData?.work_well_with_classmates || 3,
      studentData?.friends_motivate || 3,
      // Learning Resources and Facilities
      studentData?.classrooms_comfortable || 3,
      studentData?.facilities_help_focus || 3,
      studentData?.environment_motivates_attendance || 3,
      studentData?.computer_labs_support_studies || 3,
      studentData?.facilities_affect_participation || 3,
      studentData?.furniture_adequate || 3,
      studentData?.classrooms_need_improvements || 3,
      studentData?.learning_equipment_helps_performance || 3,
    ];
    const personalContribution = calculatePersonalContribution(personalVariables);
    const personalBreakdown = personalVariables.map((value, index) => {
      const names = [
        'like_course', 'interested_in_subjects', 'course_motivates', 'satisfied_with_performance',
        'previous_grades_affect', 'try_improve_grades', 'study_regularly', 'submit_on_time',
        'manage_time_well', 'instructors_explain_clearly', 'approach_instructors', 'instructors_encourage',
        'classmates_influence_positively', 'work_well_with_classmates', 'friends_motivate',
        'classrooms_comfortable', 'facilities_help_focus', 'environment_motivates_attendance',
        'computer_labs_support_studies', 'facilities_affect_participation', 'furniture_adequate',
        'classrooms_need_improvements', 'learning_equipment_helps_performance'
      ];
      return {
        name: names[index],
        value: value,
        contribution: personalContribution / personalVariables.length // Distribute total contribution evenly
      };
    });

    // Financial breakdown (3 variables, each 6.67% max)
    const financialBreakdown = [
      { name: 'scholarship', value: studentData?.scholarship || 'no', contribution: calculateFinancialContribution(studentData?.scholarship || 'no', 'scholarship') },
      { name: 'scholarship_amount', value: studentData?.scholarship_amount || 0, contribution: calculateFinancialContribution(studentData?.scholarship_amount || 0, 'scholarship_amount') },
      { name: 'family_income', value: studentData?.family_income || 0, contribution: calculateFinancialContribution(studentData?.family_income || 0, 'family_income') },
    ];

    return { academicBreakdown, personalBreakdown, financialBreakdown };
  };

  const { academicBreakdown, personalBreakdown, financialBreakdown } = studentData ? calculateBreakdown() : { academicBreakdown: [], personalBreakdown: [], financialBreakdown: [] };

  return (
    <>
      <Button
        size="sm"
        variant="outline"
        onClick={handleOpen}
        className="text-xs"
      >
        <Eye className="w-3 h-3 mr-1" />
        Details
      </Button>
      
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Category Breakdown Details - {prediction.student_name || prediction.name || prediction.student_id}</DialogTitle>
          </DialogHeader>
          
          {loading ? (
            <div className="py-8 text-center text-muted-foreground">Loading student data...</div>
          ) : studentData ? (
            <div className="space-y-6">
              {/* Academic Breakdown */}
              <div>
                <h5 className="font-semibold text-sm text-emerald-700 mb-3 flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  Academic (50%) - Total: {academicBreakdown.reduce((sum, item) => sum + item.contribution, 0).toFixed(1)}%
                </h5>
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                  <div className="space-y-2">
                    {academicBreakdown.map((item, i) => (
                      <div key={i} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-emerald-800">{item.name}</span>
                          <span className="text-muted-foreground">
                            (value: {!item.value || item.value === 0 || item.value === '0' ? 'Not Enrolled' : item.value.toFixed(2)})
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-emerald-500" 
                              style={{ width: `${Math.min(item.contribution, 10)}%` }}
                            />
                          </div>
                          <span className="font-medium text-emerald-700 w-16 text-right">{item.contribution.toFixed(1)}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Personal Breakdown */}
              <div>
                <h5 className="font-semibold text-sm text-blue-700 mb-3 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Personal (30%) - Total: {personalBreakdown.reduce((sum, item) => sum + item.contribution, 0).toFixed(1)}%
                </h5>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                    {personalBreakdown.map((item, i) => (
                      <div key={i} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-blue-800 truncate" title={item.name}>{item.name}</span>
                          <span className="text-muted-foreground">({item.value})</span>
                        </div>
                        <span className="font-medium text-blue-700">{item.contribution.toFixed(1)}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Financial Breakdown */}
              <div>
                <h5 className="font-semibold text-sm text-amber-700 mb-3 flex items-center gap-2 justify-between">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    Financial (20%) - Total: {financialBreakdown.reduce((sum, item) => sum + parseFloat(item.contribution), 0).toFixed(1)}%
                  </div>
                  <PSAStatisticsButton />
                </h5>
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <div className="space-y-2">
                    {financialBreakdown.map((item, i) => (
                      <div key={i} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-amber-800">{item.name}</span>
                          <span className="text-muted-foreground">(value: {typeof item.value === 'number' ? item.value.toLocaleString() : item.value})</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-amber-500" 
                              style={{ width: `${Math.min(parseFloat(item.contribution), 6.67)}%` }}
                            />
                          </div>
                          <span className="font-medium text-amber-700 w-16 text-right">{parseFloat(item.contribution).toFixed(1)}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Calculation Rules */}
              <div className="bg-muted/50 border rounded-lg p-4">
                <h5 className="font-semibold text-sm mb-2">Calculation Rules</h5>
                <ul className="space-y-1 text-xs text-muted-foreground">
                  <li><strong>Academic:</strong> 50% divided by number of GPA inputs. GPA 2.50+ = full base percentage, GPA below 2.50 = proportional (1.0=0%, 2.50=100%). Example: 2 inputs = 25% each at 2.50, 3 inputs = 16.67% each at 2.50</li>
                  <li><strong>Personal:</strong> 23 variables (15 personal + 8 learning resources/facilities). Average of all 23 calculated. Average below 3 = 30% contribution, Average 3-5 = scaled proportionally (3.0=30%, 5.0=0%)</li>
                  <li><strong>Financial:</strong> 3 variables, each max 6.67%. Scholarship: yes=0%, no=6.67%. Amount/Income: 10000=6.67%, higher = lower</li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center text-muted-foreground">No student data available</div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

export default function PredictionLogsPage() {
  const [selected, setSelected] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [deletingAll, setDeletingAll] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const qc = useQueryClient();

  const { data: predictions = [] } = useQuery({
    queryKey: ['predictions'],
    queryFn: () => base44.entities.Prediction.list('-created_date'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Prediction.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['predictions'] });
      setDeleting(null);
      toast.success('Prediction log deleted');
    },
  });

  const deleteAllMutation = useMutation({
    mutationFn: async () => {
      const predictions = await base44.entities.Prediction.list();
      await Promise.all(predictions.map(p => base44.entities.Prediction.delete(p.id)));
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['predictions'] });
      setDeletingAll(false);
      toast.success('All prediction logs deleted');
    },
    onError: (err) => {
      toast.error('Failed to delete all predictions: ' + err.message);
      setDeletingAll(false);
    },
  });

  const filteredPredictions = predictions.filter(p => {
    const query = searchQuery.toLowerCase();
    return (
      (p.student_name || p.name || '').toLowerCase().includes(query) ||
      (p.student_id || '').toLowerCase().includes(query) ||
      (p.model_used || '').toLowerCase().includes(query) ||
      (p.result || '').toLowerCase().includes(query)
    );
  });

  const atRiskPredictions = predictions.filter(p => p.result === 'At-Risk');

  const categoryColors = {
    academic: '#10b981',
    personal: '#3b82f6',
    financial: '#f59e0b'
  };

  return (
    <div>
      <PageHeader 
        title="Prediction Logs" 
        description="All prediction activities and XAI results"
        actions={
          predictions.length > 0 && (
            <Button 
              variant="destructive" 
              onClick={() => setDeletingAll(true)}
              disabled={deleteAllMutation.isPending}
            >
              {deleteAllMutation.isPending ? (
                <><Trash2 className="w-4 h-4 mr-2 animate-spin" />Deleting...</>
              ) : (
                <><Trash2 className="w-4 h-4 mr-2" />Delete All</>
              )}
            </Button>
          )
        }
      />

      {predictions.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">No predictions recorded yet.</CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="predictions" className="space-y-4">
          <TabsList>
            <TabsTrigger value="predictions">Predictions</TabsTrigger>
            <TabsTrigger value="category-breakdown">Category Breakdown</TabsTrigger>
            <TabsTrigger value="prediction-vs-actual">Prediction vs Actual</TabsTrigger>
          </TabsList>

          <TabsContent value="predictions">
            <Card className="mb-4">
              <CardContent className="py-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by student name, ID, model, or result..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-0">
                <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>#</TableHead>
                    <TableHead>Student</TableHead>
                    <TableHead>Student ID</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Model Used</TableHead>
                    <TableHead>Result</TableHead>
                    <TableHead>Confidence</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPredictions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                        No predictions match your search.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredPredictions.map((p, idx) => (
                    <TableRow key={p.id}>
                      <TableCell className="text-muted-foreground text-xs">{predictions.length - idx}</TableCell>
                      <TableCell className="font-medium text-sm">{p.student_name || p.name || '—'}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{p.student_id}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs capitalize">{p.prediction_type || 'basic'}</Badge>
                      </TableCell>
                      <TableCell className="text-sm">{p.model_used}</TableCell>
                      <TableCell>
                        <Badge variant={p.result === 'Good Standing' ? 'default' : 'destructive'} className="text-xs">
                          {p.result}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">{((p.confidence || 0) * 100).toFixed(0)}%</TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {p.created_date ? new Date(p.created_date).toLocaleString() : '—'}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1.5">
                          <Button size="sm" variant="outline" onClick={() => setSelected(p)}>
                            <Eye className="w-3.5 h-3.5 mr-1" /> Details
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setDeleting(p)} className="text-destructive hover:text-destructive">
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          </TabsContent>

          <TabsContent value="category-breakdown">
            {atRiskPredictions.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">No at-risk predictions with category breakdown data.</CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                <Card>
                  <CardContent className="pt-6">
                    <h3 className="font-semibold mb-4">Category Contribution Overview (At-Risk Students)</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200">
                        <div className="flex items-center gap-2 mb-2">
                          <BookOpen className="w-5 h-5 text-emerald-600" />
                          <span className="font-medium">Academic</span>
                        </div>
                        <p className="text-2xl font-bold text-emerald-700">
                          {atRiskPredictions.reduce((sum, p) => sum + (p.category_contributions?.academic || 0), 0) / atRiskPredictions.length || 0}%
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">Average contribution</p>
                      </div>
                      <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                        <div className="flex items-center gap-2 mb-2">
                          <User className="w-5 h-5 text-blue-600" />
                          <span className="font-medium">Personal</span>
                        </div>
                        <p className="text-2xl font-bold text-blue-700">
                          {atRiskPredictions.reduce((sum, p) => sum + (p.category_contributions?.personal || 0), 0) / atRiskPredictions.length || 0}%
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">Average contribution</p>
                      </div>
                      <div className="p-4 rounded-lg bg-amber-50 border border-amber-200">
                        <div className="flex items-center gap-2 mb-2">
                          <DollarSign className="w-5 h-5 text-amber-600" />
                          <span className="font-medium">Financial</span>
                        </div>
                        <p className="text-2xl font-bold text-amber-700">
                          {atRiskPredictions.reduce((sum, p) => sum + (p.category_contributions?.financial || 0), 0) / atRiskPredictions.length || 0}%
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">Average contribution</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/50">
                          <TableHead>Student</TableHead>
                          <TableHead>Student ID</TableHead>
                          <TableHead>Academic %</TableHead>
                          <TableHead>Personal %</TableHead>
                          <TableHead>Financial %</TableHead>
                          <TableHead>Primary Risk Factor</TableHead>
                          <TableHead>Explanation</TableHead>
                          <TableHead>Details</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {atRiskPredictions.map((p) => {
                          const contributions = p.category_contributions || {};
                          const sortedCategories = Object.entries(contributions).sort((a, b) => b[1] - a[1]);
                          const primaryCategory = sortedCategories[0]?.[0] || '—';
                          const categoryNames = { academic: 'Academic', personal: 'Personal', financial: 'Financial' };
                          
                          return (
                            <TableRow key={p.id}>
                              <TableCell className="font-medium text-sm">{p.student_name || p.name || '—'}</TableCell>
                              <TableCell className="text-sm text-muted-foreground">{p.student_id}</TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <div 
                                      className="h-full bg-emerald-500" 
                                      style={{ width: `${contributions.academic || 0}%` }}
                                    />
                                  </div>
                                  <span className="text-sm font-medium">{(contributions.academic || 0).toFixed(1)}%</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <div 
                                      className="h-full bg-blue-500" 
                                      style={{ width: `${contributions.personal || 0}%` }}
                                    />
                                  </div>
                                  <span className="text-sm font-medium">{(contributions.personal || 0).toFixed(1)}%</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <div 
                                      className="h-full bg-amber-500" 
                                      style={{ width: `${contributions.financial || 0}%` }}
                                    />
                                  </div>
                                  <span className="text-sm font-medium">{(contributions.financial || 0).toFixed(1)}%</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className="text-xs capitalize">
                                  {categoryNames[primaryCategory] || primaryCategory}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-xs text-muted-foreground max-w-xs truncate">
                                {p.explanation || '—'}
                              </TableCell>
                              <TableCell>
                                <CategoryBreakdownDetail prediction={p} />
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          <TabsContent value="prediction-vs-actual">
            <PredictionVsActualOutcomes predictions={predictions} />
          </TabsContent>
        </Tabs>
      )}

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Prediction Details</DialogTitle>
          </DialogHeader>
          <PredictionDetail prediction={selected} userRole="admin" />
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleting} onOpenChange={() => setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Prediction Log</AlertDialogTitle>
            <AlertDialogDescription>
              Delete prediction for {deleting?.name || deleting?.student_id}? This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteMutation.mutate(deleting.id)}
              className="bg-destructive text-destructive-foreground"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={deletingAll} onOpenChange={setDeletingAll}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete All Prediction Logs</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete all {predictions.length} prediction logs? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteAllMutation.mutate()}
              className="bg-destructive text-destructive-foreground"
            >
              Delete All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}