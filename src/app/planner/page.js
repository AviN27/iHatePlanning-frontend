import PlannerContent from './plannerContent'
import { createClient } from '../../../utils/supabase/server'
import { redirect } from 'next/navigation'
import "../planner/planner.css"

export default async function Account() {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return redirect("/");
  } else {
    return <PlannerContent user={user}/> 
  }
}