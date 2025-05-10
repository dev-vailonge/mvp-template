'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { GoogleButton } from '@/components/GoogleButton'
import { PasswordInput } from '@/components/PasswordInput'
import { supabase } from '@/lib/supabase'

export default function SignUp() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [errors, setErrors] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    form: ''
  })

  const validateForm = () => {
    const newErrors = {
      email: '',
      password: '',
      confirmPassword: '',
      form: ''
    }

    if (!formData.email) {
      newErrors.email = 'Email é obrigatório'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Por favor, insira um email válido'
    }

    if (!formData.password) {
      newErrors.password = 'Senha é obrigatória'
    } else if (formData.password.length < 6) {
      newErrors.password = 'A senha deve ter pelo menos 6 caracteres'
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Por favor, confirme sua senha'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'As senhas não coincidem'
    }

    setErrors(newErrors)
    return !Object.values(newErrors).some(error => error !== '')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    try {
      setLoading(true)
      const { error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      })

      if (error) throw error

      router.push('/login?message=check-email')
    } catch (error) {
      console.error('Error:', error)
      setErrors(prev => ({
        ...prev,
        form: 'Ocorreu um erro durante o cadastro. Por favor, tente novamente.'
      }))
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    try {
      const redirectUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin
      console.log('Signup Redirect URL:', redirectUrl)
      console.log('Full redirect path:', `${redirectUrl}/dashboard`)
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${redirectUrl}/dashboard`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent'
          }
        }
      })
      if (error) throw error
    } catch (error) {
      console.error('Error:', error)
      setErrors(prev => ({
        ...prev,
        form: 'Ocorreu um erro durante o login com Google. Por favor, tente novamente.'
      }))
    }
  }

  return (
    <div className="min-h-screen bg-purple-100">
      <div className="max-w-md mx-auto pt-16 p-6">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-900">Criar sua conta</h1>
        
        <div className="space-y-6">
          <GoogleButton onClick={handleGoogleSignIn} />

          {errors.form && (
            <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg border border-red-200">
              {errors.form}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-900 mb-1">
                Endereço de Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="Seu endereço de email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 text-gray-900 placeholder:text-gray-500 ${
                  errors.email 
                    ? 'border-red-500 focus:ring-red-500' 
                    : 'border-gray-300 focus:ring-purple-600 focus:border-purple-600'
                }`}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            <PasswordInput
              id="password"
              label="Senha"
              placeholder="Crie uma senha"
              value={formData.password}
              onChange={(value) => setFormData(prev => ({ ...prev, password: value }))}
              error={errors.password}
            />

            <PasswordInput
              id="confirmPassword"
              label="Confirmar Senha"
              placeholder="Confirme sua senha"
              value={formData.confirmPassword}
              onChange={(value) => setFormData(prev => ({ ...prev, confirmPassword: value }))}
              error={errors.confirmPassword}
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-purple-700 text-white py-3 px-4 rounded-lg hover:bg-purple-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Criando conta...' : 'Criar conta'}
            </button>
          </form>

          <div className="text-center text-sm">
            <Link href="/login" className="text-purple-700 hover:text-purple-900 hover:underline">
              Já tem uma conta? Entre aqui
            </Link>
          </div>

          <p className="text-center text-sm text-gray-700 mt-8">
            Ao continuar, eu concordo com os{' '}
            <Link href="/terms" className="text-purple-700 hover:text-purple-900 hover:underline">
              Termos de Serviço
            </Link>{' '}
            e{' '}
            <Link href="/privacy" className="text-purple-700 hover:text-purple-900 hover:underline">
              Política de Privacidade
            </Link>
          </p>

          <p className="text-center text-sm text-gray-700">
            Problemas para se cadastrar?{' '}
            <Link href="/help" className="text-purple-700 hover:text-purple-900 hover:underline">
              Clique Aqui
            </Link>{' '}
            e tente novamente.
          </p>
        </div>
      </div>
    </div>
  )
} 