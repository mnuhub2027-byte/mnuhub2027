'use client'

import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import {
  type Club,
  type StudentApplication,
  type Applicant,
  type Member,
  type Announcement,
  type Task,
  type TeamEvent,
  type Interview,
} from '@/lib/data'

export type AdminAccount = {
  id: string
  name: string
  email: string
  faculty: string
  assignedTeamId: string
  assignedTeamName: string
  createdAt: string
  status: 'Active' | 'Pending'
}

export type PromotionRequest = {
  id: string
  memberName: string
  memberInitials: string
  department: string
  requestedRole: 'Vice Leader'
  submittedAt: string
  status: 'Pending' | 'Approved' | 'Rejected'
  reason: string
}

type SystemContextType = {
  // Clubs / Teams (Faculty Control)
  clubs: Club[]
  addClub: (newClub: Omit<Club, 'id' | 'members'>) => void
  deleteClub: (clubId: string) => void

  // Admin Accounts (Faculty Control)
  admins: AdminAccount[]
  addAdmin: (admin: Omit<AdminAccount, 'id' | 'createdAt' | 'status'>) => void
  removeAdmin: (adminId: string) => void

  // Student Applications (Applicant View)
  studentApplications: StudentApplication[]
  applyToClub: (
    clubId: string,
    clubName: string,
    role: string,
    note?: string,
    cvLink?: string,
    whatsapp?: string,
    studentId?: string,
    faculty?: string,
    fullName?: string
  ) => Promise<void> | void

  // Pipeline Applicants (Assistant View)
  applicants: Applicant[]
  advanceApplicantStage: (id: string) => void
  acceptApplicantToTeam: (applicantId: string) => void
  rejectApplicant: (applicantId: string) => void

  // Members (Member View & Leader View)
  members: Member[]
  updateMemberRole: (memberId: string, role: 'Leader' | 'Vice Leader' | 'Member') => Promise<void>

  // Promotion Requests (Member -> Leader Approval)
  promotionRequests: PromotionRequest[]
  requestPromotion: (memberName: string, department: string, phone: string, cvLink: string, reason: string) => void
  approvePromotion: (requestId: string) => void
  rejectPromotion: (requestId: string) => void
  promoteAssistantByEmail: (email: string) => Promise<void>

  // Events & Tasks
  announcements: Announcement[]
  addAnnouncement: (announcement: Omit<Announcement, 'id' | 'date'>) => void
  deleteAnnouncement: (announcementId: string) => Promise<void>
  myTasks: Task[]
  toggleTaskStatus: (taskId: string) => void
  teamEvents: TeamEvent[]
  deleteTeamEvent: (eventId: string) => Promise<void>
  interviews: Interview[]
  addInterview: (interview: Omit<Interview, 'id'>) => void
}

const SystemContext = createContext<SystemContextType | null>(null)

