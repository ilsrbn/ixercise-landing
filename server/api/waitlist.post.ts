import { createError, getRequestHeader, readBody } from 'h3'

type WaitlistBody = {
  name?: string
  email?: string
  note?: string
  company?: string
}

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default defineEventHandler(async (event) => {
  const body = await readBody<WaitlistBody>(event)
  const email = body.email?.trim().toLowerCase() || ''
  const name = body.name?.trim() || ''
  const note = body.note?.trim() || ''

  if (body.company) {
    return { ok: true }
  }

  if (!emailPattern.test(email)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'A valid email is required.'
    })
  }

  if (name.length > 120 || email.length > 254 || note.length > 1200) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Submitted details are too long.'
    })
  }

  const config = useRuntimeConfig(event)
  const submission = {
    name,
    email,
    note,
    userAgent: getRequestHeader(event, 'user-agent') || '',
    referer: getRequestHeader(event, 'referer') || '',
    createdAt: new Date().toISOString()
  }

  console.info('Ixercise waitlist submission', submission)

  const resendApiKey = config.resendApiKey || process.env.RESEND_API_KEY || ''
  const waitlistToEmail = config.waitlistToEmail || process.env.WAITLIST_TO_EMAIL || ''
  const waitlistFromEmail =
    config.waitlistFromEmail || process.env.WAITLIST_FROM_EMAIL || 'Ixercise Waitlist <onboarding@resend.dev>'

  if (!resendApiKey || !waitlistToEmail) {
    return { ok: true, delivery: 'log' }
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: waitlistFromEmail,
      to: [waitlistToEmail],
      subject: 'New Ixercise waitlist signup',
      text: [
        'New Ixercise waitlist signup',
        '',
        `Name: ${name || '-'}`,
        `Email: ${email}`,
        `Note: ${note || '-'}`,
        `Created: ${submission.createdAt}`,
        `Referer: ${submission.referer || '-'}`,
        `User agent: ${submission.userAgent || '-'}`
      ].join('\n')
    })
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error('Failed to send waitlist email', errorText)

    throw createError({
      statusCode: 502,
      statusMessage: 'Could not send waitlist notification.'
    })
  }

  return { ok: true, delivery: 'email' }
})
