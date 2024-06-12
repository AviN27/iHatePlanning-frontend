import CreatePlanner from './createContent'
import { createClient } from '../../../utils/supabase/server'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'

export default async function Account() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  
  if (!user) {
    return redirect("/");
  } else {
    return (
      <Suspense>
        <CreatePlanner user={user} /> 
      </Suspense>
    )
  }
}