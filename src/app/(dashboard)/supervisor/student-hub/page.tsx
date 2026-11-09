import { redirect } from 'next/navigation'

/** نفس مركز الطالب في الإدارة */
export default function SupervisorStudentHubPage() {
  redirect('/admin/student-hub')
}
