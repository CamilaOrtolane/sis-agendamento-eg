import { useEffect, useMemo, useRef, useState } from "react"
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Calendar,
  CalendarCheck,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleDot,
  Clock3,
  Eye,
  EyeOff,
  GraduationCap,
  LayoutDashboard,
  ListChecks,
  LockKeyhole,
  LogOut,
  Mail,
  MapPin,
  Menu,
  Monitor,
  Plus,
  Search,
  UserRound,
  Users,
  Video,
  X,
} from "lucide-react"

type Page = "dashboard" | "agenda" | "new" | "success" | "appointments"
type Status = "Agendado" | "Em andamento" | "Concluído" | "Cancelado"
type Modality = "Presencial" | "Online"
type Appointment = {
  id: number
  subject: string
  date: string
  dateLabel: string
  time: string
  modality: Modality
  status: Status
  description: string
  outcome?: string
}

const SUBJECTS = [
  "Orientação acadêmica",
  "Matrícula e disciplinas",
  "Estágio supervisionado",
  "Trabalho de Conclusão de Curso (TCC)",
  "Aproveitamento de disciplinas",
  "Outros assuntos",
]

const AVAILABILITY: Record<string, string[]> = {
  "2026-10-26": ["09:00", "09:30", "10:00", "14:00", "14:30"],
  "2026-10-27": ["09:30", "11:00", "14:00", "15:30"],
  "2026-10-28": ["10:30", "11:00", "13:30", "16:00"],
  "2026-10-29": ["08:30", "09:00", "15:00"],
  "2026-11-03": ["09:00", "10:00", "14:30"],
  "2026-11-05": ["09:30", "11:30", "16:00"],
  "2026-11-10": ["08:30", "10:30", "14:00"],
}

const INITIAL_APPOINTMENTS: Appointment[] = [
  {
    id: 1,
    subject: "Orientação sobre estágio",
    date: "2026-10-26",
    dateLabel: "26 de outubro de 2026",
    time: "14:00",
    modality: "Presencial",
    status: "Agendado",
    description:
      "Gostaria de esclarecer dúvidas sobre a documentação necessária para iniciar o estágio supervisionado.",
  },
  {
    id: 2,
    subject: "Ajuste de matrícula",
    date: "2026-10-22",
    dateLabel: "22 de outubro de 2026",
    time: "10:30",
    modality: "Online",
    status: "Em andamento",
    description: "Preciso verificar a inclusão de uma disciplina optativa.",
  },
  {
    id: 3,
    subject: "Aproveitamento de disciplinas",
    date: "2026-10-14",
    dateLabel: "14 de outubro de 2026",
    time: "09:00",
    modality: "Presencial",
    status: "Concluído",
    description:
      "Solicitação de análise das disciplinas cursadas em outra instituição.",
    outcome: "Documentação recebida e encaminhada para análise do colegiado.",
  },
  {
    id: 4,
    subject: "Orientação para o TCC",
    date: "2026-09-30",
    dateLabel: "30 de setembro de 2026",
    time: "15:00",
    modality: "Online",
    status: "Concluído",
    description: "Dúvidas sobre o calendário de entregas do TCC.",
    outcome: "Cronograma revisado e orientações enviadas por e-mail.",
  },
  {
    id: 5,
    subject: "Atividades complementares",
    date: "2026-09-18",
    dateLabel: "18 de setembro de 2026",
    time: "11:00",
    modality: "Presencial",
    status: "Cancelado",
    description: "Validação das horas de atividades complementares.",
  },
]

function formatDate(date: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(`${date}T12:00:00`))
}

function shortDate(date: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
    .format(new Date(`${date}T12:00:00`))
    .replace(".", "")
}

function Button({
  children,
  variant = "primary",
  icon,
  disabled,
  type = "button",
  onClick,
  className = "",
}: {
  children: React.ReactNode
  variant?: "primary" | "secondary" | "ghost" | "danger"
  icon?: React.ReactNode
  disabled?: boolean
  type?: "button" | "submit"
  onClick?: () => void
  className?: string
}) {
  return (
    <button
      type={type}
      className={`button button--${variant} ${className}`}
      disabled={disabled}
      onClick={onClick}
    >
      {icon}
      {children}
    </button>
  )
}

function StatusBadge({ status }: { status: Status }) {
  return (
    <span
      className={`status status--${status.toLowerCase().replace(" ", "-")}`}
    >
      {status}
    </span>
  )
}