export function SystemProvider({ children }: { children: ReactNode }) {
  const [clubs, setClubs] = useState<Club[]>([])
  const [admins, setAdmins] = useState<AdminAccount[]>([])
  const [studentApplications, setStudentApplications] = useState<StudentApplication[]>([])
  const [applicants, setApplicants] = useState<Applicant[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [promotionRequests, setPromotionRequests] = useState<PromotionRequest[]>([])
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [myTasks, setMyTasks] = useState<Task[]>([])
  const [teamEvents, setTeamEvents] = useState<TeamEvent[]>([])
  const [interviews, setInterviews] = useState<Interview[]>([])
  
  const [currentClubId, setCurrentClubId] = useState<string | null>(null)

  const supabase = createClient()

  // Initial Data Fetching from Supabase
  useEffect(() => {
    async function loadData() {
      // Load Clubs
      const { data: dbClubs, error: clubsError } = await supabase.from('clubs').select('*').order('created_at', { ascending: false })
      if (!clubsError && dbClubs) {
        const mappedClubs: Club[] = dbClubs.map(c => ({
          id: c.id,
          name: c.name,
          category: c.category,
          faculty: c.faculty,
          tagline: c.tagline || '',
          description: c.description || '',
          image: '/clubs/robotics.png',
          members: 1,
          achievements: [],
          events: [],
          openRoles: ['Member'],
        }))
        if (mappedClubs.length > 0) setClubs(mappedClubs)
      }

      // Load Admins
      const { data: dbAdmins, error: adminsError } = await supabase.from('platform_admins').select('*').order('created_at', { ascending: false })
      if (!adminsError && dbAdmins) {
        const mappedAdmins: AdminAccount[] = dbAdmins.map(a => ({
          id: a.id,
          name: a.name,
          email: a.email,
          faculty: a.faculty,
          assignedTeamId: a.assigned_team_id,
          assignedTeamName: a.assigned_team_name,
          createdAt: new Date(a.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          status: a.status as 'Active' | 'Pending',
        }))
        setAdmins(mappedAdmins)
      }

      const { data: sessionData } = await supabase.auth.getSession()
      const user = sessionData?.session?.user
      
      let activeClubId = null

      if (user) {
        // Load user's applications
        const { data: myApps } = await supabase.from('club_members').select('*, clubs(name)').eq('user_id', user.id).eq('status', 'pending')
        if (myApps) {
          setStudentApplications(myApps.map((app: any) => ({
            id: app.id,
            clubId: app.club_id,
            clubName: app.clubs?.name || 'Unknown',
            role: app.role,
            submitted: new Date(app.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            status: 'Pending',
            note: 'تم إرسال الطلب وهو قيد المراجعة بواسطة مساعد التيم.'
          })))
        }

        const { data: activeMembership } = await supabase.from('club_members').select('club_id').eq('user_id', user.id).eq('status', 'active').limit(1).maybeSingle()
        if (activeMembership) {
          activeClubId = activeMembership.club_id
        } else {
          const { data: adminRecord } = await supabase.from('platform_admins').select('assigned_team_id').eq('email', user.email).limit(1).maybeSingle()
          if (adminRecord?.assigned_team_id) {
            activeClubId = adminRecord.assigned_team_id
          }
        }
        if (activeClubId) setCurrentClubId(activeClubId)
      }

      if (activeClubId) {
        // Load Promotion Requests first so we can attach CV / motivation to applicants
        const { data: dbProms } = await supabase.from('promotion_requests').select('*').eq('club_id', activeClubId)
        const cvMap = new Map<string, { cv_link?: string; reason?: string; phone?: string; department?: string }>()
        if (dbProms) {
           setPromotionRequests(dbProms.map(p => ({
              id: p.id,
              memberName: p.member_name,
              memberInitials: (p.member_name || 'طالب').substring(0, 2).toUpperCase(),
              department: p.department || '',
              requestedRole: 'Vice Leader',
              submittedAt: new Date(p.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
              status: p.status,
              reason: p.reason || ''
           })))

           dbProms.forEach((p: any) => {
             if (p.user_id) {
               cvMap.set(p.user_id, {
                 cv_link: p.cv_link || '',
                 reason: p.reason || '',
                 phone: p.phone || '',
                 department: p.department || '',
               })
             }
           })
        }

        // Load Members and Applicants for THIS club
        const { data: dbMembers } = await supabase
          .from('club_members')
          .select('id, role, status, created_at, user_id, profiles(full_name, faculty, email, whatsapp, student_id)')
          .eq('club_id', activeClubId)
        
        if (dbMembers) {
          const newMembers: Member[] = []
          const newApplicants: Applicant[] = []
          
          dbMembers.forEach((m: any) => {
            const profileName = m.profiles?.full_name || 'طالب'
            if (m.status === 'pending') {
              const submittedAt = m.created_at
                ? new Date(m.created_at).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })
                : 'غير محدد'
              const userReq = m.user_id ? cvMap.get(m.user_id) : undefined
              const cvLink = userReq?.cv_link || ''
              const motivation = userReq?.reason || ''

              newApplicants.push({
                id: m.id,
                name: profileName,
                faculty: m.profiles?.faculty || userReq?.department || 'غير محدد',
                year: 'N/A',
                role: m.role || 'member',
                stage: 'Reviewing',
                score: 0,
                portfolio: cvLink,
                cvLink: cvLink,
                motivation: motivation,
                email: m.profiles?.email || '',
                whatsapp: m.profiles?.whatsapp || userReq?.phone || '',
                studentId: m.profiles?.student_id || '',
                submittedAt,
              })
            } else if (m.status === 'active') {
              const initials = profileName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
              const joinedDate = m.created_at
                ? new Date(m.created_at).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })
                : 'غير محدد'
              newMembers.push({
                id: m.id,
                userId: m.user_id,
                name: profileName,
                initials: initials,
                department: m.profiles?.faculty || 'غير محدد',
                role: m.role === 'assistant' ? 'Vice Leader' : (m.role === 'leader' ? 'Leader' : 'Member'),
                joined: joinedDate,
                attendance: 100,
                tasksDone: 0,
                email: m.profiles?.email || '',
                phone: m.profiles?.whatsapp || m.profiles?.student_id || '',
              })
            }
          })
          
          setMembers(newMembers)
          setApplicants(newApplicants)
        }

        // Load Announcements
        const { data: dbAnns } = await supabase.from('announcements').select('*').eq('club_id', activeClubId).order('created_at', { ascending: false })
        if (dbAnns) {
           setAnnouncements(dbAnns.map(a => ({
              id: a.id,
              title: a.title,
              body: a.body,
              author: a.author,
              pinned: a.pinned,
              date: new Date(a.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
           })))
        }

        // Load Interviews
        const { data: dbIvs } = await supabase.from('interviews').select('*').eq('club_id', activeClubId)
        if (dbIvs) {
           setInterviews(dbIvs.map(i => ({
              id: i.id,
              applicant: i.applicant_name,
              role: i.role,
              date: i.date,
              time: i.time,
              interviewer: i.interviewer
           })))
        }

        // Load Tasks
        const { data: dbTasks } = await supabase.from('tasks').select('*').eq('club_id', activeClubId)
        if (dbTasks) {
           setMyTasks(dbTasks.map(t => ({
              id: t.id,
              title: t.title,
              due: t.due_date || '',
              priority: t.priority || 'Medium',
              status: t.status
           })))
        }

        // Load Events
        const { data: dbEvents } = await supabase.from('team_events').select('*').eq('club_id', activeClubId)
        if (dbEvents) {
           setTeamEvents(dbEvents.map(e => ({
              id: e.id,
              title: e.title,
              type: e.type || 'Event',
              day: new Date(e.date).toLocaleDateString('en-US', { weekday: 'short' }),
              date: e.date,
              time: e.time,
              location: e.location || 'TBA'
           })))
        }
      }
    }
    loadData()
  }, [])

  // Faculty: Add new club
  const addClub = async (newClubData: Omit<Club, 'id' | 'members'>) => {
    const { data, error } = await supabase.from('clubs').insert({
      name: newClubData.name,
      category: newClubData.category,
      faculty: newClubData.faculty,
      description: newClubData.description,
      tagline: newClubData.tagline,
    }).select().single()

    if (error) { toast.error('Failed to create team: ' + error.message); return }

    const created: Club = { ...newClubData, id: data.id, members: 1 }
    setClubs((prev) => [created, ...prev])
    toast.success('Created team: ' + newClubData.name)
  }

  // Faculty: Delete club
  const deleteClub = async (clubId: string) => {
    const { error } = await supabase.from('clubs').delete().eq('id', clubId)
    if (error) { toast.error('فشل حذف التيم: ' + error.message); return }
    setClubs((prev) => prev.filter((c) => c.id !== clubId))
    toast.success('تم حذف التيم بنجاح')
  }

  // Faculty: Add Admin Account
  const addAdmin = async (adminData: Omit<AdminAccount, 'id' | 'createdAt' | 'status'>) => {
    const newId = 'adm-' + Date.now()
    const { data, error } = await supabase.from('platform_admins').insert({
      id: newId,
      name: adminData.name,
      email: adminData.email,
      faculty: adminData.faculty,
      assigned_team_id: adminData.assignedTeamId,
      assigned_team_name: adminData.assignedTeamName,
      status: 'Active'
    }).select().single()

    if (error) { toast.error('Failed to create admin: ' + error.message); return }

    const { data: profile } = await supabase.from('profiles').select('id').eq('email', adminData.email).single()
    if (profile) {
      const { error: insertError } = await supabase.from('club_members').upsert({
        user_id: profile.id,
        club_id: adminData.assignedTeamId,
        role: 'leader',
        status: 'active'
      }, { onConflict: 'club_id, user_id' })

      if (insertError) { toast.error('Promotion error: ' + insertError.message) }
      else { toast.success('User promoted to Leader successfully!') }
    } else {
      toast.info('Leader saved, but email is not registered yet.')
    }

    const newAdmin: AdminAccount = {
      ...adminData,
      id: data.id,
      createdAt: new Date(data.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      status: data.status as 'Active' | 'Pending',
    }
    setAdmins((prev) => [newAdmin, ...prev])
    toast.success('Admin created: ' + adminData.name + ' assigned to ' + adminData.assignedTeamName)
  }

  // Faculty: Remove Admin Account
  const removeAdmin = async (adminId: string) => {
    const { error } = await supabase.from('platform_admins').delete().eq('id', adminId)
    if (error) { toast.error('Failed to delete admin: ' + error.message); return }
    setAdmins((prev) => prev.filter((a) => a.id !== adminId))
    toast.info('Admin account removed')
  }

  // Applicant: Apply to Club
  const applyToClub = async (
    clubId: string,
    clubName: string,
    role: string,
    note?: string,
    cvLink?: string,
    whatsapp?: string,
    studentId?: string,
    faculty?: string,
    fullName?: string
  ) => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) { toast.error('يجب تسجيل الدخول أولاً للتقديم'); return }

    // 1. Update user's profile with latest details
    const profileUpdates: any = {}
    if (whatsapp) profileUpdates.whatsapp = whatsapp
    if (studentId) profileUpdates.student_id = studentId
    if (faculty) profileUpdates.faculty = faculty
    if (fullName) profileUpdates.full_name = fullName
    if (Object.keys(profileUpdates).length > 0) {
      await supabase.from('profiles').update(profileUpdates).eq('id', session.user.id)
    }

    // 2. Insert or upsert into club_members
    const { data: memberRow, error } = await supabase.from('club_members').upsert({
      club_id: clubId,
      user_id: session.user.id,
      role: 'member',
      status: 'pending'
    }, { onConflict: 'club_id,user_id' }).select().single()

    if (error) { toast.error('فشل تقديم الطلب: ' + error.message); return }

    // 3. Save CV link and reason into promotion_requests
    if (cvLink || note) {
      await supabase.from('promotion_requests').insert({
        club_id: clubId,
        user_id: session.user.id,
        member_name: fullName || session.user.user_metadata?.full_name || 'طالب',
        department: faculty || 'غير محدد',
        phone: whatsapp || '',
        cv_link: cvLink || '',
        reason: note || 'طلب انضمام للفريق',
        status: 'Pending'
      })
    }

    const dateStr = new Date().toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })
    const appId = memberRow?.id || ('app-' + Date.now())
    
    setStudentApplications((prev) => [{
      id: appId,
      clubId,
      clubName,
      role,
      submitted: dateStr,
      status: 'Pending',
      note: note || 'تم إرسال الطلب وهو قيد المراجعة.',
    }, ...prev])

    // Also update applicants state if currently viewing this club
    if (currentClubId === clubId) {
      setApplicants((prev) => [{
        id: appId,
        name: fullName || 'طالب جديد',
        faculty: faculty || 'غير محدد',
        year: 'N/A',
        role: role || 'عضو',
        stage: 'Reviewing',
        score: 0,
        portfolio: cvLink || '',
        cvLink: cvLink || '',
        motivation: note || '',
        email: session.user.email || '',
        whatsapp: whatsapp || '',
        studentId: studentId || '',
        submittedAt: dateStr,
      }, ...prev])
    }

    toast.success('تم إرسال طلب الانضمام إلى ' + clubName + ' بنجاح!')
  }

  // Assistant: Advance stage
  const advanceApplicantStage = (id: string) => {
    setApplicants((prev) =>
      prev.map((a) => {
        if (a.id !== id) return a
        const stages: Applicant['stage'][] = ['Reviewing', 'Interview', 'Accepted']
        const idx = stages.indexOf(a.stage)
        const next = stages[Math.min(idx + 1, stages.length - 1)]
        return { ...a, stage: next }
      })
    )
  }

  // Assistant: Accept Applicant into Team
  const acceptApplicantToTeam = async (applicantId: string) => {
    const target = applicants.find((a) => a.id === applicantId)
    if (!target) return

    const { data, error } = await supabase
      .from('club_members')
      .update({ status: 'active' })
      .eq('id', applicantId)
      .select()

    if (error) {
      toast.error('حدث خطأ في الداتا بيز: ' + error.message)
      return
    }

    if (!data || data.length === 0) {
      toast.error('لم يتم تحديث السجل في الداتا بيز.')
      return
    }

    toast.success(`تم قبول ${target.name} رسمياً بالفريق وتم الحفظ بنجاح! 👑`)

    setApplicants((prev) => prev.filter((a) => a.id !== applicantId))

    const initials = target.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || 'ST'
    setMembers((prev) => [
      {
        id: applicantId,
        name: target.name,
        initials: initials || 'NEW',
        department: target.role,
        role: 'Member',
        joined: 'Recently',
        attendance: 100,
        tasksDone: 0,
      },
      ...prev,
    ])
  }

  // Assistant: Reject applicant
  const rejectApplicant = async (applicantId: string) => {
    await supabase.from('club_members').update({ status: 'rejected' }).eq('id', applicantId)
    setApplicants((prev) => prev.filter((a) => a.id !== applicantId))
    toast.info('Application rejected')
  }

  // Leader: Member Role Update
  const updateMemberRole = async (memberId: string, role: 'Leader' | 'Vice Leader' | 'Member') => {
    let dbRole = 'member'
    if (role === 'Leader') dbRole = 'leader'
    if (role === 'Vice Leader') dbRole = 'assistant'

    const { error } = await supabase
      .from('club_members')
      .update({ role: dbRole })
      .or(`id.eq.${memberId},user_id.eq.${memberId}`)

    if (error) { toast.error('فشل تحديث الرتبة: ' + error.message); return }

    setMembers((prev) => prev.map((m) => (m.id === memberId ? { ...m, role } : m)))
    toast.success(role === 'Member' ? 'تم تخفيض الرتبة إلى عضو بنجاح' : 'تم تحديث رتبة العضو بنجاح')
  }

  // Member: Request Promotion
  const requestPromotion = async (memberName: string, department: string, phone: string, cvLink: string, reason: string) => {
    if (!currentClubId) return
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) return

    const { data, error } = await supabase.from('promotion_requests').insert({
      club_id: currentClubId,
      user_id: session.user.id,
      member_name: memberName,
      department: department,
      phone: phone,
      cv_link: cvLink,
      requested_role: 'Vice Leader',
      reason: reason,
      status: 'Pending'
    }).select().single()

    if (error) { toast.error(error.message); return }

    setPromotionRequests((prev) => [{
      id: data.id,
      memberName,
      memberInitials: memberName.substring(0, 2).toUpperCase(),
      department,
      requestedRole: 'Vice Leader',
      submittedAt: new Date(data.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      status: 'Pending',
      reason,
    }, ...prev])
    toast.success('تم إرسال طلب الترقية للليدر بنجاح!')
  }

  // Leader: Approve Member Promotion
  const approvePromotion = async (requestId: string) => {
    const req = promotionRequests.find((r) => r.id === requestId)
    if (!req) return

    const { error } = await supabase.from('promotion_requests').update({ status: 'Approved' }).eq('id', requestId)
    if (error) { toast.error(error.message); return }

    // Also update club_members role
    const { data: promData } = await supabase.from('promotion_requests').select('user_id').eq('id', requestId).single()
    if (promData) {
       await supabase.from('club_members').update({ role: 'assistant' }).eq('user_id', promData.user_id).eq('club_id', currentClubId)
    }

    setPromotionRequests((prev) => prev.map((r) => (r.id === requestId ? { ...r, status: 'Approved' } : r)))
    setMembers((prev) => prev.map((m) => m.name === req.memberName ? { ...m, role: 'Vice Leader' } : m))

    toast.success('Promotion approved! ' + req.memberName + ' is now Vice Leader!')
  }

  // Leader: Reject Promotion
  const rejectPromotion = async (requestId: string) => {
    await supabase.from('promotion_requests').update({ status: 'Rejected' }).eq('id', requestId)
    toast.info('Promotion request rejected')
  }

  // Leader: Promote Assistant / Admin by Email directly
  const promoteAssistantByEmail = async (email: string) => {
    const cleanEmail = email.trim().toLowerCase()
    if (!cleanEmail) {
      toast.error('برجاء إدخال البريد الإلكتروني')
      return
    }

    const { data: { session } } = await supabase.auth.getSession()
    const currentUser = session?.user
    if (!currentUser) {
      toast.error('يجب عليك تسجيل الدخول أولاً')
      return
    }

    let targetClubId = currentClubId

    if (!targetClubId) {
      // 1. Check club_members for active membership
      const { data: mem } = await supabase
        .from('club_members')
        .select('club_id')
        .eq('user_id', currentUser.id)
        .eq('status', 'active')
        .limit(1)
        .maybeSingle()

      if (mem?.club_id) {
        targetClubId = mem.club_id
      } else {
        // 2. Check platform_admins for assigned_team_id
        const { data: adm } = await supabase
          .from('platform_admins')
          .select('assigned_team_id')
          .eq('email', currentUser.email)
          .limit(1)
          .maybeSingle()

        if (adm?.assigned_team_id) {
          targetClubId = adm.assigned_team_id
        }
      }
    }

    if (!targetClubId) {
      toast.error('لم يتم العثور على تيم مسند لحسابك الحالي.')
      return
    }

    // 1. Find profile in Supabase
    const { data: profile, error: profError } = await supabase
      .from('profiles')
      .select('id, full_name')
      .eq('email', cleanEmail)
      .maybeSingle()

    if (profError || !profile) {
      toast.error('لم يتم العثور على حساب بهذا البريد الإلكتروني. يجب على الطالب التسجيل في المنصة أولاً.')
      return
    }

    // 2. Upsert into club_members setting role = 'assistant', status = 'active'
    const { data: upsertData, error: upsertErr } = await supabase.from('club_members').upsert(
      {
        user_id: profile.id,
        club_id: targetClubId,
        role: 'assistant',
        status: 'active',
      },
      { onConflict: 'club_id, user_id' }
    ).select('id').single()

    if (upsertErr) {
      toast.error('حدث خطأ أثناء الترقية: ' + upsertErr.message)
      return
    }

    toast.success(`تمت ترقية ${profile.full_name || cleanEmail} إلى أدمن / مساعد الفريق بنجاح! 👑`)

    // Update local state for members UI
    const rowId = upsertData?.id || profile.id
    const name = profile.full_name || cleanEmail
    const initials = name.substring(0, 2).toUpperCase()
    setMembers((prev) => {
      const exists = prev.find((m) => m.id === rowId || m.id === profile.id)
      if (exists) {
        return prev.map((m) => ((m.id === rowId || m.id === profile.id) ? { ...m, id: rowId, role: 'Vice Leader' } : m))
      } else {
        return [
          {
            id: rowId,
            name,
            initials,
            department: 'General',
            role: 'Vice Leader',
            joined: 'Recently',
            attendance: 100,
            tasksDone: 0,
          },
          ...prev,
        ]
      }
    })
  }

  // Announcements
  const addAnnouncement = async (annData: Omit<Announcement, 'id' | 'date'>) => {
    let clubId = currentClubId
    if (!clubId) {
      // Fallback: try to resolve clubId dynamically
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { toast.error('يجب تسجيل الدخول أولاً'); return }
      const { data: membership } = await supabase.from('club_members').select('club_id').eq('user_id', user.id).eq('status', 'active').limit(1).maybeSingle()
      if (membership) {
        clubId = membership.club_id
        setCurrentClubId(clubId)
      } else {
        const { data: adminRec } = await supabase.from('platform_admins').select('assigned_team_id').eq('email', user.email!).limit(1).maybeSingle()
        if (adminRec?.assigned_team_id) {
          clubId = adminRec.assigned_team_id
          setCurrentClubId(clubId)
        }
      }
      if (!clubId) { toast.error('لم يتم تحديد الفريق'); return }
    }
    const { data, error } = await supabase.from('announcements').insert({
      club_id: clubId,
      title: annData.title,
      body: annData.body,
      author: annData.author,
      pinned: annData.pinned
    }).select().single()

    if (error) { toast.error(error.message); return }

    setAnnouncements((prev) => [{
      ...annData,
      id: data.id,
      date: new Date(data.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    }, ...prev])
    toast.success('تم نشر الإعلان بنجاح!')
  }

  // Delete Announcement
  const deleteAnnouncement = async (announcementId: string) => {
    const { error } = await supabase.from('announcements').delete().eq('id', announcementId)
    if (error) {
      toast.error('فشل حذف الإعلان: ' + error.message)
      return
    }
    setAnnouncements((prev) => prev.filter((a) => a.id !== announcementId))
    toast.success('تم حذف الإعلان بنجاح!')
  }

  // Tasks
  const toggleTaskStatus = async (taskId: string) => {
    const task = myTasks.find(t => t.id === taskId)
    if (!task) return
    const nextStatus = task.status === 'Done' ? 'To Do' : 'Done'
    
    await supabase.from('tasks').update({ status: nextStatus }).eq('id', taskId)
    
    setMyTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status: nextStatus } : t)))
  }

  // Interviews
  const addInterview = async (interviewData: Omit<Interview, 'id'>) => {
    if (!currentClubId) return
    const { data, error } = await supabase.from('interviews').insert({
       club_id: currentClubId,
       applicant_name: interviewData.applicant,
       role: interviewData.role,
       date: interviewData.date,
       time: interviewData.time,
       interviewer: interviewData.interviewer
    }).select().single()

    if (error) { toast.error(error.message); return }

    setInterviews((prev) => [{
      ...interviewData,
      id: data.id,
    }, ...prev])
    toast.success('Interview scheduled for ' + interviewData.applicant)
  }

  // Delete Team Event
  const deleteTeamEvent = async (eventId: string) => {
    const { error } = await supabase.from('team_events').delete().eq('id', eventId)
    if (error) {
      toast.error('فشل حذف الحدث: ' + error.message)
      return
    }
    setTeamEvents((prev) => prev.filter((e) => e.id !== eventId))
    toast.success('تم حذف الحدث بنجاح من الموقع!')
  }

  return (
    <SystemContext.Provider
      value={{
        clubs,
        addClub,
        deleteClub,
        admins,
        addAdmin,
        removeAdmin,
        studentApplications,
        applyToClub,
        applicants,
        advanceApplicantStage,
        acceptApplicantToTeam,
        rejectApplicant,
        members,
        updateMemberRole,
        promotionRequests,
        requestPromotion,
        approvePromotion,
        rejectPromotion,
        promoteAssistantByEmail,
        announcements,
        addAnnouncement,
        deleteAnnouncement,
        myTasks,
        toggleTaskStatus,
        teamEvents,
        deleteTeamEvent,
        interviews,
        addInterview,
      }}
    >
      {children}
    </SystemContext.Provider>
  )
}

export function useSystem() {
  const context = useContext(SystemContext)
  if (!context) throw new Error('useSystem must be used within a SystemProvider')
  return context
}
