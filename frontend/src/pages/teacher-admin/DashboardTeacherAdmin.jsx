import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Card from '../../components/ui/Card'
import StatCard from '../../components/ui/StatCard'
import { ROUTES } from '../../utils/constants'
import adminService from '../../services/adminService'

const initialStats = {
  totalUsers: 0,
  students: 0,
  teachers: 0,
  structures: 0,
  inscriptions: 0,
  loaded: false,
}

export default function DashboardTeacherAdmin() {
  const [stats, setStats] = useState(initialStats)
  const navigate = useNavigate()

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await adminService.getDashboardStats()
        setStats({
          totalUsers: data.students + data.teachers,
          students: data.students,
          teachers: data.teachers,
          structures: data.structures,
          inscriptions: data.inscriptions,
          loaded: true,
        })
      } catch (error) {
        console.error('Impossible de charger les statistiques :', error)
      }
    }

    loadStats()
  }, [])

  const STATS = [
    {
      label: 'Étudiants',
      value: stats.loaded ? stats.students : '...',
      sub: 'actifs',
    },
    {
      label: 'Enseignants',
      value: stats.loaded ? stats.teachers : '...',
      sub: 'actifs',
    },
    {
      label: 'Structures',
      value: stats.loaded ? stats.structures : '...',
      sub: 'formations',
    },
    {
      label: 'Inscriptions',
      value: stats.loaded ? stats.inscriptions : '...',
      sub: 'ce semestre',
    },
  ]

  return (
    <div className="fade-in space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-slate-800">Gestion du Système</h2>
        <p className="text-slate-500 mt-1">Bienvenue Administrateur, consultez et gérez les entités du système</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {STATS.map((stat) => (
          <div
            key={stat.label}
            className="text-left w-full rounded-xl border border-slate-100 bg-white transition"
          >
            <StatCard {...stat} />
          </div>
        ))}
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="p-6 cursor-pointer hover:shadow-lg transition" onClick={() => navigate(ROUTES.ETUDIANTS_ADMIN)}>
          <div className="flex items-center gap-3 mb-2">
            <h3 className="font-semibold text-slate-800">Étudiants</h3>
          </div>
          <p className="text-sm text-slate-500">Accéder à la page des étudiants</p>
        </Card>

        <Card className="p-6 cursor-pointer hover:shadow-lg transition" onClick={() => navigate(ROUTES.ENSEIGNANTS_ADMIN)}>
          <div className="flex items-center gap-3 mb-2">
            <h3 className="font-semibold text-slate-800">Enseignants</h3>
          </div>
          <p className="text-sm text-slate-500">Accéder à la page des enseignants</p>
        </Card>

        <Card className="p-6 cursor-pointer hover:shadow-lg transition">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="font-semibold text-slate-800">Structures</h3>
          </div>
          <p className="text-sm text-slate-500">Formations, Niveaux, Semestres</p>
        </Card>

        <Card className="p-6 cursor-pointer hover:shadow-lg transition">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="font-semibold text-slate-800">Enseignement</h3>
          </div>
          <p className="text-sm text-slate-500">Unités, Composantes, Crédits</p>
        </Card>

        <Card className="p-6 cursor-pointer hover:shadow-lg transition">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="font-semibold text-slate-800">Inscriptions</h3>
          </div>
          <p className="text-sm text-slate-500">Gestion des enrollements</p>
        </Card>
      </div>
    </div>
  )
}
