"use server"

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '../../../utils/supabase/server'

export async function signout() {
    const supabase = createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()
    
    if (user) {
    await supabase.auth.signOut()
    }

    revalidatePath('/', 'layout')
    redirect('https://i-hate-planning-frontend.vercel.app')
}