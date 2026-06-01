import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, X, GraduationCap, BookOpen, DollarSign, AlertCircle, User } from 'lucide-react';
import { supabase } from '@/api/supabaseClient';
import { toast } from 'sonner';

const DEPARTMENTS = ['CAS', 'CBM', 'CCIS', 'CCJE', 'CTE', 'CTHM'];

const COURSE_DEPARTMENT_MAP = {
  // CAS - College of Arts and Sciences
  'AB English Language': 'CAS',
  'AB Political Science': 'CAS',
  'AB Psychology': 'CAS',
  
  // CBM - College of Business Management
  'BS Business Administration (BSBA) - Financial Management': 'CBM',
  'BS Business Administration (BSBA) - Marketing Management': 'CBM',
  'BS Business Administration (BSBA) - Human Resource Management': 'CBM',
  
  // CCIS - College of Computer and Information Sciences
  'BSCS': 'CCIS',
  'BSIT': 'CCIS',
  'BLIS': 'CCIS',
  'BSIS': 'CCIS',
  
  // CCJE - College of Criminal Justice Education
  'BS Criminology': 'CCJE',
  
  // CTE - College of Teacher Education
  'Bachelor of Elementary Education (BEEd)': 'CTE',
  'Bachelor of Secondary Education (BSEd) - English': 'CTE',
  'Bachelor of Secondary Education (BSEd) - Mathematics': 'CTE',
  'Bachelor of Secondary Education (BSEd) - Filipino': 'CTE',
  'Bachelor of Secondary Education (BSEd) - Science': 'CTE',
  
  // CTHM - College of Tourism and Hospitality Management
  'BS Tourism Management': 'CTHM',
  'BS Hospitality Management': 'CTHM',
};

const COURSES = Object.keys(COURSE_DEPARTMENT_MAP);

const getDepartmentByCourse = (course) => {
  return COURSE_DEPARTMENT_MAP[course] || 'CAS';
};
const YEARS = [1, 2, 3, 4, 5, 6];

