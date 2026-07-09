import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase as base44 } from '@/api/supabaseClient';
import PageHeader from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function PredictionResultsTable() {
  const { data: students = [] } = useQuery({
    queryKey: ['students'],
    queryFn: () => base44.entities.Student.list(),
  });
  const { data: predictions = [] } = useQuery({
    queryKey: ['predictions'],
    queryFn: () => base44.entities.Prediction.list(),
  });

  // Combine student data with predictions
  const studentPredictions = students.map(student => {
    const prediction = predictions.find(p => p.student_id === student.student_id);
    return {
      ...student,
      predictedRisk: prediction?.result || 'Not Predicted',
      confidence: prediction?.confidence || 0,
      actualStatus: student.status || 'active', // Assuming 'active' means not dropped, 'dropped' means dropped
    };
  });

  // Filter for at-risk predictions
  const atRiskPredictions = studentPredictions.filter(s => s.predictedRisk === 'At-Risk');
  const goodStandingPredictions = studentPredictions.filter(s => s.predictedRisk === 'Good Standing');

  // Calculate actual dropouts from at-risk predictions
  const actualDropoutsFromAtRisk = atRiskPredictions.filter(s => s.actualStatus === 'dropped' || s.actualStatus === 'inactive');
  const notDroppedFromAtRisk = atRiskPredictions.filter(s => s.actualStatus === 'active' || s.actualStatus === 'enrolled');

  // Calculate statistics
  const totalPredicted = atRiskPredictions.length;
  const actualDropped = actualDropoutsFromAtRisk.length;
  const predictionAccuracy = totalPredicted > 0 ? ((actualDropped / totalPredicted) * 100).toFixed(1) : 0;

  return (
    <div>
      <PageHeader
        title="Prediction Results vs Actual Outcomes"
        description="Comparison of predicted at-risk students versus actual dropping status"
      />

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
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
            <CardTitle className="text-sm font-medium text-muted-foreground">Predicted At-Risk</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-destructive">{atRiskPredictions.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Actually Dropped</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{actualDropoutsFromAtRisk.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Prediction Accuracy</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-emerald-600">{predictionAccuracy}%</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="at-risk" className="space-y-4">
        <TabsList>
          <TabsTrigger value="at-risk">At-Risk Predictions</TabsTrigger>
          <TabsTrigger value="good-standing">Good Standing Predictions</TabsTrigger>
          <TabsTrigger value="all">All Students</TabsTrigger>
        </TabsList>

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
                              <XCircle className="w-5 h-5 text-destructive" />
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