function AppShell({
  page,
  setPage,
  onLogout,
  children,
}: {
  page: Page
  setPage: (page: Page) => void
  onLogout: () => void
  children: React.ReactNode
}) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const profileRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!profileOpen) return

    const closeOnOutsideClick = (event: MouseEvent) => {
      if (!profileRef.current?.contains(event.target as Node)) {
        setProfileOpen(false)
      }
    }
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setProfileOpen(false)
    }

    document.addEventListener("mousedown", closeOnOutsideClick)
    document.addEventListener("keydown", closeOnEscape)
    return () => {
      document.removeEventListener("mousedown", closeOnOutsideClick)
      document.removeEventListener("keydown", closeOnEscape)
    }
  }, [profileOpen])

  const nav = (target: Page) => {
    setPage(target)
    setMobileOpen(false)
    setProfileOpen(false)
  }
  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileOpen ? "sidebar--open" : ""}`}>
        <div className="brand" onClick={() => nav("dashboard")}>
          <span className="brand__mark">
            <GraduationCap size={22} />
          </span>
          <span>
            Agenda
            <br />
            <strong>Acadêmica</strong>
          </span>
        </div>
        <nav className="sidebar__nav" aria-label="Navegação principal">
          <p className="nav-label">Principal</p>
          <button
            className={`nav-item ${page === "dashboard" ? "active" : ""}`}
            onClick={() => nav("dashboard")}
          >
            <LayoutDashboard size={19} /> Início
          </button>
          <button
            className={`nav-item ${page === "agenda" ? "active" : ""}`}
            onClick={() => nav("agenda")}
          >
            <Calendar size={19} /> Agenda
          </button>
          <button
            className={`nav-item ${page === "appointments" ? "active" : ""}`}
            onClick={() => nav("appointments")}
          >
            <ListChecks size={19} /> Meus atendimentos
          </button>
          <p className="nav-label nav-label--spaced">Minhas agendas</p>
          <button className="nav-item" onClick={() => nav("agenda")}>
            <Users size={19} /> Coordenação do curso
          </button>
        </nav>
        <div className="sidebar__help">
          <span>
            <BookOpen size={18} />
          </span>
          <div>
            <strong>Precisa de ajuda?</strong>
            <p>Consulte as orientações</p>
          </div>
        </div>
      </aside>
      {mobileOpen && (
        <button
          className="mobile-scrim"
          aria-label="Fechar menu"
          onClick={() => setMobileOpen(false)}
        />
      )}
      <div className="main-shell">
        <header className="topbar">
          <button
            className="menu-button"
            aria-label="Abrir menu"
            onClick={() => setMobileOpen(true)}
          >
            <Menu />
          </button>
          <div className="topbar__name">Agenda Acadêmica</div>
          <div className="topbar__right">
            <div className="user" ref={profileRef}>
              <div className="user__text">
                <strong>Mariana Silva</strong>
                <span>Estudante</span>
              </div>
              <button
                className="avatar"
                aria-label="Abrir menu do perfil"
                aria-haspopup="menu"
                aria-expanded={profileOpen}
                onClick={() => setProfileOpen((open) => !open)}
              >
                MS
              </button>
              {profileOpen && (
                <div className="profile-menu" role="menu">
                  <div className="profile-menu__identity">
                    <strong>Mariana Silva</strong>
                    <span>Estudante</span>
                  </div>
                  <div className="profile-menu__divider" />
                  <button className="profile-menu__item" disabled role="menuitem">
                    <UserRound size={17} />
                    <span>
                      Meu perfil
                      <small>Em breve</small>
                    </span>
                  </button>
                  <button
                    className="profile-menu__item profile-menu__item--logout"
                    role="menuitem"
                    onClick={() => {
                      setProfileOpen(false)
                      onLogout()
                    }}
                  >
                    <LogOut size={17} />
                    <span>Sair</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>
        <main className="page">{children}</main>
      </div>
    </div>
  )
}

function Login({ onLogin }: { onLogin: () => void }) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const emailIsValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  const valid = emailIsValid && password.trim().length > 0

  const submit = (event: React.FormEvent) => {
    event.preventDefault()
    setSubmitted(true)
    if (valid) onLogin()
  }

  return (
    <main className="login-page">
      <section className="login-brand-panel">
        <div className="login-brand">
          <span className="login-brand__mark">
            <GraduationCap size={25} />
          </span>
          <span>
            Agenda <strong>Acadêmica</strong>
          </span>
        </div>
        <div className="login-brand-panel__content">
          <span className="login-kicker">Atendimento acadêmico</span>
          <h1>Seu atendimento acadêmico, mais simples e organizado.</h1>
          <p>
            Consulte horários disponíveis, agende atendimentos e acompanhe suas
            solicitações em um só lugar.
          </p>
        </div>
        <div className="login-visual" aria-hidden="true">
          <div className="login-visual__calendar">
            <div className="login-visual__header">
              <span />
              <span />
              <span />
            </div>
            <div className="login-visual__grid">
              {Array.from({ length: 21 }, (_, index) => (
                <i
                  key={index}
                  className={
                    index === 9
                      ? "selected"
                      : [4, 12, 18].includes(index)
                        ? "available"
                        : ""
                  }
                />
              ))}
            </div>
          </div>
          <div className="login-visual__appointment">
            <span>
              <CalendarCheck size={18} />
            </span>
            <div>
              <i />
              <i />
            </div>
            <CheckCircle2 size={17} />
          </div>
        </div>
        <p className="login-brand-panel__footer">
          Ambiente acadêmico • Acesso institucional
        </p>
      </section>

      <section className="login-form-panel">
        <div className="login-form-wrap">
          <div className="login-mobile-brand">
            <span>
              <GraduationCap size={21} />
            </span>
            Agenda Acadêmica
          </div>
          <div className="login-heading">
            <span className="eyebrow">Acesso do estudante</span>
            <h2>Bem-vindo de volta!</h2>
            <p>
              Entre com suas credenciais para acessar sua agenda acadêmica.
            </p>
          </div>
          <form className="login-form" onSubmit={submit} noValidate>
            <label className="login-field">
              <span>E-mail</span>
              <div
                className={`login-input ${submitted && !emailIsValid ? "login-input--error" : ""}`}
              >
                <Mail size={18} />
                <input
                  type="text"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="seu.email@instituicao.edu.br"
                  autoComplete="email"
                  aria-invalid={submitted && !emailIsValid}
                />
              </div>
              {submitted && !email && (
                <small className="login-error">Informe seu e-mail.</small>
              )}
              {submitted && email && !emailIsValid && (
                <small className="login-error">
                  Digite um endereço de e-mail válido.
                </small>
              )}
            </label>
            <label className="login-field">
              <span>Senha</span>
              <div
                className={`login-input ${submitted && !password.trim() ? "login-input--error" : ""}`}
              >
                <LockKeyhole size={18} />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Digite sua senha"
                  autoComplete="current-password"
                  aria-invalid={submitted && !password.trim()}
                />
                <button
                  type="button"
                  className="password-toggle"
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                  onClick={() => setShowPassword((visible) => !visible)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {submitted && !password.trim() && (
                <small className="login-error">Informe sua senha.</small>
              )}
            </label>
            <button type="button" className="forgot-password">
              Esqueceu sua senha?
            </button>
            <Button type="submit" className="login-submit">
              Entrar
              <ArrowRight size={17} />
            </Button>
          </form>
          <p className="login-support">
            Problemas para acessar? Entre em contato com o suporte da sua
            instituição.
          </p>
        </div>
      </section>
    </main>
  )
}

function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string
  subtitle: string
  action?: React.ReactNode
}) {
  return (
    <div className="page-header">
      <div>
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>
      {action}
    </div>
  )
}

function Dashboard({
  appointments,
  goTo,
  startBooking,
  showDetails,
}: {
  appointments: Appointment[]
  goTo: (p: Page) => void
  startBooking: (date?: string, time?: string) => void
  showDetails: (a: Appointment) => void
}) {
  const counts = {
    total: appointments.length + 3,
    scheduled: appointments.filter((a) => a.status === "Agendado").length + 1,
    progress: appointments.filter((a) => a.status === "Em andamento").length,
    done: appointments.filter((a) => a.status === "Concluído").length + 3,
  }
  const stats = [
    {
      label: "Total de atendimentos",
      value: counts.total.toString().padStart(2, "0"),
      icon: ListChecks,
      tone: "indigo",
    },
    {
      label: "Agendados",
      value: counts.scheduled.toString().padStart(2, "0"),
      icon: CalendarCheck,
      tone: "violet",
    },
    {
      label: "Em andamento",
      value: counts.progress.toString().padStart(2, "0"),
      icon: CircleDot,
      tone: "amber",
    },
    {
      label: "Concluídos",
      value: counts.done.toString().padStart(2, "0"),
      icon: CheckCircle2,
      tone: "green",
    },
  ]
  const next =
    appointments.find((a) => a.status === "Agendado") || appointments[0]
  return (
    <>
      <PageHeader
        title="Olá, Mariana!"
        subtitle="Acompanhe seus atendimentos e encontre o melhor horário para conversar com a coordenação."
        action={
          <Button icon={<Plus size={17} />} onClick={() => goTo("new")}>
            Agendar atendimento
          </Button>
        }
      />
      <section className="stats-grid" aria-label="Resumo dos atendimentos">
        {stats.map(({ label, value, icon: Icon, tone }) => (
          <article className="stat-card" key={label}>
            <span className={`stat-card__icon stat-card__icon--${tone}`}>
              <Icon size={20} />
            </span>
            <div>
              <p>{label}</p>
              <strong>{value}</strong>
            </div>
          </article>
        ))}
      </section>
      <div className="dashboard-grid">
        <section className="card next-card">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Próximo atendimento</span>
              <h2>{next.subject}</h2>
            </div>
            <StatusBadge status={next.status} />
          </div>
          <div className="next-card__details">
            <div>
              <span className="detail-icon">
                <Calendar size={18} />
              </span>
              <p>
                Data<strong>{next.dateLabel}</strong>
              </p>
            </div>
            <div>
              <span className="detail-icon">
                <Clock3 size={18} />
              </span>
              <p>
                Horário
                <strong>
                  {next.time} às {next.time === "14:00" ? "14:30" : "15:00"}
                </strong>
              </p>
            </div>
            <div>
              <span className="detail-icon">
                <MapPin size={18} />
              </span>
              <p>
                {next.modality}
                <strong>
                  {next.modality === "Presencial"
                    ? "Sala da Coordenação"
                    : "Link após confirmação"}
                </strong>
              </p>
            </div>
          </div>
          <div className="card-footer">
            <Button variant="secondary" onClick={() => showDetails(next)}>
              Ver detalhes
            </Button>
          </div>
        </section>
        <section className="card availability-card">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Disponibilidade</span>
              <h2>Próximos horários</h2>
            </div>
            <button className="text-link" onClick={() => goTo("agenda")}>
              Ver agenda <ArrowRight size={15} />
            </button>
          </div>
          <div className="quick-slots">
            {[
              ["2026-10-26", "09:00", "26 de outubro"],
              ["2026-10-27", "14:00", "27 de outubro"],
              ["2026-10-28", "10:30", "28 de outubro"],
            ].map(([date, time, label]) => (
              <button
                className="quick-slot"
                key={`${date}${time}`}
                onClick={() => startBooking(date, time)}
              >
                <span>
                  <Calendar size={17} />
                </span>
                <p>
                  {label}
                  <strong>{time.replace(":", "h")}</strong>
                </p>
                <ChevronRight size={17} />
              </button>
            ))}
          </div>
        </section>
      </div>
      <section className="card recent-card">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Histórico</span>
            <h2>Atendimentos recentes</h2>
          </div>
          <button className="text-link" onClick={() => goTo("appointments")}>
            Ver todos <ArrowRight size={15} />
          </button>
        </div>
        <div className="recent-list">
          {appointments.slice(1, 4).map((appointment) => (
            <button
              className="recent-row"
              key={appointment.id}
              onClick={() => showDetails(appointment)}
            >
              <span className="recent-row__icon">
                <BookOpen size={18} />
              </span>
              <span className="recent-row__subject">
                <strong>{appointment.subject}</strong>
                <small>
                  {shortDate(appointment.date)} • {appointment.time}
                </small>
              </span>
              <StatusBadge status={appointment.status} />
              <ChevronRight size={18} />
            </button>
          ))}
        </div>
      </section>
    </>
  )
}

function buildCalendar(year: number, month: number) {
  const firstDay = new Date(year, month, 1).getDay()
  const days = new Date(year, month + 1, 0).getDate()
  const previousDays = new Date(year, month, 0).getDate()
  return Array.from({ length: 42 }, (_, index) => {
    const dayOffset = index - firstDay + 1
    if (dayOffset < 1)
      return { day: previousDays + dayOffset, current: false, offset: -1 }
    if (dayOffset > days)
      return { day: dayOffset - days, current: false, offset: 1 }
    return { day: dayOffset, current: true, offset: 0 }
  })
}

function Agenda({
  startBooking,
}: {
  startBooking: (date?: string, time?: string) => void
}) {
  const [viewDate, setViewDate] = useState(new Date(2026, 9, 1))
  const [selectedDate, setSelectedDate] = useState("2026-10-26")
  const [selectedTime, setSelectedTime] = useState("09:00")
  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()
  const days = buildCalendar(year, month)
  const monthLabel = new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    year: "numeric",
  }).format(viewDate)
  const slots = AVAILABILITY[selectedDate] || []
  const moveMonth = (amount: number) => {
    const next = new Date(year, month + amount, 1)
    setViewDate(next)
    const prefix = `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, "0")}`
    const firstAvailable = Object.keys(AVAILABILITY).find((key) =>
      key.startsWith(prefix),
    )
    setSelectedDate(firstAvailable || "")
    setSelectedTime(firstAvailable ? AVAILABILITY[firstAvailable][0] : "")
  }
  return (
    <>
      <PageHeader
        title="Agenda da coordenação"
        subtitle="Consulte os dias e horários disponíveis para atendimento."
      />
      <div className="calendar-layout">
        <section className="card calendar-card">
          <div className="calendar-toolbar">
            <div className="month-control">
              <button aria-label="Mês anterior" onClick={() => moveMonth(-1)}>
                <ChevronLeft />
              </button>
              <h2 className="capitalize">{monthLabel}</h2>
              <button aria-label="Próximo mês" onClick={() => moveMonth(1)}>
                <ChevronRight />
              </button>
            </div>
            <Button
              variant="secondary"
              onClick={() => {
                setViewDate(new Date(2026, 9, 1))
                setSelectedDate("2026-10-26")
                setSelectedTime("09:00")
              }}
            >
              Hoje
            </Button>
          </div>
          <div className="calendar-weekdays">
            {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((d) => (
              <span key={d}>{d}</span>
            ))}
          </div>
          <div className="calendar-grid">
            {days.map((cell, index) => {
              const date = `${year}-${String(month + 1).padStart(2, "0")}-${String(cell.day).padStart(2, "0")}`
              const isAvailable = cell.current && Boolean(AVAILABILITY[date])
              const isPast =
                cell.current &&
                (year < 2026 ||
                  (year === 2026 &&
                    (month < 9 || (month === 9 && cell.day < 21))))
              return (
                <button
                  key={`${cell.day}-${index}`}
                  className={`calendar-day ${!cell.current ? "outside" : ""} ${
                    isPast ? "past" : ""
                  } ${isAvailable ? "available" : ""} ${
                    selectedDate === date ? "selected" : ""
                  }`}
                  disabled={!cell.current || isPast || !isAvailable}
                  onClick={() => {
                    setSelectedDate(date)
                    setSelectedTime("")
                  }}
                >
                  <span>{cell.day}</span>
                  {isAvailable && <small>Disponível</small>}
                </button>
              )
            })}
          </div>
          <div className="legend">
            <span>
              <i className="legend__dot selected-dot" /> Dia selecionado
            </span>
            <span>
              <i className="legend__dot available-dot" /> Horários disponíveis
            </span>
            <span>
              <i className="legend__dot unavailable-dot" /> Sem disponibilidade
            </span>
          </div>
        </section>
        <aside className="card slots-panel">
          <div className="slots-panel__icon">
            <CalendarCheck size={23} />
          </div>
          <span className="eyebrow">Data selecionada</span>
          <h2>{selectedDate ? formatDate(selectedDate) : "Nenhuma data"}</h2>
          <p>Selecione o melhor horário para seu atendimento.</p>
          <div className="slots-label">
            <Clock3 size={16} /> Horários disponíveis
          </div>
          {slots.length ? (
            <div className="time-grid">
              {slots.map((time) => (
                <button
                  key={time}
                  className={selectedTime === time ? "selected" : ""}
                  onClick={() => setSelectedTime(time)}
                >
                  {time}
                </button>
              ))}
            </div>
          ) : (
            <div className="empty-slots">
              Não há horários disponíveis nesta data.
            </div>
          )}
          <Button
            disabled={!selectedTime}
            onClick={() => startBooking(selectedDate, selectedTime)}
            className="full-button"
          >
            Continuar agendamento <ArrowRight size={17} />
          </Button>
          <small className="slots-hint">
            Os horários têm duração prevista de 30 minutos.
          </small>
        </aside>
      </div>
    </>
  )
}

type Draft = {
  subject: string
  modality: Modality | ""
  date: string
  time: string
  description: string
}

function NewAppointment({
  initialDraft,
  cancel,
  confirm,
}: {
  initialDraft: Draft
  cancel: () => void
  confirm: (draft: Draft) => void
}) {
  const [draft, setDraft] = useState(initialDraft)
  const [errors, setErrors] = useState(false)
  const update = (key: keyof Draft, value: string) => {
    setDraft((current) => {
      if (key === "date") return { ...current, date: value, time: "" }
      return { ...current, [key]: value }
    })
  }
  const valid = draft.subject && draft.modality && draft.date && draft.time
  const submit = (event: React.FormEvent) => {
    event.preventDefault()
    if (!valid) return setErrors(true)
    confirm(draft)
  }
  const availableDates = Object.keys(AVAILABILITY)
  const availableTimes = draft.date ? AVAILABILITY[draft.date] || [] : []
  return (
    <>
      <button className="back-link" onClick={cancel}>
        <ArrowLeft size={17} /> Voltar
      </button>
      <PageHeader
        title="Novo agendamento"
        subtitle="Preencha as informações para solicitar seu atendimento."
      />
      <form className="booking-layout" onSubmit={submit}>
        <section className="card form-card">
          <div className="form-section-title">
            <span>1</span>
            <div>
              <h2>Detalhes do atendimento</h2>
              <p>Conte-nos como a coordenação pode ajudar.</p>
            </div>
          </div>
          <label className="field">
            <span>
              Assunto do atendimento <b>*</b>
            </span>
            <select
              value={draft.subject}
              onChange={(e) => update("subject", e.target.value)}
              className={errors && !draft.subject ? "error" : ""}
            >
              <option value="">Selecione um assunto</option>
              {SUBJECTS.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
            {errors && !draft.subject && (
              <small className="error-text">
                Selecione o assunto do atendimento.
              </small>
            )}
          </label>
          <fieldset className="field modality-field">
            <legend>
              Modalidade <b>*</b>
            </legend>
            <div className="modality-options">
              <button
                type="button"
                className={draft.modality === "Presencial" ? "selected" : ""}
                onClick={() => update("modality", "Presencial")}
              >
                <span>
                  <MapPin size={21} />
                </span>
                <p>
                  <strong>Presencial</strong>
                  <small>Atendimento na instituição.</small>
                </p>
                {draft.modality === "Presencial" && (
                  <i>
                    <Check size={13} />
                  </i>
                )}
              </button>
              <button
                type="button"
                className={draft.modality === "Online" ? "selected" : ""}
                onClick={() => update("modality", "Online")}
              >
                <span>
                  <Video size={21} />
                </span>
                <p>
                  <strong>Online</strong>
                  <small>Atendimento por videoconferência.</small>
                </p>
                {draft.modality === "Online" && (
                  <i>
                    <Check size={13} />
                  </i>
                )}
              </button>
            </div>
            {errors && !draft.modality && (
              <small className="error-text">Selecione uma modalidade.</small>
            )}
          </fieldset>
          <div className="form-section-title form-section-title--second">
            <span>2</span>
            <div>
              <h2>Data e horário</h2>
              <p>Escolha uma opção disponível na agenda.</p>
            </div>
          </div>
          <div className="field-row">
            <label className="field">
              <span>
                Data do atendimento <b>*</b>
              </span>
              <select
                value={draft.date}
                onChange={(e) => update("date", e.target.value)}
                className={errors && !draft.date ? "error" : ""}
              >
                <option value="">Selecione uma data</option>
                {availableDates.map((date) => (
                  <option value={date} key={date}>
                    {formatDate(date)}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              <span>
                Horário <b>*</b>
              </span>
              <select
                value={draft.time}
                disabled={!draft.date}
                onChange={(e) => update("time", e.target.value)}
                className={errors && !draft.time ? "error" : ""}
              >
                <option value="">Selecione um horário</option>
                {availableTimes.map((time) => (
                  <option key={time}>{time}</option>
                ))}
              </select>
            </label>
          </div>
          {errors && (!draft.date || !draft.time) && (
            <small className="error-text form-error">
              Selecione uma data e um horário disponíveis.
            </small>
          )}
          <label className="field">
            <span>Descrição da solicitação</span>
            <textarea
              rows={5}
              value={draft.description}
              onChange={(e) => update("description", e.target.value)}
              placeholder="Descreva brevemente o motivo do atendimento para que a coordenação possa se preparar."
            />
            <small className="field-hint">
              {draft.description.length}/500 caracteres
            </small>
          </label>
        </section>
        <aside className="booking-side">
          <section className="card summary-card">
            <div className="summary-card__header">
              <span>
                <ListChecks size={19} />
              </span>
              <div>
                <h2>Resumo do agendamento</h2>
                <p>Confira os dados antes de confirmar.</p>
              </div>
            </div>
            <dl>
              <div>
                <dt>Atendimento</dt>
                <dd>Coordenação do curso</dd>
              </div>
              <div>
                <dt>Assunto</dt>
                <dd className={!draft.subject ? "placeholder" : ""}>
                  {draft.subject || "Não selecionado"}
                </dd>
              </div>
              <div>
                <dt>Data</dt>
                <dd className={!draft.date ? "placeholder" : ""}>
                  {draft.date ? formatDate(draft.date) : "Não selecionada"}
                </dd>
              </div>
              <div>
                <dt>Horário</dt>
                <dd className={!draft.time ? "placeholder" : ""}>
                  {draft.time
                    ? `${draft.time} — 30 minutos`
                    : "Não selecionado"}
                </dd>
              </div>
              <div>
                <dt>Modalidade</dt>
                <dd className={!draft.modality ? "placeholder" : ""}>
                  {draft.modality || "Não selecionada"}
                </dd>
              </div>
              {draft.modality && (
                <div>
                  <dt>
                    {draft.modality === "Presencial" ? "Local" : "Acesso"}
                  </dt>
                  <dd>
                    {draft.modality === "Presencial"
                      ? "Sala da Coordenação"
                      : "Link disponibilizado após confirmação"}
                  </dd>
                </div>
              )}
            </dl>
          </section>
          {errors && !valid && (
            <div className="validation-message">
              <CircleDot size={18} />
              <p>
                <strong>Revise os campos obrigatórios</strong>
                <span>Preencha os itens destacados para continuar.</span>
              </p>
            </div>
          )}
          <div className="booking-actions">
            <Button variant="secondary" onClick={cancel}>
              Cancelar
            </Button>
            <Button type="submit" disabled={!valid}>
              Confirmar agendamento
            </Button>
          </div>
          <p className="privacy-note">
            Ao confirmar, sua solicitação será enviada à coordenação do curso.
          </p>
        </aside>
      </form>
    </>
  )
}

function Success({
  appointment,
  goTo,
}: {
  appointment: Appointment
  goTo: (p: Page) => void
}) {
  return (
    <div className="success-page">
      <div className="success-icon">
        <Check size={32} />
      </div>
      <span className="eyebrow">Solicitação confirmada</span>
      <h1>Agendamento realizado!</h1>
      <p>Seu atendimento com a coordenação foi agendado com sucesso.</p>
      <section className="card success-summary">
        <div className="success-summary__top">
          <div>
            <span>Protocolo</span>
            <strong>#AG-{String(appointment.id).padStart(4, "0")}</strong>
          </div>
          <StatusBadge status="Agendado" />
        </div>
        <dl>
          <div>
            <dt>Assunto</dt>
            <dd>{appointment.subject}</dd>
          </div>
          <div>
            <dt>Data</dt>
            <dd>{appointment.dateLabel}</dd>
          </div>
          <div>
            <dt>Horário</dt>
            <dd>
              {appointment.time} às {appointment.time.slice(0, 3)}30
            </dd>
          </div>
          <div>
            <dt>Modalidade</dt>
            <dd>{appointment.modality}</dd>
          </div>
          <div>
            <dt>
              {appointment.modality === "Presencial" ? "Local" : "Acesso"}
            </dt>
            <dd>
              {appointment.modality === "Presencial"
                ? "Sala da Coordenação"
                : "Link enviado após confirmação"}
            </dd>
          </div>
        </dl>
      </section>
      <div className="success-actions">
        <Button onClick={() => goTo("appointments")}>
          Ver meus atendimentos
        </Button>
        <Button variant="secondary" onClick={() => goTo("dashboard")}>
          Voltar ao início
        </Button>
      </div>
    </div>
  )
}

function Appointments({
  appointments,
  showDetails,
}: {
  appointments: Appointment[]
  showDetails: (appointment: Appointment) => void
}) {
  const [filter, setFilter] = useState<"Todos" | Status>("Todos")
  const [search, setSearch] = useState("")
  const filtered = appointments.filter(
    (a) =>
      (filter === "Todos" || a.status === filter) &&
      a.subject.toLowerCase().includes(search.toLowerCase()),
  )
  return (
    <>
      <PageHeader
        title="Meus atendimentos"
        subtitle="Consulte seus agendamentos e acompanhe o andamento das solicitações."
      />
      <section className="card appointments-card">
        <div className="appointments-toolbar">
          <div className="tabs">
            {([
              "Todos",
              "Agendado",
              "Em andamento",
              "Concluído",
              "Cancelado",
            ] as const).map((item) => (
              <button
                key={item}
                className={filter === item ? "active" : ""}
                onClick={() => setFilter(item)}
              >
                {item}
                {item === "Todos" && <span>{appointments.length}</span>}
              </button>
            ))}
          </div>
          <label className="search">
            <Search size={17} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por assunto"
            />
          </label>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Assunto</th>
                <th>Data e horário</th>
                <th>Modalidade</th>
                <th>Situação</th>
                <th>
                  <span className="sr-only">Ações</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((appointment) => (
                <tr key={appointment.id}>
                  <td>
                    <div className="subject-cell">
                      <span>
                        <BookOpen size={18} />
                      </span>
                      <strong>{appointment.subject}</strong>
                    </div>
                  </td>
                  <td>
                    <strong>{shortDate(appointment.date)}</strong>
                    <small>{appointment.time}</small>
                  </td>
                  <td>
                    <span className="modality-cell">
                      {appointment.modality === "Online" ? (
                        <Monitor size={16} />
                      ) : (
                        <MapPin size={16} />
                      )}
                      {appointment.modality}
                    </span>
                  </td>
                  <td>
                    <StatusBadge status={appointment.status} />
                  </td>
                  <td>
                    <button
                      className="details-button"
                      onClick={() => showDetails(appointment)}
                    >
                      Ver detalhes <ChevronRight size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!filtered.length && (
            <div className="empty-state">
              <Search size={24} />
              <h3>Nenhum atendimento encontrado</h3>
              <p>Tente ajustar o filtro ou o termo de busca.</p>
            </div>
          )}
        </div>
        <div className="table-footer">
          Exibindo {filtered.length} de {appointments.length} atendimentos
        </div>
      </section>
    </>
  )
}

function DetailsDrawer({
  appointment,
  close,
  requestCancel,
}: {
  appointment: Appointment
  close: () => void
  requestCancel: () => void
}) {
  return (
    <div
      className="overlay"
      role="presentation"
      onMouseDown={(e) => e.target === e.currentTarget && close()}
    >
      <aside
        className="drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Detalhes do atendimento"
      >
        <div className="drawer__header">
          <div>
            <span className="eyebrow">Detalhes do atendimento</span>
            <h2>{appointment.subject}</h2>
          </div>
          <button aria-label="Fechar" onClick={close}>
            <X />
          </button>
        </div>
        <div className="drawer__body">
          <div className="drawer-status">
            <StatusBadge status={appointment.status} />
            <span>Protocolo #AG-{String(appointment.id).padStart(4, "0")}</span>
          </div>
          <section>
            <h3>Informações do agendamento</h3>
            <dl className="details-list">
              <div>
                <dt>
                  <Calendar size={17} /> Data
                </dt>
                <dd>{appointment.dateLabel}</dd>
              </div>
              <div>
                <dt>
                  <Clock3 size={17} /> Horário
                </dt>
                <dd>{appointment.time} • 30 minutos</dd>
              </div>
              <div>
                <dt>
                  {appointment.modality === "Online" ? (
                    <Video size={17} />
                  ) : (
                    <MapPin size={17} />
                  )}{" "}
                  Modalidade
                </dt>
                <dd>{appointment.modality}</dd>
              </div>
              <div>
                <dt>
                  <UserRound size={17} /> Responsável
                </dt>
                <dd>Coordenação do curso</dd>
              </div>
            </dl>
          </section>
          <section>
            <h3>Descrição enviada</h3>
            <p className="description-box">{appointment.description}</p>
          </section>
          <section>
            <h3>Resultado ou encaminhamento</h3>
            {appointment.outcome ? (
              <div className="outcome-box">
                <CheckCircle2 size={18} />
                <p>{appointment.outcome}</p>
              </div>
            ) : (
              <p className="description-box muted">
                O resultado ainda não foi registrado pela coordenação.
              </p>
            )}
          </section>
        </div>
        <div className="drawer__footer">
          {appointment.status === "Agendado" && (
            <Button variant="danger" onClick={requestCancel}>
              Cancelar agendamento
            </Button>
          )}
          <Button variant="secondary" onClick={close}>
            Fechar
          </Button>
        </div>
      </aside>
    </div>
  )
}

function CancelModal({
  appointment,
  close,
  confirm,
}: {
  appointment: Appointment
  close: () => void
  confirm: () => void
}) {
  return (
    <div className="overlay overlay--center">
      <section className="modal" role="alertdialog" aria-modal="true">
        <div className="modal__icon">
          <Calendar size={22} />
        </div>
        <h2>Cancelar agendamento?</h2>
        <p>
          Você está prestes a cancelar <strong>{appointment.subject}</strong>,
          em {shortDate(appointment.date)} às {appointment.time}. Esta ação não
          poderá ser desfeita.
        </p>
        <div className="modal__actions">
          <Button variant="secondary" onClick={close}>
            Manter agendamento
          </Button>
          <Button variant="danger" onClick={confirm}>
            Sim, cancelar
          </Button>
        </div>
      </section>
    </div>
  )
}

export default function App() {
  const [authenticated, setAuthenticated] = useState(false)
  const [page, setPage] = useState<Page>("dashboard")
  const [appointments, setAppointments] = useState(INITIAL_APPOINTMENTS)
  const [draft, setDraft] = useState<Draft>({
    subject: "",
    modality: "",
    date: "",
    time: "",
    description: "",
  })
  const [lastAppointment, setLastAppointment] = useState(
    INITIAL_APPOINTMENTS[0],
  )
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null)
  const [cancelCandidate, setCancelCandidate] = useState<Appointment | null>(
    null,
  )

  const currentSelected = useMemo(
    () =>
      selectedAppointment
        ? appointments.find((a) => a.id === selectedAppointment.id) ||
          selectedAppointment
        : null,
    [appointments, selectedAppointment],
  )

  const startBooking = (date = "", time = "") => {
    setDraft({ subject: "", modality: "", date, time, description: "" })
    setPage("new")
  }
  const createAppointment = (data: Draft) => {
    const created: Appointment = {
      id: Math.max(...appointments.map((a) => a.id)) + 1,
      subject: data.subject,
      date: data.date,
      dateLabel: formatDate(data.date),
      time: data.time,
      modality: data.modality as Modality,
      status: "Agendado",
      description:
        data.description || "Nenhuma descrição adicional foi informada.",
    }
    setAppointments((current) => [created, ...current])
    setLastAppointment(created)
    setPage("success")
  }
  const confirmCancellation = () => {
    if (!cancelCandidate) return
    setAppointments((current) =>
      current.map((a) =>
        a.id === cancelCandidate.id
          ? { ...a, status: "Cancelado" as Status }
          : a,
      ),
    )
    setCancelCandidate(null)
    setSelectedAppointment(null)
  }

  if (!authenticated) {
    return (
      <Login
        onLogin={() => {
          setAuthenticated(true)
          setPage("dashboard")
        }}
      />
    )
  }

  return (
    <AppShell
      page={page}
      setPage={setPage}
      onLogout={() => {
        setAuthenticated(false)
        setPage("dashboard")
        setSelectedAppointment(null)
        setCancelCandidate(null)
      }}
    >
      {page === "dashboard" && (
        <Dashboard
          appointments={appointments}
          goTo={setPage}
          startBooking={startBooking}
          showDetails={setSelectedAppointment}
        />
      )}
      {page === "agenda" && <Agenda startBooking={startBooking} />}
      {page === "new" && (
        <NewAppointment
          key={`${draft.date}-${draft.time}`}
          initialDraft={draft}
          cancel={() => setPage("dashboard")}
          confirm={createAppointment}
        />
      )}
      {page === "success" && (
        <Success appointment={lastAppointment} goTo={setPage} />
      )}
      {page === "appointments" && (
        <Appointments
          appointments={appointments}
          showDetails={setSelectedAppointment}
        />
      )}
      {currentSelected && (
        <DetailsDrawer
          appointment={currentSelected}
          close={() => setSelectedAppointment(null)}
          requestCancel={() => setCancelCandidate(currentSelected)}
        />
      )}
      {cancelCandidate && (
        <CancelModal
          appointment={cancelCandidate}
          close={() => setCancelCandidate(null)}
          confirm={confirmCancellation}
        />
      )}
    </AppShell>
  )
}
