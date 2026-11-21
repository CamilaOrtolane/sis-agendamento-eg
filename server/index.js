import express from 'express'
import cors from 'cors'
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const DATA_FILE = path.join(__dirname, 'data', 'appointments.json')
const PORT = Number(process.env.PORT || 4000)
const app = express()

app.use(cors())
app.use(express.json())

const allowedStatuses = ['Agendado', 'Em andamento', 'Concluído', 'Cancelado']
const allowedModalities = ['Presencial', 'Online']

async function ensureDataFile() {
  try {
    await fs.access(DATA_FILE)
  } catch {
    await fs.mkdir(path.dirname(DATA_FILE), { recursive: true })
    await fs.writeFile(DATA_FILE, '[]')
  }
}

async function readAppointments() {
  await ensureDataFile()
  const content = await fs.readFile(DATA_FILE, 'utf8')
  return JSON.parse(content)
}

async function writeAppointments(appointments) {
  await ensureDataFile()
  await fs.writeFile(DATA_FILE, JSON.stringify(appointments, null, 2))
}

function normalizeAppointment(body) {
  const subject = String(body.subject || '').trim()
  const date = String(body.date || '').trim()
  const time = String(body.time || '').trim()
  const modality = String(body.modality || '').trim()
  const description = String(body.description || '').trim()

  if (!subject || !date || !time || !modality) {
    const error = new Error('subject, date, time e modality são obrigatórios.')
    error.statusCode = 400
    throw error
  }

  if (!allowedModalities.includes(modality)) {
    const error = new Error('modality deve ser Presencial ou Online.')
    error.statusCode = 400
    throw error
  }

  return {
    subject,
    date,
    time,
    modality,
    description,
  }
}

app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    message: 'API da Agenda Acadêmica online',
    timestamp: new Date().toISOString(),
  })
})

app.get('/api/appointments', async (req, res) => {
  try {
    const appointments = await readAppointments()
    res.json(appointments)
  } catch (error) {
    res.status(500).json({ ok: false, message: error.message })
  }
})

app.post('/api/appointments', async (req, res) => {
  try {
    const payload = normalizeAppointment(req.body)
    const appointments = await readAppointments()

    const nextId = appointments.length ? Math.max(...appointments.map((item) => Number(item.id || 0))) + 1 : 1

    const newAppointment = {
      id: nextId,
      ...payload,
      status: 'Agendado',
      outcome: '',
      createdAt: new Date().toISOString(),
    }

    appointments.push(newAppointment)
    await writeAppointments(appointments)

    res.status(201).json(newAppointment)
  } catch (error) {
    const status = error.statusCode || 500
    res.status(status).json({ ok: false, message: error.message })
  }
})

app.patch('/api/appointments/:id/status', async (req, res) => {
  try {
    const { id } = req.params
    const nextStatus = String(req.body.status || '').trim()

    if (!allowedStatuses.includes(nextStatus)) {
      const error = new Error('status inválido.')
      error.statusCode = 400
      throw error
    }

    const appointments = await readAppointments()
    const appointment = appointments.find((item) => String(item.id) === String(id))

    if (!appointment) {
      const error = new Error('agendamento não encontrado.')
      error.statusCode = 404
      throw error
    }

    appointment.status = nextStatus
    await writeAppointments(appointments)

    res.json(appointment)
  } catch (error) {
    const status = error.statusCode || 500
    res.status(status).json({ ok: false, message: error.message })
  }
})

app.delete('/api/appointments/:id', async (req, res) => {
  try {
    const { id } = req.params
    const appointments = await readAppointments()
    const filtered = appointments.filter((item) => String(item.id) !== String(id))

    if (filtered.length === appointments.length) {
      const error = new Error('agendamento não encontrado.')
      error.statusCode = 404
      throw error
    }

    await writeAppointments(filtered)
    res.json({ ok: true, deletedId: Number(id) })
  } catch (error) {
    const status = error.statusCode || 500
    res.status(status).json({ ok: false, message: error.message })
  }
})

app.use((err, req, res, next) => {
  console.error(err)
  res.status(err.statusCode || 500).json({ ok: false, message: err.message || 'Erro interno do servidor.' })
})

app.listen(PORT, () => {
  console.log(`API iniciada em http://localhost:${PORT}`)
})
