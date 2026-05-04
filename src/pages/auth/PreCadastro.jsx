import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function PreCadastro() {
  const navigate = useNavigate()
  useEffect(() => { navigate('/primeiro-acesso', { replace: true }) }, [navigate])
  return null
}