export default function StudentFormModal({ open, onClose, onSubmit, student, isLoading }) {
  const [form, setForm] = useState({
    student_id: '',
    name: '',
    department: '',
    course: '',
    year: 1,
    // GPA fields
    gpa_y1s1: '',
    gpa_y1s2: '',
    gpa_y2s1: '',
    gpa_y2s2: '',
    gpa_y3s1: '',
    // Study habits
    study_hours: '',
    library_visits: '',
    lms_login_per_month: '',
    // Personal survey (Likert 1-5)
    like_course: 3,
    interested_in_subjects: 3,
    course_motivates: 3,
    satisfied_with_performance: 3,
    previous_grades_affect: 3,
    try_improve_grades: 3,
    study_regularly: 3,
    submit_on_time: 3,
    manage_time_well: 3,
    instructors_explain_clearly: 3,
    approach_instructors: 3,
    instructors_encourage: 3,
    classmates_influence_positively: 3,
    work_well_with_classmates: 3,
    friends_motivate: 3,
    // Learning Resources and Facilities (Likert 1-5)
    classrooms_comfortable: 3,
    facilities_help_focus: 3,
    environment_motivates_attendance: 3,
    computer_labs_support_studies: 3,
    facilities_affect_participation: 3,
    furniture_adequate: 3,
    classrooms_need_improvements: 3,
    learning_equipment_helps_performance: 3,
    internet_supports_studies: 3,
    maintained_environment_encourages_attendance: 3,
    temperature_affects_concentration: 3,
    physical_condition_influences_motivation: 3,
    // Financial
    scholarship: 'no',
    scholarship_amount: '',
    family_income: '',
    // Other
    concerns: '',
  });

  const handleDepartmentChange = (value) => {
    setForm({ ...form, department: value, course: '' });
  };

  const handleCourseChange = (value) => {
    const department = getDepartmentByCourse(value);
    setForm({ ...form, course: value, department });
  };

  useEffect(() => {
    if (student) {
      setForm({
        student_id: student.student_id || '',
        name: student.full_name || student.name || '',
        department: student.department || '',
        course: student.course || '',
        year: student.year_level || 1,
        // GPA fields
        gpa_y1s1: student.gpa_y1s1 || '',
        gpa_y1s2: student.gpa_y1s2 || '',
        gpa_y2s1: student.gpa_y2s1 || '',
        gpa_y2s2: student.gpa_y2s2 || '',
        gpa_y3s1: student.gpa_y3s1 || '',
        // Study habits
        study_hours: student.study_hours || '',
        library_visits: student.library_visits || '',
        lms_login_per_month: student.lms_login_per_month || '',
        // Personal survey (Likert 1-5)
        like_course: student.like_course || 3,
        interested_in_subjects: student.interested_in_subjects || 3,
        course_motivates: student.course_motivates || 3,
        satisfied_with_performance: student.satisfied_with_performance || 3,
        previous_grades_affect: student.previous_grades_affect || 3,
        try_improve_grades: student.try_improve_grades || 3,
        study_regularly: student.study_regularly || 3,
        submit_on_time: student.submit_on_time || 3,
        manage_time_well: student.manage_time_well || 3,
        instructors_explain_clearly: student.instructors_explain_clearly || 3,
        approach_instructors: student.approach_instructors || 3,
        instructors_encourage: student.instructors_encourage || 3,
        classmates_influence_positively: student.classmates_influence_positively || 3,
        work_well_with_classmates: student.work_well_with_classmates || 3,
        friends_motivate: student.friends_motivate || 3,
        // Learning Resources and Facilities (Likert 1-5)
        classrooms_comfortable: student.classrooms_comfortable || 3,
        facilities_help_focus: student.facilities_help_focus || 3,
        environment_motivates_attendance: student.environment_motivates_attendance || 3,
        computer_labs_support_studies: student.computer_labs_support_studies || 3,
        facilities_affect_participation: student.facilities_affect_participation || 3,
        furniture_adequate: student.furniture_adequate || 3,
        classrooms_need_improvements: student.classrooms_need_improvements || 3,
        learning_equipment_helps_performance: student.learning_equipment_helps_performance || 3,
        internet_supports_studies: student.internet_supports_studies || 3,
        maintained_environment_encourages_attendance: student.maintained_environment_encourages_attendance || 3,
        temperature_affects_concentration: student.temperature_affects_concentration || 3,
        physical_condition_influences_motivation: student.physical_condition_influences_motivation || 3,
        // Financial
        scholarship: student.scholarship || 'no',
        scholarship_amount: student.scholarship_amount || '',
        family_income: student.family_income || '',
        // Other
        concerns: student.concerns || '',
      });
    } else {
      setForm({
        student_id: '',
        name: '',
        department: '',
        course: '',
        year: 1,
        // GPA fields
        gpa_y1s1: '',
        gpa_y1s2: '',
        gpa_y2s1: '',
        gpa_y2s2: '',
        gpa_y3s1: '',
        // Study habits
        study_hours: '',
        library_visits: '',
        lms_login_per_month: '',
        // Personal survey (Likert 1-5)
        like_course: 3,
        interested_in_subjects: 3,
        course_motivates: 3,
        satisfied_with_performance: 3,
        previous_grades_affect: 3,
        try_improve_grades: 3,
        study_regularly: 3,
        submit_on_time: 3,
        manage_time_well: 3,
        instructors_explain_clearly: 3,
        approach_instructors: 3,
        instructors_encourage: 3,
        classmates_influence_positively: 3,
        work_well_with_classmates: 3,
        friends_motivate: 3,
        // Learning Resources and Facilities (Likert 1-5)
        classrooms_comfortable: 3,
        facilities_help_focus: 3,
        environment_motivates_attendance: 3,
        computer_labs_support_studies: 3,
        facilities_affect_participation: 3,
        furniture_adequate: 3,
        classrooms_need_improvements: 3,
        learning_equipment_helps_performance: 3,
        internet_supports_studies: 3,
        maintained_environment_encourages_attendance: 3,
        temperature_affects_concentration: 3,
        physical_condition_influences_motivation: 3,
        // Financial
        scholarship: 'no',
        scholarship_amount: '',
        family_income: '',
        // Other
        concerns: '',
      });
    }
  }, [student, open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!form.student_id || !form.name || !form.department || !form.course) {
      toast.error('Please fill in all required fields (Student ID, Name, Department, Course)');
      return;
    }
    
    // Convert form data to match database schema
    const submitData = {
      student_id: form.student_id,
      full_name: form.name,
      department: form.department,
      course: form.course,
      year_level: form.year,
      // GPA fields
      gpa_y1s1: form.gpa_y1s1 ? parseFloat(form.gpa_y1s1) : null,
      gpa_y1s2: form.gpa_y1s2 ? parseFloat(form.gpa_y1s2) : null,
      gpa_y2s1: form.gpa_y2s1 ? parseFloat(form.gpa_y2s1) : null,
      gpa_y2s2: form.gpa_y2s2 ? parseFloat(form.gpa_y2s2) : null,
      gpa_y3s1: form.gpa_y3s1 ? parseFloat(form.gpa_y3s1) : null,
      // Study habits
      study_hours: form.study_hours ? parseFloat(form.study_hours) : 0,
      library_visits: form.library_visits ? parseInt(form.library_visits) : 0,
      lms_login_per_month: form.lms_login_per_month ? parseInt(form.lms_login_per_month) : 0,
      // Personal survey (Likert 1-5)
      like_course: form.like_course,
      interested_in_subjects: form.interested_in_subjects,
      course_motivates: form.course_motivates,
      satisfied_with_performance: form.satisfied_with_performance,
      previous_grades_affect: form.previous_grades_affect,
      try_improve_grades: form.try_improve_grades,
      study_regularly: form.study_regularly,
      submit_on_time: form.submit_on_time,
      manage_time_well: form.manage_time_well,
      instructors_explain_clearly: form.instructors_explain_clearly,
      approach_instructors: form.approach_instructors,
      instructors_encourage: form.instructors_encourage,
      classmates_influence_positively: form.classmates_influence_positively,
      work_well_with_classmates: form.work_well_with_classmates,
      friends_motivate: form.friends_motivate,
      // Learning Resources and Facilities (Likert 1-5)
      classrooms_comfortable: form.classrooms_comfortable,
      facilities_help_focus: form.facilities_help_focus,
      environment_motivates_attendance: form.environment_motivates_attendance,
      computer_labs_support_studies: form.computer_labs_support_studies,
      facilities_affect_participation: form.facilities_affect_participation,
      furniture_adequate: form.furniture_adequate,
      classrooms_need_improvements: form.classrooms_need_improvements,
      learning_equipment_helps_performance: form.learning_equipment_helps_performance,
      internet_supports_studies: form.internet_supports_studies,
      maintained_environment_encourages_attendance: form.maintained_environment_encourages_attendance,
      temperature_affects_concentration: form.temperature_affects_concentration,
      physical_condition_influences_motivation: form.physical_condition_influences_motivation,
      // Financial
      scholarship: form.scholarship,
      scholarship_amount: form.scholarship_amount ? parseFloat(form.scholarship_amount) : 0,
      family_income: form.family_income ? parseFloat(form.family_income) : 0,
      // Other
      concerns: form.concerns,
      status: 'active',
    };
    onSubmit(submitData);
  };

  const getFilteredCourses = () => {
    if (!form.department) return COURSES;
    return COURSES.filter(course => COURSE_DEPARTMENT_MAP[course] === form.department);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">{student ? 'Edit Student' : 'Add Student'}</DialogTitle>
          <p className="text-sm text-muted-foreground">Collect student data for ML prediction and LLM analysis</p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <GraduationCap className="w-4 h-4" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="student_id">Student ID</Label>
                  <Input
                    id="student_id"
                    value={form.student_id}
                    onChange={e => setForm({ ...form, student_id: e.target.value })}
                    placeholder="e.g., 2021-00001"
                    required
                    disabled={!!student}
                  />
                </div>
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="department">Department</Label>
                  <Select value={form.department} onValueChange={handleDepartmentChange}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      {DEPARTMENTS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="course">Course</Label>
                  <Select value={form.course} onValueChange={handleCourseChange} disabled={!form.department}>
                    <SelectTrigger><SelectValue placeholder={form.department ? "Select" : "Select department first"} /></SelectTrigger>
                    <SelectContent>
                      {getFilteredCourses().map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="year">Year Level</Label>
                  <Select value={form.year.toString()} onValueChange={val => setForm({ ...form, year: parseInt(val) })}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      {YEARS.map(y => <SelectItem key={y} value={y.toString()}>{y}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Academic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                Academic Information
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
                    value={form.gpa_y1s1}
                    onChange={e => setForm({ ...form, gpa_y1s1: e.target.value })}
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
                    value={form.gpa_y1s2}
                    onChange={e => setForm({ ...form, gpa_y1s2: e.target.value })}
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
                    value={form.gpa_y2s1}
                    onChange={e => setForm({ ...form, gpa_y2s1: e.target.value })}
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
                    value={form.gpa_y2s2}
                    onChange={e => setForm({ ...form, gpa_y2s2: e.target.value })}
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
                    value={form.gpa_y3s1}
                    onChange={e => setForm({ ...form, gpa_y3s1: e.target.value })}
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
                    value={form.study_hours}
                    onChange={e => setForm({ ...form, study_hours: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="library_visits">Library Visits per Week</Label>
                  <Input
                    id="library_visits"
                    type="number"
                    min="0"
                    value={form.library_visits}
                    onChange={e => setForm({ ...form, library_visits: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="lms_login_per_month">LMS Logins per Month</Label>
                  <Input
                    id="lms_login_per_month"
                    type="number"
                    min="0"
                    value={form.lms_login_per_month}
                    onChange={e => setForm({ ...form, lms_login_per_month: e.target.value })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Personal Survey Data */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <User className="w-4 h-4" /> Personal Survey (1 = Strongly Disagree, 5 = Strongly Agree)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="like_course">I like my course</Label>
                  <Select value={form.like_course.toString()} onValueChange={(v) => setForm({ ...form, like_course: parseInt(v) })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5].map(val => <SelectItem key={val} value={val.toString()}>{val}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="interested_in_subjects">I am interested in the subjects</Label>
                  <Select value={form.interested_in_subjects.toString()} onValueChange={(v) => setForm({ ...form, interested_in_subjects: parseInt(v) })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5].map(val => <SelectItem key={val} value={val.toString()}>{val}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="course_motivates">The course motivates me</Label>
                  <Select value={form.course_motivates.toString()} onValueChange={(v) => setForm({ ...form, course_motivates: parseInt(v) })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5].map(val => <SelectItem key={val} value={val.toString()}>{val}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="satisfied_with_performance">I am satisfied with my performance</Label>
                  <Select value={form.satisfied_with_performance.toString()} onValueChange={(v) => setForm({ ...form, satisfied_with_performance: parseInt(v) })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5].map(val => <SelectItem key={val} value={val.toString()}>{val}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="previous_grades_affect">Previous grades affect my current performance</Label>
                  <Select value={form.previous_grades_affect.toString()} onValueChange={(v) => setForm({ ...form, previous_grades_affect: parseInt(v) })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5].map(val => <SelectItem key={val} value={val.toString()}>{val}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="try_improve_grades">I try to improve my grades</Label>
                  <Select value={form.try_improve_grades.toString()} onValueChange={(v) => setForm({ ...form, try_improve_grades: parseInt(v) })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5].map(val => <SelectItem key={val} value={val.toString()}>{val}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="study_regularly">I study regularly</Label>
                  <Select value={form.study_regularly.toString()} onValueChange={(v) => setForm({ ...form, study_regularly: parseInt(v) })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5].map(val => <SelectItem key={val} value={val.toString()}>{val}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="submit_on_time">I submit assignments on time</Label>
                  <Select value={form.submit_on_time.toString()} onValueChange={(v) => setForm({ ...form, submit_on_time: parseInt(v) })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5].map(val => <SelectItem key={val} value={val.toString()}>{val}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="manage_time_well">I manage my time well</Label>
                  <Select value={form.manage_time_well.toString()} onValueChange={(v) => setForm({ ...form, manage_time_well: parseInt(v) })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5].map(val => <SelectItem key={val} value={val.toString()}>{val}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="instructors_explain_clearly">Instructors explain clearly</Label>
                  <Select value={form.instructors_explain_clearly.toString()} onValueChange={(v) => setForm({ ...form, instructors_explain_clearly: parseInt(v) })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5].map(val => <SelectItem key={val} value={val.toString()}>{val}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="approach_instructors">I approach instructors for help</Label>
                  <Select value={form.approach_instructors.toString()} onValueChange={(v) => setForm({ ...form, approach_instructors: parseInt(v) })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5].map(val => <SelectItem key={val} value={val.toString()}>{val}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="instructors_encourage">Instructors encourage me</Label>
                  <Select value={form.instructors_encourage.toString()} onValueChange={(v) => setForm({ ...form, instructors_encourage: parseInt(v) })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5].map(val => <SelectItem key={val} value={val.toString()}>{val}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="classmates_influence_positively">Classmates influence me positively</Label>
                  <Select value={form.classmates_influence_positively.toString()} onValueChange={(v) => setForm({ ...form, classmates_influence_positively: parseInt(v) })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5].map(val => <SelectItem key={val} value={val.toString()}>{val}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="work_well_with_classmates">I work well with classmates</Label>
                  <Select value={form.work_well_with_classmates.toString()} onValueChange={(v) => setForm({ ...form, work_well_with_classmates: parseInt(v) })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5].map(val => <SelectItem key={val} value={val.toString()}>{val}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="friends_motivate">Friends motivate me</Label>
                  <Select value={form.friends_motivate.toString()} onValueChange={(v) => setForm({ ...form, friends_motivate: parseInt(v) })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5].map(val => <SelectItem key={val} value={val.toString()}>{val}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Learning Resources and Facilities */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <User className="w-4 h-4" /> Learning Resources and Facilities (1 = Strongly Disagree, 5 = Strongly Agree)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="classrooms_comfortable">The classrooms provide a comfortable learning environment</Label>
                  <Select value={form.classrooms_comfortable.toString()} onValueChange={(v) => setForm({ ...form, classrooms_comfortable: parseInt(v) })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5].map(val => <SelectItem key={val} value={val.toString()}>{val}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="facilities_help_focus">The school facilities help me focus during classes</Label>
                  <Select value={form.facilities_help_focus.toString()} onValueChange={(v) => setForm({ ...form, facilities_help_focus: parseInt(v) })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5].map(val => <SelectItem key={val} value={val.toString()}>{val}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="environment_motivates_attendance">I am more motivated to attend classes when the learning environment is comfortable</Label>
                  <Select value={form.environment_motivates_attendance.toString()} onValueChange={(v) => setForm({ ...form, environment_motivates_attendance: parseInt(v) })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5].map(val => <SelectItem key={val} value={val.toString()}>{val}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="computer_labs_support_studies">The computer laboratories and learning resources support my studies</Label>
                  <Select value={form.computer_labs_support_studies.toString()} onValueChange={(v) => setForm({ ...form, computer_labs_support_studies: parseInt(v) })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5].map(val => <SelectItem key={val} value={val.toString()}>{val}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="facilities_affect_participation">The condition of classrooms and facilities affects my class participation and attendance</Label>
                  <Select value={form.facilities_affect_participation.toString()} onValueChange={(v) => setForm({ ...form, facilities_affect_participation: parseInt(v) })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5].map(val => <SelectItem key={val} value={val.toString()}>{val}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="furniture_adequate">The chairs, tables, and other classroom furniture are adequate for learning</Label>
                  <Select value={form.furniture_adequate.toString()} onValueChange={(v) => setForm({ ...form, furniture_adequate: parseInt(v) })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5].map(val => <SelectItem key={val} value={val.toString()}>{val}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="classrooms_need_improvements">The classrooms need improvements in furniture and physical facilities</Label>
                  <Select value={form.classrooms_need_improvements.toString()} onValueChange={(v) => setForm({ ...form, classrooms_need_improvements: parseInt(v) })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5].map(val => <SelectItem key={val} value={val.toString()}>{val}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="learning_equipment_helps_performance">The availability of learning equipment and resources helps me perform better academically</Label>
                  <Select value={form.learning_equipment_helps_performance.toString()} onValueChange={(v) => setForm({ ...form, learning_equipment_helps_performance: parseInt(v) })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5].map(val => <SelectItem key={val} value={val.toString()}>{val}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="internet_supports_studies">The internet connection and technology resources provided by the school support my studies</Label>
                  <Select value={form.internet_supports_studies.toString()} onValueChange={(v) => setForm({ ...form, internet_supports_studies: parseInt(v) })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5].map(val => <SelectItem key={val} value={val.toString()}>{val}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="maintained_environment_encourages_attendance">A well-maintained classroom environment encourages me to attend classes regularly</Label>
                  <Select value={form.maintained_environment_encourages_attendance.toString()} onValueChange={(v) => setForm({ ...form, maintained_environment_encourages_attendance: parseInt(v) })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5].map(val => <SelectItem key={val} value={val.toString()}>{val}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="temperature_affects_concentration">The temperature and ventilation inside the classroom affect my concentration during lessons</Label>
                  <Select value={form.temperature_affects_concentration.toString()} onValueChange={(v) => setForm({ ...form, temperature_affects_concentration: parseInt(v) })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5].map(val => <SelectItem key={val} value={val.toString()}>{val}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="physical_condition_influences_motivation">The physical condition of the classroom influences my motivation to learn</Label>
                  <Select value={form.physical_condition_influences_motivation.toString()} onValueChange={(v) => setForm({ ...form, physical_condition_influences_motivation: parseInt(v) })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5].map(val => <SelectItem key={val} value={val.toString()}>{val}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Financial Data */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <DollarSign className="w-4 h-4" /> Financial Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="scholarship">Do you have a scholarship?</Label>
                <Select value={form.scholarship} onValueChange={(v) => setForm({ ...form, scholarship: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">Yes</SelectItem>
                    <SelectItem value="no">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {form.scholarship === 'yes' && (
                <div>
                  <Label htmlFor="scholarship_amount">Scholarship Amount (PHP)</Label>
                  <Input
                    id="scholarship_amount"
                    type="number"
                    min="0"
                    value={form.scholarship_amount}
                    onChange={e => setForm({ ...form, scholarship_amount: e.target.value })}
                  />
                </div>
              )}
              <div>
                <Label htmlFor="family_income">Monthly Family Income (PHP)</Label>
                <Input
                  id="family_income"
                  type="number"
                  min="0"
                  value={form.family_income}
                  onChange={e => setForm({ ...form, family_income: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>

          {/* Concerns */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <User className="w-4 h-4" /> Concerns
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <Label htmlFor="concerns">Any concerns or feedback?</Label>
                <Input
                  id="concerns"
                  type="text"
                  value={form.concerns}
                  onChange={e => setForm({ ...form, concerns: e.target.value })}
                  placeholder="Enter your concerns here"
                />
              </div>
            </CardContent>
          </Card>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : student ? 'Update Student' : 'Add Student'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}