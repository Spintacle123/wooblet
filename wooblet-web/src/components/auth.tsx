'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PawPrint, ArrowRight, ShieldCheck } from 'lucide-react';
import { useActionMutation, useResourceQuery } from '@/lib/store';
import { ErrorBox, Notice, Field, Loading, TagArt } from './ui';
export function AuthGate({ children, admin = false }: { children: React.ReactNode; admin?: boolean }) {
  const { data: user, isLoading, error } = useResourceQuery('auth/me'); const pathname = usePathname(); const next = encodeURIComponent(pathname);
  if (isLoading) return <Loading />;
  if (!user) return <div className="narrow section auth-gate"><PawPrint className="auth-paw" size={32} /><h1>Please sign in.</h1><p>Sign in to manage your pets, Wooblets, and orders.</p>{error && (error as any).status !== 401 && <ErrorBox error={error} />}<div className="auth-gate-actions"><Link href={`/login?next=${next}`} className="btn">Sign in <ArrowRight size={18} /></Link><Link href={`/register?next=${next}`} className="btn outline">Create an account</Link></div></div>;
  if (admin && user.role !== 'ADMIN') return <div className="narrow section"><h1>Administrator access required.</h1><Link className="btn" href="/dashboard">Go to my dashboard</Link></div>;
  return children;
}
export function AuthPage({ mode }: { mode: string }) {
  const router = useRouter(); const [action, { isLoading, error }] = useActionMutation(); const [message, setMessage] = useState(''); const [token, setToken] = useState(''); const [next, setNext] = useState('/dashboard');
  useEffect(() => { const q = new URLSearchParams(window.location.search); setToken(q.get('token') ?? ''); const target = q.get('next'); if (target?.startsWith('/') && !target.startsWith('//') && !target.includes('\\')) setNext(target); }, []);
  const register = mode === 'register'; const login = mode === 'login'; const reset = mode === 'reset-password'; const verify = mode === 'verify-email';
  const schema = z.object({ email: !reset && !verify ? z.email('Enter a valid email address.') : z.string(), password: register || reset ? z.string().min(10, 'Use at least 10 characters.').max(72) : login ? z.string().min(1, 'Enter your password.') : z.string(), firstName: register ? z.string().min(1, 'Enter your first name.').max(60) : z.string(), lastName: register ? z.string().min(1, 'Enter your last name.').max(60) : z.string() });
  const { register: field, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(schema), defaultValues: { email: '', password: '', firstName: '', lastName: '' } });
  async function submit(data: z.infer<typeof schema>) {
    try {
      const body = register ? data : login ? { email: data.email, password: data.password } : reset ? { token, password: data.password } : verify ? { token } : { email: data.email };
      const result = await action({ path: `auth/${mode}`, body }).unwrap();
      if (login || register) router.push(next); else setMessage(result.message);
    } catch { /* Mutation displays its error below. */ }
  }
  const titles: Record<string, string> = { login: 'Welcome back.', register: 'Create your account', 'forgot-password': 'Reset your password', 'reset-password': 'Set a new password', 'verify-email': 'Verify your email' };
  return <main className="auth-layout container"><div className="auth-aside"><div className="eyebrow">WELCOME TO THE WOOBLET FAMILY</div><h2>Their profile,<br /><em>one tap away.</em></h2><TagArt design="heart" color="Terracotta" name="LUNA" /><p>Manage pets, tags, and orders in one place.</p></div><div className="auth-form"><PawPrint className="auth-paw" size={32} /><h1>{titles[mode]}</h1><p>{login ? 'Sign in to manage your pets, tags, and orders.' : register ? 'You need an account to order tags and set up your pet’s profile.' : verify ? 'Confirm your email using the link we sent you.' : 'Enter your email and we’ll send you a reset link.'}</p>{error && <ErrorBox error={error} />}{message ? <><Notice>{message}</Notice><Link href="/login" className="btn">Go to sign in</Link></> : <form onSubmit={handleSubmit(submit)} noValidate>{register && <div className="form-row"><Field label="First name" error={errors.firstName?.message}><input autoComplete="given-name" {...field('firstName')} /></Field><Field label="Last name" error={errors.lastName?.message}><input autoComplete="family-name" {...field('lastName')} /></Field></div>}{!reset && !verify && <Field label="Email address" error={errors.email?.message}><input type="email" autoComplete="email" placeholder="you@example.com" {...field('email')} /></Field>}{(register || login || reset) && <Field label="Password" error={errors.password?.message}><input type="password" autoComplete={login ? 'current-password' : 'new-password'} placeholder={register || reset ? 'At least 10 characters' : 'Your password'} {...field('password')} /></Field>}{login && <Link href="/forgot-password" className="forgot-link">Forgot your password?</Link>}<button className="btn full" disabled={isLoading || ((reset || verify) && !token)}>{isLoading ? 'One moment…' : register ? 'Create account' : login ? 'Sign in' : reset ? 'Update password' : verify ? 'Verify my email' : 'Send reset link'} <ArrowRight size={18} /></button>{register && <small className="muted">By creating an account, you agree to our <Link href="/terms">terms</Link> and <Link href="/privacy">privacy policy</Link>.</small>}</form>}{(login || register) && <div className="auth-switch">{login ? 'New to Wooblet?' : 'Already have an account?'} <Link href={`${login ? '/register' : '/login'}?next=${encodeURIComponent(next)}`}>{login ? 'Create an account' : 'Sign in'}</Link></div>}<div className="secure-note"><ShieldCheck size={16} /> Your address is never shown on your pet’s public profile.</div></div></main>;
}
