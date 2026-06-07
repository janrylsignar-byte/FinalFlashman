import React, { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { supabase as base44 } from '@/api/supabaseClient';
import { usePortalAuth } from '@/lib/PortalAuthContext';
import PageHeader from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { GraduationCap, User, DollarSign, Save, CheckCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export default function StudentDataEntry() {
  const { portalUser } = usePortalAuth();
  const studentId = portalUser?.student_id || portalUser?.studentData?.student_id;
  const { toast } = useToast();

  const { data: students = [] } = useQuery({ queryKey: ['students'], queryFn: () => base44.entities.Student.list() });
  const student = students.find(s => s.student_id === studentId) || portalUser?.studentData;

  const [formData, setFormData] = useState({
    // GPA fields
    gpa_y1s1: student?.gpa_y1s1 || '',
    gpa_y1s2: student?.gpa_y1s2 || '',
    gpa_y2s1: student?.gpa_y2s1 || '',
    gpa_y2s2: student?.gpa_y2s2 || '',
    gpa_y3s1: student?.gpa_y3s1 || '',
    // Personal survey fields (Likert 1-5)
    like_course: student?.like_course || 3,
    interested_in_subjects: student?.interested_in_subjects || 3,
    course_motivates: student?.course_motivates || 3,
    satisfied_with_performance: student?.satisfied_with_performance || 3,
    previous_grades_affect: student?.previous_grades_affect || 3,
    try_improve_grades: student?.try_improve_grades || 3,
    study_regularly: student?.study_regularly || 3,
    submit_on_time: student?.submit_on_time || 3,
    manage_time_well: student?.manage_time_well || 3,
    instructors_explain_clearly: student?.instructors_explain_clearly || 3,
    approach_instructors: student?.approach_instructors || 3,
    instructors_encourage: student?.instructors_encourage || 3,
    classmates_influence_positively: student?.classmates_influence_positively || 3,
    work_well_with_classmates: student?.work_well_with_classmates || 3,
    friends_motivate: student?.friends_motivate || 3,
    // Learning Resources and Facilities (Likert 1-5)
    classrooms_comfortable: student?.classrooms_comfortable || 3,
    facilities_help_focus: student?.facilities_help_focus || 3,
    environment_motivates_attendance: student?.environment_motivates_attendance || 3,
    computer_labs_support_studies: student?.computer_labs_support_studies || 3,
    facilities_affect_participation: student?.facilities_affect_participation || 3,
    furniture_adequate: student?.furniture_adequate || 3,
    classrooms_need_improvements: student?.classrooms_need_improvements || 3,
    learning_equipment_helps_performance: student?.learning_equipment_helps_performance || 3,
    internet_supports_studies: student?.internet_supports_studies || 3,
    maintained_environment_encourages_attendance: student?.maintained_environment_encourages_attendance || 3,
    temperature_affects_concentration: student?.temperature_affects_concentration || 3,
    physical_condition_influences_motivation: student?.physical_condition_influences_motivation || 3,
    // Financial fields
    scholarship: student?.scholarship || 'no',
    scholarship_amount: student?.scholarship_amount || '',
    family_income: student?.family_income || '',
    // Other fields
    study_hours: student?.study_hours || '',
    library_visits: student?.library_visits || '',
    lms_login_per_month: student?.lms_login_per_month || '',
    concerns: student?.concerns || '',
  });

  const updateMutation = useMutation({
    mutationFn: async (data) => {
      console.log('Attempting to save student data:', data);
      console.log('Student ID:', studentId);
      console.log('Portal user:', portalUser);
      console.log('Existing student:', student);
      
      // Use the existing student data from the query instead of fetching again
      if (student && student.id) {
        console.log('Updating existing student with ID:', student.id);
        const result = await base44.entities.Student.update(student.id, data);
        console.log('Update result:', result);
        return result;
      } else {
        console.log('Creating new student record');
        const newStudentData = {
          ...data,
          student_id: studentId,
          full_name: portalUser?.displayName || student?.full_name || '',
          course: student?.course || '',
          department: student?.department || '',
          year_level: student?.year_level || 1,
          email: student?.email || '',
          status: 'active',
        };
        console.log('New student data:', newStudentData);
        const result = await base44.entities.Student.create(newStudentData);
        console.log('Create result:', result);
        return result;
      }
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Your data has been saved successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to save your data. Please try again.',
        variant: 'destructive',
      });
      console.error('Error saving student data:', error);
      console.error('Error details:', error.message);
      console.error('Error stack:', error.stack);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const dataToSave = {
      ...formData,
      gpa_y1s1: formData.gpa_y1s1 ? parseFloat(formData.gpa_y1s1) : null,
      gpa_y1s2: formData.gpa_y1s2 ? parseFloat(formData.gpa_y1s2) : null,
      gpa_y2s1: formData.gpa_y2s1 ? parseFloat(formData.gpa_y2s1) : null,
      gpa_y2s2: formData.gpa_y2s2 ? parseFloat(formData.gpa_y2s2) : null,
      gpa_y3s1: formData.gpa_y3s1 ? parseFloat(formData.gpa_y3s1) : null,
      scholarship_amount: formData.scholarship_amount ? parseFloat(formData.scholarship_amount) : 0,
      family_income: formData.family_income ? parseFloat(formData.family_income) : 0,
      study_hours: formData.study_hours ? parseFloat(formData.study_hours) : 0,
      library_visits: formData.library_visits ? parseInt(formData.library_visits) : 0,
      lms_login_per_month: formData.lms_login_per_month ? parseInt(formData.lms_login_per_month) : 0,
    };

    updateMutation.mutate(dataToSave);
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Update Your Data"
        description="Enter your academic, personal, and financial information for prediction analysis"
      />

      <form onSubmit={handleSubmit}>
        {/* Academic Data */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-primary" /> Academic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="gpa_y1s1">1st Year 1st Semester GPA</Label>
                <Input
                  id="gpa_y1s1"
                  type="number"
                  step="0.01"
                  min="1"
                  max="5"
                  placeholder="Leave blank if not enrolled"
                  value={formData.gpa_y1s1}
                  onChange={(e) => handleChange('gpa_y1s1', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="gpa_y1s2">1st Year 2nd Semester GPA</Label>
                <Input
                  id="gpa_y1s2"
                  type="number"
                  step="0.01"
                  min="1"
                  max="5"
                  placeholder="Leave blank if not enrolled"
                  value={formData.gpa_y1s2}
                  onChange={(e) => handleChange('gpa_y1s2', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="gpa_y2s1">2nd Year 1st Semester GPA</Label>
                <Input
                  id="gpa_y2s1"
                  type="number"
                  step="0.01"
                  min="1"
                  max="5"
                  placeholder="Leave blank if not enrolled"
                  value={formData.gpa_y2s1}
                  onChange={(e) => handleChange('gpa_y2s1', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="gpa_y2s2">2nd Year 2nd Semester GPA</Label>
                <Input
                  id="gpa_y2s2"
                  type="number"
                  step="0.01"
                  min="1"
                  max="5"
                  placeholder="Leave blank if not enrolled"
                  value={formData.gpa_y2s2}
                  onChange={(e) => handleChange('gpa_y2s2', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="gpa_y3s1">3rd Year 1st Semester GPA</Label>
                <Input
                  id="gpa_y3s1"
                  type="number"
                  step="0.01"
                  min="1"
                  max="5"
                  placeholder="Leave blank if not enrolled"
                  value={formData.gpa_y3s1}
                  onChange={(e) => handleChange('gpa_y3s1', e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="study_hours">Study Hours per Day</Label>
                <Input
                  id="study_hours"
                  type="number"
                  min="0"
                  max="24"
                  value={formData.study_hours}
                  onChange={(e) => handleChange('study_hours', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="library_visits">Library Visits per Week</Label>
                <Input
                  id="library_visits"
                  type="number"
                  min="0"
                  value={formData.library_visits}
                  onChange={(e) => handleChange('library_visits', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="lms_login_per_month">LMS Logins per Month</Label>
                <Input
                  id="lms_login_per_month"
                  type="number"
                  min="0"
                  value={formData.lms_login_per_month}
                  onChange={(e) => handleChange('lms_login_per_month', e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Personal Survey Data */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <User className="w-4 h-4 text-primary" /> Personal Survey (1 = Strongly Disagree, 5 = Strongly Agree)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="like_course">I like my course</Label>
                <Select value={formData.like_course.toString()} onValueChange={(v) => handleChange('like_course', parseInt(v))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5].map(val => (
                      <SelectItem key={val} value={val.toString()}>{val}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="interested_in_subjects">I am interested in the subjects</Label>
                <Select value={formData.interested_in_subjects.toString()} onValueChange={(v) => handleChange('interested_in_subjects', parseInt(v))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5].map(val => (
                      <SelectItem key={val} value={val.toString()}>{val}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="course_motivates">The course motivates me</Label>
                <Select value={formData.course_motivates.toString()} onValueChange={(v) => handleChange('course_motivates', parseInt(v))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5].map(val => (
                      <SelectItem key={val} value={val.toString()}>{val}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="satisfied_with_performance">I am satisfied with my performance</Label>
                <Select value={formData.satisfied_with_performance.toString()} onValueChange={(v) => handleChange('satisfied_with_performance', parseInt(v))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5].map(val => (
                      <SelectItem key={val} value={val.toString()}>{val}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="previous_grades_affect">Previous grades affect my current performance</Label>
                <Select value={formData.previous_grades_affect.toString()} onValueChange={(v) => handleChange('previous_grades_affect', parseInt(v))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5].map(val => (
                      <SelectItem key={val} value={val.toString()}>{val}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="try_improve_grades">I try to improve my grades</Label>
                <Select value={formData.try_improve_grades.toString()} onValueChange={(v) => handleChange('try_improve_grades', parseInt(v))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5].map(val => (
                      <SelectItem key={val} value={val.toString()}>{val}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="study_regularly">I study regularly</Label>
                <Select value={formData.study_regularly.toString()} onValueChange={(v) => handleChange('study_regularly', parseInt(v))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5].map(val => (
                      <SelectItem key={val} value={val.toString()}>{val}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="submit_on_time">I submit assignments on time</Label>
                <Select value={formData.submit_on_time.toString()} onValueChange={(v) => handleChange('submit_on_time', parseInt(v))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5].map(val => (
                      <SelectItem key={val} value={val.toString()}>{val}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="manage_time_well">I manage my time well</Label>
                <Select value={formData.manage_time_well.toString()} onValueChange={(v) => handleChange('manage_time_well', parseInt(v))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5].map(val => (
                      <SelectItem key={val} value={val.toString()}>{val}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="instructors_explain_clearly">Instructors explain clearly</Label>
                <Select value={formData.instructors_explain_clearly.toString()} onValueChange={(v) => handleChange('instructors_explain_clearly', parseInt(v))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5].map(val => (
                      <SelectItem key={val} value={val.toString()}>{val}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="approach_instructors">I approach instructors for help</Label>
                <Select value={formData.approach_instructors.toString()} onValueChange={(v) => handleChange('approach_instructors', parseInt(v))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5].map(val => (
                      <SelectItem key={val} value={val.toString()}>{val}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="instructors_encourage">Instructors encourage me</Label>
                <Select value={formData.instructors_encourage.toString()} onValueChange={(v) => handleChange('instructors_encourage', parseInt(v))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5].map(val => (
                      <SelectItem key={val} value={val.toString()}>{val}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="classmates_influence_positively">Classmates influence me positively</Label>
                <Select value={formData.classmates_influence_positively.toString()} onValueChange={(v) => handleChange('classmates_influence_positively', parseInt(v))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5].map(val => (
                      <SelectItem key={val} value={val.toString()}>{val}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="work_well_with_classmates">I work well with classmates</Label>
                <Select value={formData.work_well_with_classmates.toString()} onValueChange={(v) => handleChange('work_well_with_classmates', parseInt(v))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5].map(val => (
                      <SelectItem key={val} value={val.toString()}>{val}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="friends_motivate">Friends motivate me</Label>
                <Select value={formData.friends_motivate.toString()} onValueChange={(v) => handleChange('friends_motivate', parseInt(v))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5].map(val => (
                      <SelectItem key={val} value={val.toString()}>{val}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Learning Resources and Facilities */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <User className="w-4 h-4 text-primary" /> Learning Resources and Facilities (1 = Strongly Disagree, 5 = Strongly Agree)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="classrooms_comfortable">The classrooms provide a comfortable learning environment</Label>
                <Select value={formData.classrooms_comfortable.toString()} onValueChange={(v) => handleChange('classrooms_comfortable', parseInt(v))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5].map(val => (
                      <SelectItem key={val} value={val.toString()}>{val}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="facilities_help_focus">The school facilities help me focus during classes</Label>
                <Select value={formData.facilities_help_focus.toString()} onValueChange={(v) => handleChange('facilities_help_focus', parseInt(v))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5].map(val => (
                      <SelectItem key={val} value={val.toString()}>{val}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="environment_motivates_attendance">I am more motivated to attend classes when the learning environment is comfortable</Label>
                <Select value={formData.environment_motivates_attendance.toString()} onValueChange={(v) => handleChange('environment_motivates_attendance', parseInt(v))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5].map(val => (
                      <SelectItem key={val} value={val.toString()}>{val}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="computer_labs_support_studies">The computer laboratories and learning resources support my studies</Label>
                <Select value={formData.computer_labs_support_studies.toString()} onValueChange={(v) => handleChange('computer_labs_support_studies', parseInt(v))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5].map(val => (
                      <SelectItem key={val} value={val.toString()}>{val}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="facilities_affect_participation">The condition of classrooms and facilities affects my class participation and attendance</Label>
                <Select value={formData.facilities_affect_participation.toString()} onValueChange={(v) => handleChange('facilities_affect_participation', parseInt(v))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5].map(val => (
                      <SelectItem key={val} value={val.toString()}>{val}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="furniture_adequate">The chairs, tables, and other classroom furniture are adequate for learning</Label>
                <Select value={formData.furniture_adequate.toString()} onValueChange={(v) => handleChange('furniture_adequate', parseInt(v))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5].map(val => (
                      <SelectItem key={val} value={val.toString()}>{val}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="classrooms_need_improvements">The classrooms need improvements in furniture and physical facilities</Label>
                <Select value={formData.classrooms_need_improvements.toString()} onValueChange={(v) => handleChange('classrooms_need_improvements', parseInt(v))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5].map(val => (
                      <SelectItem key={val} value={val.toString()}>{val}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="learning_equipment_helps_performance">The availability of learning equipment and resources helps me perform better academically</Label>
                <Select value={formData.learning_equipment_helps_performance.toString()} onValueChange={(v) => handleChange('learning_equipment_helps_performance', parseInt(v))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5].map(val => (
                      <SelectItem key={val} value={val.toString()}>{val}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="internet_supports_studies">The internet connection and technology resources provided by the school support my studies</Label>
                <Select value={formData.internet_supports_studies.toString()} onValueChange={(v) => handleChange('internet_supports_studies', parseInt(v))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5].map(val => (
                      <SelectItem key={val} value={val.toString()}>{val}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="maintained_environment_encourages_attendance">A well-maintained classroom environment encourages me to attend classes regularly</Label>
                <Select value={formData.maintained_environment_encourages_attendance.toString()} onValueChange={(v) => handleChange('maintained_environment_encourages_attendance', parseInt(v))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5].map(val => (
                      <SelectItem key={val} value={val.toString()}>{val}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="temperature_affects_concentration">The temperature and ventilation inside the classroom affect my concentration during lessons</Label>
                <Select value={formData.temperature_affects_concentration.toString()} onValueChange={(v) => handleChange('temperature_affects_concentration', parseInt(v))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5].map(val => (
                      <SelectItem key={val} value={val.toString()}>{val}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="physical_condition_influences_motivation">The physical condition of the classroom influences my motivation to learn</Label>
                <Select value={formData.physical_condition_influences_motivation.toString()} onValueChange={(v) => handleChange('physical_condition_influences_motivation', parseInt(v))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5].map(val => (
                      <SelectItem key={val} value={val.toString()}>{val}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Financial Data */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-primary" /> Financial Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="scholarship">Do you have a scholarship?</Label>
              <Select value={formData.scholarship} onValueChange={(v) => handleChange('scholarship', v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes">Yes</SelectItem>
                  <SelectItem value="no">No</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {formData.scholarship === 'yes' && (
              <div>
                <Label htmlFor="scholarship_amount">Scholarship Amount (PHP)</Label>
                <Input
                  id="scholarship_amount"
                  type="number"
                  min="0"
                  value={formData.scholarship_amount}
                  onChange={(e) => handleChange('scholarship_amount', e.target.value)}
                />
              </div>
            )}
            <div>
              <Label htmlFor="family_income">Monthly Family Income (PHP)</Label>
              <Select value={formData.family_income} onValueChange={(v) => handleChange('family_income', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select income range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Below 20000">Below 20000</SelectItem>
                  <SelectItem value="25000-30000">25000-30000</SelectItem>
                  <SelectItem value="30000-40000">30000-40000</SelectItem>
                  <SelectItem value="50000 above">50000 above</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Concerns */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <User className="w-4 h-4 text-primary" /> Concerns
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <Label htmlFor="concerns">Any concerns or feedback?</Label>
              <Input
                id="concerns"
                type="text"
                value={formData.concerns}
                onChange={(e) => handleChange('concerns', e.target.value)}
                placeholder="Enter your concerns here"
              />
            </div>
          </CardContent>
        </Card>

        <Button type="submit" disabled={updateMutation.isPending} className="w-full">
          {updateMutation.isPending ? (
            <>Saving...</>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Data
            </>
          )}
        </Button>
      </form>
    </div>
  );
}
