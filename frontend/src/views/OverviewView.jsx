// src/views/OverviewView.jsx
import { Users, AlertTriangle, CheckCircle2, Zap, Link2, Eye } from 'lucide-react'
import { StatCard, SBadge } from '../components/UI.jsx'
import { P } from '../styles/theme.js'

export default function OverviewView({ officers, links, setTab }) {
  const pending  = officers.filter(o => o.status === 'rejected').length
  const approved = officers.filter(o => o.status === 'approved').length
  const credits  = officers.reduce((s, o) => s + (o.credits || 0), 0)
  const captures = links.reduce((s, l) => s + (l.captures?.length || 0), 0)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(190px,1fr))', gap: 14 }}>
        <StatCard icon={Users}         label="Total Officers"   value={officers.length} onClick={() => setTab('officers')} />
        <StatCard icon={AlertTriangle} label="Pending Approval" value={pending}  color={P.yellow} onClick={() => setTab('officers')} />
        <StatCard icon={CheckCircle2}  label="Approved"         value={approved} color={P.green}  onClick={() => setTab('officers')} />
        <StatCard icon={Zap}           label="Total Credits"    value={credits}           onClick={() => setTab('credits')} />
        <StatCard icon={Link2}         label="Tracking Links"   value={links.length} color={P.purple} onClick={() => setTab('links')} />
        <StatCard icon={Eye}           label="Total Captures"   value={captures} color={P.red}    onClick={() => setTab('links')} />
      </div>


    </div>
  )
}