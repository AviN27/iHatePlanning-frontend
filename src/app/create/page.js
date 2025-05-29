import CreatePlanner from './createContent'
import { createClient } from '../../../utils/supabase/server'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'

export default async function Account() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  
  const {
    data: { session },
  } = await supabase.auth.getSession()
  
  if (!user) {
    return redirect("/");
  } else {
    return (
      <Suspense>
        <CreatePlanner user={user} currentSession={session} /> 
      </Suspense>
    )
  }
}