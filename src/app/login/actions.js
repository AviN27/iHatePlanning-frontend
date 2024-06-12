'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '../../../utils/supabase/server'

export async function login(formData) {
  const supabase = createClient()

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const data = {
    email: formData['email'],
    password: formData['password']
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    redirect('/error')
  }

  revalidatePath('/', 'layout')
  redirect('https://i-hate-planning-frontend.vercel.app/planner')
}

export async function signup(formData) {
  const supabase = createClient()

  const data = {
    email: formData['email'],
    password: formData['password'],
    options: { 
      data: { 
        display_name: formData['name'] 
      }, 
      redirectTo: 'https://i-hate-planning-frontend.vercel.app/planner' 
    }
  }

  const { error } = await supabase.auth.signUp(data)

  if (error) {
    redirect('/error')
  }

  revalidatePath('/', 'layout')
  redirect('/planner')
}

export async function googleAuth() {
  const supabase = createClient()
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      scopes: 'https://www.googleapis.com/auth/calendar',
      redirectTo: `https://i-hate-planning-frontend.vercel.app/auth/callback`
    },
  })

  if (data.url) {
    redirect(data.url) // use the redirect API for your server framework
  } else {
    redirect('/error')
  }
}